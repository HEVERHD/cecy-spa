import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendReminderEmail } from "@/lib/resend"
import { sendWhatsAppWithTemplate } from "@/lib/twilio"
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
    const channels = apt.notificationChannels?.split(",") ?? ["whatsapp", "email"]
    let notified = false

    // WhatsApp reminder — requires an approved Meta template (error 63016 if free-form)
    if (apt.user.phone && channels.includes("whatsapp")) {
      const templateSid = process.env.TWILIO_TEMPLATE_REMINDER_1H
      if (!templateSid) {
        console.warn("⚠️ TWILIO_TEMPLATE_REMINDER_1H not set — skipping WhatsApp reminder")
      } else {
        try {
          await sendWhatsAppWithTemplate(apt.user.phone, templateSid, {
            "1": clientName,
            "2": apt.service.name,
            "3": timeStr,
            "4": shopName,
          })
          console.log("💬 WhatsApp recordatorio 1h:", apt.user.phone)
          notified = true
        } catch (err: any) {
          console.error("❌ Error WhatsApp:", err.message)
        }
      }
    }

    // Email reminder
    if (apt.user.email && channels.includes("email")) {
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
        notified = true
      } catch (err: any) {
        console.error("❌ Error email:", err.message)
      }
    }

    // Mark as notified if at least one channel succeeded (or if client has no contact info)
    const hasNoContact = !apt.user.phone && !apt.user.email
    if (notified || hasNoContact) {
      await prisma.appointment.update({
        where: { id: apt.id },
        data: { notified: true },
      })
      if (notified) sent++
    }
  }

  return NextResponse.json({
    success: true,
    processed: appointments.length,
    sent,
    timestamp: now.toISOString(),
  })
}
