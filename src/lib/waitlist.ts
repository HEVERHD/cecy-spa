import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage } from "@/lib/twilio"
import { sendPushToBarber } from "@/lib/push"
import { formatDate, formatTime, getColombiaDateStr } from "@/lib/utils"

/**
 * When an appointment is cancelled, finds the first WAITING person in the
 * waitlist for that date (preferring same service), auto-schedules them at
 * the freed slot, sends WhatsApp, and notifies the barber via push.
 */
export async function autoScheduleFromWaitlist(
  cancelledDate: Date,
  barberId: string,
  cancelledServiceId: string
): Promise<void> {
  const dateStr = getColombiaDateStr(cancelledDate)
  console.log(`[Waitlist] Checking waitlist for date=${dateStr} barberId=${barberId}`)

  // Prefer same service first, then any service waiting for that date
  let entry = await prisma.waitlistEntry.findFirst({
    where: { date: dateStr, status: "WAITING", serviceId: cancelledServiceId },
    include: { service: true },
    orderBy: { createdAt: "asc" },
  })

  if (!entry) {
    entry = await prisma.waitlistEntry.findFirst({
      where: { date: dateStr, status: "WAITING" },
      include: { service: true },
      orderBy: { createdAt: "asc" },
    })
  }

  if (!entry) {
    console.log(`[Waitlist] No one waiting for date=${dateStr}, nothing to schedule`)
    return
  }

  console.log(`[Waitlist] Found waiting entry: ${entry.name} (${entry.phone}) for ${entry.service.name}`)

  // Find or create user by phone
  let user = await prisma.user.findFirst({ where: { phone: entry.phone } })
  if (!user) {
    user = await prisma.user.create({
      data: { name: entry.name, phone: entry.phone, role: "CLIENT" },
    })
    console.log(`[Waitlist] Created new user for ${entry.name}`)
  }

  // Auto-create appointment at the freed slot
  const appointment = await prisma.appointment.create({
    data: {
      date: cancelledDate,
      userId: user.id,
      serviceId: entry.serviceId,
      barberId,
      bookedBy: "BARBER",
      status: "CONFIRMED",
    },
    include: {
      service: true,
      barber: {
        select: {
          id: true,
          barberSettings: { select: { shopName: true } },
        },
      },
    },
  })

  console.log(`[Waitlist] Auto-created appointment ${appointment.id} for ${entry.name}`)

  // Mark waitlist entry as BOOKED
  await prisma.waitlistEntry.update({
    where: { id: entry.id },
    data: { status: "BOOKED", notified: true },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || ""
  const shopName = appointment.barber.barberSettings?.shopName || "Frailin Studio"
  const appointmentLink = baseUrl ? `${baseUrl}/cita/${appointment.token}` : ""

  // Notify the client via WhatsApp
  const clientMsg =
    `🎉 *¡Buenas noticias, ${entry.name}!*\n\n` +
    `Se liberó un cupo y te agendamos automáticamente:\n\n` +
    `📋 Servicio: ${appointment.service.name}\n` +
    `📅 Fecha: ${formatDate(appointment.date)}\n` +
    `🕐 Hora: ${formatTime(appointment.date)}\n` +
    `💈 ${shopName}` +
    (appointmentLink ? `\n\n🔗 Ver o cancelar tu cita:\n${appointmentLink}` : "") +
    `\n\n¡Te esperamos!`

  sendWhatsAppMessage(entry.phone, clientMsg).catch((err) =>
    console.error("[Waitlist] Error sending WhatsApp to client:", err)
  )

  // Notify the barber via push
  sendPushToBarber(barberId, {
    title: "📋 Lista de espera — Auto-agendado",
    body: `${entry.name} fue agendado automáticamente · ${appointment.service.name} · ${formatDate(appointment.date)} ${formatTime(appointment.date)}`,
    url: "/appointments",
    tag: "waitlist-auto-scheduled",
  }).catch((err) =>
    console.error("[Waitlist] Error sending push to barber:", err)
  )

  console.log(`[Waitlist] Done — ${entry.name} auto-scheduled and notified`)
}
