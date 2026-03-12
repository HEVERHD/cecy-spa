import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage, sendWhatsAppTemplate, buildReminderMessage } from "@/lib/twilio"
import { formatTime, getColombiaDateStr } from "@/lib/utils"

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

  const templateSid = process.env.TWILIO_TEMPLATE_REMINDER_1H
  let sent = 0

  for (const appointment of appointments) {
    if (appointment.user.phone) {
      try {
        const shopName = (appointment.barber as any).barberSettings?.shopName || "Mi Barbería"
        if (templateSid) {
          await sendWhatsAppTemplate(appointment.user.phone, templateSid, {
            "1": appointment.user.name || "Cliente",
            "2": appointment.service.name,
            "3": formatTime(appointment.date),
            "4": shopName,
          })
        } else {
          const message = buildReminderMessage(
            appointment.user.name || "Cliente",
            appointment.service.name,
            formatTime(appointment.date),
            shopName
          )
          await sendWhatsAppMessage(appointment.user.phone, message)
        }
        sent++
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { notified: true },
        })
      } catch (error) {
        console.error(`Error sending reminder for appointment ${appointment.id}:`, error)
      }
    } else {
      // No phone number — mark as notified to avoid reprocessing
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
