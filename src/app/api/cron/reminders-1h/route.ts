import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSMS } from "@/lib/twilio"
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
    let success = false

    // ── SMS ───────────────────────────────────────────────────
    if (apt.user.phone) {
      let msg = `Recordatorio de cita - ${shopName}\n\nHola ${clientName.split(" ")[0]}, tu cita es en 1 hora.\n\nServicio: ${apt.service.name}\nHora: ${timeStr}`
      if (appointmentLink) msg += `\n\nVer/cancelar: ${appointmentLink}`

      try {
        await sendSMS(apt.user.phone, msg)
        console.log("✅ SMS enviado:", apt.user.phone)
        success = true
      } catch (err: any) {
        console.error("❌ Error SMS:", err.message)
      }
    }

    // ── Email (siempre si hay correo, independiente del SMS) ──
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
        console.log("📩 Email recordatorio:", apt.user.email)
        success = true
      } catch (err: any) {
        console.error("❌ Error email:", err.message)
      }
    }

    // ── Marcar como notificado si al menos un canal funcionó ──
    if (success) {
      await prisma.appointment.update({
        where: { id: apt.id },
        data: { notified: true },
      })
      sent++
    } else if (!apt.user.phone && !apt.user.email) {
      // Sin datos de contacto — marcar para no reintentar
      await prisma.appointment.update({
        where: { id: apt.id },
        data: { notified: true },
      })
      console.warn("⚠️ Sin contacto:", apt.id)
    }
  }

  return NextResponse.json({
    success: true,
    processed: appointments.length,
    sent,
    timestamp: now.toISOString(),
  })
}
