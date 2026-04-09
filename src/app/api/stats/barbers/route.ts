import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const role = (session.user as any).role
  if (role !== "ADMIN") return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Fetch all barbers
  const barbers = await prisma.user.findMany({
    where: {
      role: { in: ["BARBER", "ADMIN"] },
      barberSettings: { isNot: null },
    },
    select: {
      id: true,
      name: true,
      image: true,
      avatarUrl: true,
      specialty: true,
    },
    orderBy: { createdAt: "asc" },
  })

  // Fetch this month's completed appointments for all barbers
  const [thisMonthApts, prevMonthApts] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        status: "COMPLETED",
        date: { gte: startOfMonth },
      },
      select: {
        barberId: true,
        userId: true,
        service: { select: { price: true } },
      },
    }),
    prisma.appointment.findMany({
      where: {
        status: "COMPLETED",
        date: { gte: startOfPrevMonth, lt: startOfMonth },
      },
      select: {
        barberId: true,
        service: { select: { price: true } },
      },
    }),
  ])

  const result = barbers.map((barber) => {
    const thisMonth = thisMonthApts.filter((a) => a.barberId === barber.id)
    const prevMonth = prevMonthApts.filter((a) => a.barberId === barber.id)

    const revenue = thisMonth.reduce((sum, a) => sum + (a.service?.price ?? 0), 0)
    const prevRevenue = prevMonth.reduce((sum, a) => sum + (a.service?.price ?? 0), 0)
    const uniqueClients = new Set(thisMonth.map((a) => a.userId)).size

    const revenueTrend =
      prevRevenue === 0
        ? null
        : Math.round(((revenue - prevRevenue) / prevRevenue) * 100)

    return {
      id: barber.id,
      name: barber.name,
      image: barber.avatarUrl || barber.image,
      specialty: barber.specialty,
      thisMonth: {
        completedCount: thisMonth.length,
        revenue,
        uniqueClients,
      },
      prevMonth: {
        completedCount: prevMonth.length,
        revenue: prevRevenue,
      },
      revenueTrend,
    }
  })

  // Sort by revenue desc
  result.sort((a, b) => b.thisMonth.revenue - a.thisMonth.revenue)

  return NextResponse.json(result)
}
