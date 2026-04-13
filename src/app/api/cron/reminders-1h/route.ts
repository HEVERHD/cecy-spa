import { prisma } from "@/lib/prisma"
import { sendSMS } from "@/lib/twilio"
import { formatTime } from "@/lib/utils"

export async function GET() {
  const now = new Date()

  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000)

  const windowStart = new Date(inOneHour.getTime() - 2 * 60 * 1000)
  const windowEnd = new Date(inOneHour.getTime() + 2 * 60 * 1000)

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      date: {
        gte: windowStart,
        lte: windowEnd,
      },
      notified: false,
    },
    include: {
      user: true,
      service: true,
    },
  })

  console.log("⏰ 1H Reminders:", appointments.length)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || ""

  for (const apt of appointments) {
    if (!apt.user.phone) continue

    const appointmentLink = baseUrl ? `${baseUrl}/cita/${apt.token}` : ""
    let msg = `⏰ Recordatorio de cita

Hola ${apt.user.name || "Cliente"},
tu cita es en 1 hora.

📋 Servicio: ${apt.service.name}
🕐 Hora: ${formatTime(apt.date)}

¡Te esperamos! 💈`

    if (appointmentLink) {
      msg += `\n\n🔗 Ver o cancelar tu cita:\n${appointmentLink}`
    }

    try {
      await sendSMS(apt.user.phone, msg)

      await prisma.appointment.update({
        where: { id: apt.id },
        data: { notified: true },
      })

      console.log("✅ SMS enviado:", apt.user.phone)

    } catch (err) {
      console.error("❌ Error SMS:", err)
    }
  }

  return Response.json({
    success: true,
    processed: appointments.length,
  })
}