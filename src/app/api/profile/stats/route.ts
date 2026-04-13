import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = (session.user as any)?.id
  const role = (session.user as any)?.role
  const now = new Date()

  // ── Date boundaries ─────────────────────────────────────────
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  // Quincena boundaries (1–15 = Q1, 16–end = Q2)
  const day = now.getDate()
  const isQ1 = day <= 15
  const qStart = isQ1
    ? new Date(now.getFullYear(), now.getMonth(), 1)
    : new Date(now.getFullYear(), now.getMonth(), 16)
  const qEnd = isQ1
    ? new Date(now.getFullYear(), now.getMonth(), 16)   // exclusive
    : new Date(now.getFullYear(), now.getMonth() + 1, 1) // exclusive

  // Previous quincena boundaries
  const prevQStart = isQ1
    ? new Date(now.getFullYear(), now.getMonth() - 1, 16)
    : new Date(now.getFullYear(), now.getMonth(), 1)
  const prevQEnd = isQ1
    ? new Date(now.getFullYear(), now.getMonth(), 1)
    : new Date(now.getFullYear(), now.getMonth(), 16)

  // For ADMIN: show all appointments; for BARBER: only own
  const barberWhere = role === "ADMIN" ? {} : { barberId: userId }

  const [
    totalAppointments,
    completedToday,
    monthCompleted,
    quinceCompleted,
    prevQuinceCompleted,
    totalClients,
    allMonthCount,
    topServiceResult,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { ...barberWhere, status: { not: "CANCELLED" } },
    }),
    prisma.appointment.count({
      where: { ...barberWhere, date: { gte: startOfDay, lt: endOfDay }, status: "COMPLETED" },
    }),
    prisma.appointment.findMany({
      where: { ...barberWhere, date: { gte: startOfMonth }, status: "COMPLETED" },
      select: { service: { select: { price: true, commissionRate: true } } },
    }),
    prisma.appointment.findMany({
      where: { ...barberWhere, date: { gte: qStart, lt: qEnd }, status: "COMPLETED" },
      select: { service: { select: { price: true, commissionRate: true } } },
    }),
    prisma.appointment.findMany({
      where: { ...barberWhere, date: { gte: prevQStart, lt: prevQEnd }, status: "COMPLETED" },
      select: { service: { select: { price: true, commissionRate: true } } },
    }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.appointment.count({
      where: { ...barberWhere, date: { gte: startOfMonth }, status: { not: "CANCELLED" } },
    }),
    prisma.appointment.groupBy({
      by: ["serviceId"],
      where: { ...barberWhere, status: { not: "CANCELLED" } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    }),
  ])

  const earn = (apts: { service: { price: number; commissionRate: number } | null }[]) =>
    apts.reduce((sum, a) => sum + (a.service?.price ?? 0) * (a.service?.commissionRate ?? 0.5), 0)

  const monthRevenue = earn(monthCompleted)
  const quinceEarnings = earn(quinceCompleted)
  const prevQuinceEarnings = earn(prevQuinceCompleted)

  // Completion rate
  const [totalNonCancelled, totalCompleted] = await Promise.all([
    prisma.appointment.count({ where: { ...barberWhere, status: { not: "CANCELLED" } } }),
    prisma.appointment.count({ where: { ...barberWhere, status: "COMPLETED" } }),
  ])
  const completionRate = totalNonCancelled > 0
    ? ((totalCompleted / totalNonCancelled) * 100).toFixed(0)
    : "0"

  // Average per day (last 30 days)
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const last30 = await prisma.appointment.count({
    where: { ...barberWhere, date: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
  })
  const avgPerDay = Math.round(last30 / 30)

  // Top service name
  let topService = "N/A"
  if (topServiceResult.length > 0) {
    const svc = await prisma.service.findUnique({ where: { id: topServiceResult[0].serviceId } })
    if (svc) topService = svc.name
  }

  return NextResponse.json({
    totalAppointments,
    completedToday,
    monthRevenue,
    totalClients,
    avgPerDay,
    topService,
    completionRate,
    allMonthCount,
    quincena: {
      label: isQ1 ? "1 – 15" : "16 – fin",
      earnings: quinceEarnings,
      count: quinceCompleted.length,
      prevEarnings: prevQuinceEarnings,
      prevCount: prevQuinceCompleted.length,
      prevLabel: isQ1 ? "16–fin mes ant." : "1–15 este mes",
    },
  })
}
