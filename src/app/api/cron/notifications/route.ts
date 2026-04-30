import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWhatsAppWithTemplate, buildReminderMessage } from "@/lib/twilio"
import { formatCurrency, formatDate, formatTime, getColombiaDateStr } from "@/lib/utils"
import { sendConfirmationEmail } from "@/lib/resend"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
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
    where: { status: { in: ["PENDING", "CONFIRMED"] }, date: { lt: now } },
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

  // Window: 55–65 min from now
  const windowStart = new Date(now.getTime() + 55 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 65 * 60 * 1000)

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: windowStart, lte: windowEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
      notified: false,
    },
    include: {
      user: true,
      service: true,
      barber: { include: { barberSettings: true } },
    },
  })

  let sent = 0

  for (const appointment of appointments) {
    const shopName = (appointment.barber as any).barberSettings?.shopName || "Mi Spa"
    const channels = appointment.notificationChannels?.split(",") ?? ["whatsapp", "email"]
    let success = false

    // ── WhatsApp (template requerido fuera de ventana 24h) ───────
    if (appointment.user.phone && channels.includes("whatsapp")) {
      const templateSid = process.env.TWILIO_TEMPLATE_REMINDER_1H
      try {
        if (templateSid) {
          await sendWhatsAppWithTemplate(appointment.user.phone, templateSid, {
            "1": appointment.user.name || "Cliente",
            "2": appointment.service.name,
            "3": formatTime(appointment.date),
            "4": shopName,
          })
        } else {
          console.warn("[Cron] TWILIO_TEMPLATE_REMINDER_1H no configurado — omitiendo WhatsApp")
        }
        sent++
        success = true
      } catch (error) {
        console.error(`[Cron] WhatsApp error ${appointment.id}:`, error)
      }
    }

    // ── Email ────────────────────────────────────────────────────
    if (appointment.user.email && channels.includes("email")) {
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
        console.log("📩 Email recordatorio:", appointment.user.email)
        success = true
      } catch (err) {
        console.error("[Cron] Email error:", err)
      }
    }

    if (success) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { notified: true },
      })
    }
  }

  return NextResponse.json({ checked: appointments.length, sent, timestamp: now.toISOString() })
}
