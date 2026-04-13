import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendReminderEmail } from "@/lib/resend"
import { formatTime } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000)
  const windowStart = new Date(inOneHour.getTime() - 2 * 60 * 1000)
  const windowEnd = new Date(inOneHour.getTime() + 2 * 60 * 1000)

  const appointments = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      date: { gte: windowStart, lte: windowEnd },
      notified: false,
    },
    include: {
      user: true,
      service: true,
      barber: { include: { barberSettings: true } },
    },
  })

  console.log("⏰ 1H Reminders:", appointments.length)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || ""
  let sent = 0

  for (const apt of appointments) {
    const shopName = (apt.barber as any).barberSettings?.shopName || "Mi Spa"
    const appointmentLink = baseUrl ? `${baseUrl}/cita/${apt.token}` : ""
    const clientName = apt.user.name || "Cliente"
    const timeStr = formatTime(apt.date)

    if (apt.user.email) {
      try {
        await sendReminderEmail({
          to: apt.user.email,
          clientName,
          serviceName: apt.service.name,
          time: timeStr,
          shopName,
          appointmentLink,
        })
        console.log("📩 Email recordatorio 1h:", apt.user.email)
        await prisma.appointment.update({
          where: { id: apt.id },
          data: { notified: true },
        })
        sent++
      } catch (err: any) {
        console.error("❌ Error email:", err.message)
      }
    } else {
      // Sin email — marcar para no reintentar
      await prisma.appointment.update({
        where: { id: apt.id },
        data: { notified: true },
      })
      console.warn("⚠️ Sin email:", apt.id)
    }
  }

  return NextResponse.json({
    success: true,
    processed: appointments.length,
    sent,
    timestamp: now.toISOString(),
  })
}
