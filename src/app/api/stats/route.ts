import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const role = (session.user as any).role
  const userId = (session.user as any).id
  const barberFilter: any = role === "ADMIN" ? {} : { barberId: userId }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 86400000)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

  // ── All queries in parallel ──────────────────────────────────────────────
  const [
    monthCompleted,
    prevMonthCompleted,
    todayAppointments,
    noShowCount,
    totalMonthCount,
    revenueByMonth,
    weekdayStats,
    serviceGrouped,
    hourlyData,
    topClientsRaw,
    allMonthClientIds,
    returningClientIds,
  ] = await Promise.all([
    // This month completed
    prisma.appointment.findMany({
      where: { date: { gte: startOfMonth }, status: "COMPLETED", ...barberFilter },
      include: { service: { select: { price: true, name: true } } },
    }),
    // Previous month completed
    prisma.appointment.findMany({
      where: { date: { gte: startOfPrevMonth, lt: startOfMonth }, status: "COMPLETED", ...barberFilter },
      include: { service: { select: { price: true } } },
    }),
    // Today's appointments
    prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        ...barberFilter,
      },
      include: { service: true, user: true, barber: { select: { id: true, name: true } } },
      orderBy: { date: "asc" },
    }),
    // No-shows this month
    prisma.appointment.count({
      where: { date: { gte: startOfMonth }, status: "NO_SHOW", ...barberFilter },
    }),
    // Total this month (excluding cancelled)
    prisma.appointment.count({
      where: { date: { gte: startOfMonth }, status: { not: "CANCELLED" }, ...barberFilter },
    }),
    // Revenue last 6 months (completed)
    prisma.appointment.findMany({
      where: { date: { gte: sixMonthsAgo }, status: "COMPLETED", ...barberFilter },
      include: { service: { select: { price: true } } },
    }),
    // Appointments by weekday (last 6 months, excluding cancelled)
    prisma.appointment.findMany({
      where: { date: { gte: sixMonthsAgo }, status: { not: "CANCELLED" }, ...barberFilter },
      select: { date: true },
    }),
    // This month service breakdown
    prisma.appointment.findMany({
      where: { date: { gte: startOfMonth }, status: "COMPLETED", ...barberFilter },
      include: { service: { select: { name: true, price: true } } },
    }),
    // Hourly distribution last 30 days
    prisma.appointment.findMany({
      where: { date: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" }, ...barberFilter },
      select: { date: true },
    }),
    // Top clients last 3 months
    prisma.appointment.groupBy({
      by: ["userId"],
      where: { date: { gte: threeMonthsAgo }, status: "COMPLETED", ...barberFilter },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    // Unique client IDs this month
    prisma.appointment.findMany({
      where: { date: { gte: startOfMonth }, status: { not: "CANCELLED" }, ...barberFilter },
      select: { userId: true },
      distinct: ["userId"],
    }),
    // Which of those clients had appointments before this month (returning)
    prisma.appointment.findMany({
      where: { date: { lt: startOfMonth }, status: { not: "CANCELLED" }, ...barberFilter },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ])

  // ── Revenue KPIs ──────────────────────────────────────────────────────────
  const monthRevenue = monthCompleted.reduce((s, a) => s + a.service.price, 0)
  const prevMonthRevenue = prevMonthCompleted.reduce((s, a) => s + a.service.price, 0)
  const completedCount = monthCompleted.length
  const prevCompletedCount = prevMonthCompleted.length
  const avgTicket = completedCount > 0 ? monthRevenue / completedCount : 0
  const prevAvgTicket = prevCompletedCount > 0 ? prevMonthRevenue / prevCompletedCount : 0

  const revenueTrend = prevMonthRevenue > 0
    ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
    : null
  const completedTrend = prevCompletedCount > 0
    ? Math.round(((completedCount - prevCompletedCount) / prevCompletedCount) * 100)
    : null

  // Month projection based on days elapsed
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth = now.getDate()
  const monthProjection = dayOfMonth > 0 ? Math.round((monthRevenue / dayOfMonth) * daysInMonth) : 0

  // ── Monthly revenue chart ─────────────────────────────────────────────────
  const monthlyRevenue: { month: string; revenue: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = m.toLocaleString("es-CO", { month: "short" })
    const revenue = revenueByMonth
      .filter((a) => {
        const d = new Date(a.date)
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()
      })
      .reduce((s, a) => s + a.service.price, 0)
    monthlyRevenue.push({ month: monthName, revenue })
  }

  // ── By weekday ────────────────────────────────────────────────────────────
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const byWeekday = days.map((day, i) => ({
    day,
    count: weekdayStats.filter((a) => new Date(a.date).getDay() === i).length,
  }))

  // ── Service breakdown ─────────────────────────────────────────────────────
  const serviceMap = new Map<string, { name: string; count: number; revenue: number }>()
  for (const apt of serviceGrouped) {
    const key = apt.service.name
    if (!serviceMap.has(key)) serviceMap.set(key, { name: key, count: 0, revenue: 0 })
    const e = serviceMap.get(key)!
    e.count++
    e.revenue += apt.service.price
  }
  const byService = Array.from(serviceMap.values()).sort((a, b) => b.revenue - a.revenue)

  // Top service
  const topService = byService[0]?.name || "N/A"

  // ── Hourly heatmap (Colombia = UTC-5) ─────────────────────────────────────
  const hourCounts: number[] = new Array(24).fill(0)
  for (const apt of hourlyData) {
    const colHour = new Date(new Date(apt.date).getTime() - 5 * 60 * 60 * 1000).getUTCHours()
    if (colHour >= 0 && colHour < 24) hourCounts[colHour]++
  }
  const byHour = hourCounts.map((count, h) => ({
    hour: h,
    label: h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`,
    count,
  })).filter((h) => h.hour >= 7 && h.hour <= 20) // Show 7am–8pm

  // ── Top clients ───────────────────────────────────────────────────────────
  const topClientIds = topClientsRaw.map((c) => c.userId)
  const [topClientUsers, topClientRevData] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: topClientIds } },
      select: { id: true, name: true, phone: true },
    }),
    prisma.appointment.findMany({
      where: { userId: { in: topClientIds }, date: { gte: threeMonthsAgo }, status: "COMPLETED", ...barberFilter },
      include: { service: { select: { price: true } } },
    }),
  ])
  const topClients = topClientsRaw.map((c) => {
    const user = topClientUsers.find((u) => u.id === c.userId)
    const revenue = topClientRevData.filter((a) => a.userId === c.userId).reduce((s, a) => s + a.service.price, 0)
    return { name: user?.name || "Cliente", count: c._count.id, revenue }
  })

  // ── New vs returning clients ───────────────────────────────────────────────
  const returningSet = new Set(returningClientIds.map((a) => a.userId))
  const uniqueMonthIds = allMonthClientIds.map((a) => a.userId)
  const newClientsCount = uniqueMonthIds.filter((id) => !returningSet.has(id)).length
  const returningClientsCount = uniqueMonthIds.filter((id) => returningSet.has(id)).length

  // ── No-show rate ──────────────────────────────────────────────────────────
  const noShowRate = totalMonthCount > 0 ? ((noShowCount / totalMonthCount) * 100).toFixed(1) : "0"

  return NextResponse.json({
    // KPIs
    monthRevenue,
    prevMonthRevenue,
    revenueTrend,
    completedCount,
    prevCompletedCount,
    completedTrend,
    avgTicket,
    prevAvgTicket,
    monthProjection,
    noShowCount,
    noShowRate,
    topService,
    newClientsCount,
    returningClientsCount,
    // Charts
    todayAppointments,
    monthlyRevenue,
    byWeekday,
    byService,
    byHour,
    topClients,
  })
}
