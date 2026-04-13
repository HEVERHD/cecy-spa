import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendReminder24hEmail } from "@/lib/resend"
import { formatDate, formatTime } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const from24h = new Date(now.getTime() + 23 * 60 * 60 * 1000)
  const to24h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: from24h, lte: to24h },
      status: { in: ["PENDING", "CONFIRMED"] },
      reminded24h: false,
    },
    include: {
      user: true,
      service: true,
      barber: { include: { barberSettings: true } },
    },
  })

  console.log("📅 24H Reminders:", appointments.length)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || ""
  let sent = 0

  for (const apt of appointments) {
    const shopName = (apt.barber as any).barberSettings?.shopName || "Mi Spa"
    const appointmentLink = baseUrl ? `${baseUrl}/cita/${apt.token}` : ""
    const clientName = apt.user.name || "Cliente"

    if (apt.user.email) {
      try {
        await sendReminder24hEmail({
          to: apt.user.email,
          clientName,
          serviceName: apt.service.name,
          date: formatDate(apt.date),
          time: formatTime(apt.date),
          shopName,
          appointmentLink,
        })
        console.log("📩 Email recordatorio 24h:", apt.user.email)
        await prisma.appointment.update({
          where: { id: apt.id },
          data: { reminded24h: true },
        })
        sent++
      } catch (err: any) {
        console.error("❌ Error email 24h:", err.message)
      }
    } else {
      // Sin email — marcar para no reintentar
      await prisma.appointment.update({
        where: { id: apt.id },
        data: { reminded24h: true },
      })
      console.warn("⚠️ Sin email 24h:", apt.id)
    }
  }

  return NextResponse.json({
    success: true,
    processed: appointments.length,
    sent,
    timestamp: now.toISOString(),
  })
}
