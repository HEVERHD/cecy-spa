import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage, sendWhatsAppTemplateWithSMSFallback, buildReminderMessage } from "@/lib/twilio"
import { formatCurrency, formatDate, formatTime, getColombiaDateStr } from "@/lib/utils"
import { sendConfirmationEmail } from "@/lib/resend"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()

  // Auto-expire waitlist entries from past dates
  const todayStr = getColombiaDateStr(now)
  const expired = await prisma.waitlistEntry.updateMany({
    where: { date: { lt: todayStr }, status: { in: ["WAITING", "NOTIFIED"] } },
    data: { status: "EXPIRED" },
  })
  if (expired.count > 0) {
    console.log(`[Cron] Auto-expired ${expired.count} waitlist entries`)
  }

  // Auto-complete appointments whose end time has already passed
  const pastPending = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      date: { lt: now },
    },
    select: { id: true, date: true, service: { select: { duration: true } } },
  })
  const toComplete = pastPending.filter((a) => {
    const endTime = new Date(a.date.getTime() + a.service.duration * 60 * 1000)
    return endTime < now
  })
  if (toComplete.length > 0) {
    await prisma.appointment.updateMany({
      where: { id: { in: toComplete.map((a) => a.id) } },
      data: { status: "COMPLETED" },
    })
    console.log(`[Cron] Auto-completed ${toComplete.length} past appointments`)
  }

  // Window: 55–65 min from now (centered on exactly 1 hour)
  // Requires cron to run every 5 min to catch all appointments reliably
  const windowStart = new Date(now.getTime() + 55 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 65 * 60 * 1000)

  // Find appointments in the next 55-65 min window that haven't been notified
  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: windowStart, lte: windowEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
      notified: false,
    },
    include: {
      user: true,
      service: true,
      barber: {
        include: { barberSettings: true },
      },
    },
  })
  let sent = 0

for (const appointment of appointments) {

  const shopName =
    (appointment.barber as any).barberSettings?.shopName || "Mi Barbería"

  let success = false

  // ── WHATSAPP + SMS ─────────────────────────────
  if (appointment.user.phone) {
    try {
      const message = buildReminderMessage(
        appointment.user.name || "Cliente",
        appointment.service.name,
        formatTime(appointment.date),
        shopName
      )

      const templateSid = process.env.TWILIO_TEMPLATE_REMINDER_1H

      if (templateSid) {
        await sendWhatsAppTemplateWithSMSFallback(
          appointment.user.phone,
          templateSid,
          {
            "1": appointment.user.name || "Cliente",
            "2": appointment.service.name,
            "3": formatTime(appointment.date),
            "4": shopName,
          },
          message
        )
      } else {
        // sin template → igual envía (fallback interno a SMS)
        await sendWhatsAppTemplateWithSMSFallback(
          appointment.user.phone,
          "",
          {},
          message
        )
      }

      sent++
      success = true

    } catch (error) {
      console.error(`Error WhatsApp ${appointment.id}:`, error)
    }
  }

  // ── EMAIL (SIEMPRE) ─────────────────────────────
  if (appointment.user.email) {
    try {
      await sendConfirmationEmail({
        to: appointment.user.email,
        clientName: appointment.user.name || "Cliente",
        serviceName: appointment.service.name,
        date: formatDate(appointment.date),
        time: formatTime(appointment.date),
        duration: appointment.service.duration,
        price: formatCurrency(appointment.service.price),
        shopName,
        appointmentLink: `${process.env.NEXT_PUBLIC_APP_URL}/cita/${appointment.token}`,
      })

      console.log("📩 Email recordatorio enviado:", appointment.user.email)
      success = true

    } catch (err) {
      console.error("❌ Error email:", err)
    }
  }

  // ── MARCAR COMO NOTIFICADO SOLO SI ALGO FUNCIONÓ ──
  if (success) {
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { notified: true },
    })
  }
}

  return NextResponse.json({
    checked: appointments.length,
    sent,
    timestamp: now.toISOString(),
  })
}
