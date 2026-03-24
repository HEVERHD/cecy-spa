import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const role = (session.user as any).role
  const userId = (session.user as any).id

  const appointments = await prisma.appointment.findMany({
    where: role === "ADMIN" ? {} : { barberId: userId },
    include: {
      user: { select: { name: true, phone: true } },
      service: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 80,
  })

  const events = appointments.map((apt) => {
    let type: "booked" | "cancelled" | "completed" | "noshow" | "confirmed"
    if (apt.status === "CANCELLED") type = "cancelled"
    else if (apt.status === "COMPLETED") type = "completed"
    else if (apt.status === "NO_SHOW") type = "noshow"
    else if (apt.status === "CONFIRMED") type = "confirmed"
    else type = "booked"

    return {
      id: apt.id,
      type,
      clientName: apt.user.name || "Cliente",
      clientPhone: apt.user.phone,
      serviceName: apt.service.name,
      appointmentDate: apt.date,
      bookedBy: apt.bookedBy,
      eventAt: type === "booked" ? apt.createdAt : apt.updatedAt,
    }
  })

  // Sort by eventAt desc
  events.sort((a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime())

  return NextResponse.json(events)
}
