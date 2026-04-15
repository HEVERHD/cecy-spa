import { sendWhatsAppViaWasender } from "./wasender"

/** Send a WhatsApp message via WASenderAPI */
export async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  await sendWhatsAppViaWasender(to, message)
}

/**
 * Send a WhatsApp message using a template (now sends plain text via WASenderAPI).
 * The templateSid and variables are ignored — WASenderAPI uses plain text only.
 */
export async function sendWhatsAppTemplate(
  _to: string,
  _contentSid: string,
  _variables: Record<string, string>
): Promise<void> {
  console.log(`[WhatsApp] sendWhatsAppTemplate called — templates not used with WASenderAPI`)
}

/**
 * Send a WhatsApp message via WASenderAPI using the plain-text fallback body.
 * The templateSid and variables are ignored (Twilio templates no longer used).
 */
export async function sendWhatsAppTemplateWithSMSFallback(
  to: string,
  _contentSid: string,
  _variables: Record<string, string>,
  smsFallbackBody: string
): Promise<void> {
  await sendWhatsAppViaWasender(to, smsFallbackBody).catch((err) => {
    console.error(`[WhatsApp Failed] ${err.message} for ${to}`)
  })
}

/**
 * Send a plain message via WhatsApp (WASenderAPI).
 * Kept as sendSMS for backwards compatibility — all notifications go through WhatsApp now.
 */
export async function sendSMS(to: string, message: string): Promise<void> {
  await sendWhatsAppViaWasender(to, message).catch((err) => {
    console.error(`[WhatsApp/SMS Failed] ${err.message} for ${to}`)
  })
}

export function buildConfirmationMessage(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  shopName: string,
  appointmentLink?: string,
): string {
  const nombre = clientName.split(" ")[0]
  let msg = `Cita confirmada - ${shopName}\n\nHola ${nombre}!\nServicio: ${serviceName}\nFecha: ${date}\nHora: ${time}`
  if (appointmentLink) {
    msg += `\n\nVer/cancelar: ${appointmentLink}`
  }
  return msg
}

export function buildStatusConfirmedMessage(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  shopName: string
): string {
  const nombre = clientName.split(" ")[0]
  return `Cita confirmada - ${shopName}\n\nHola ${nombre}! Tu cita fue confirmada.\n\nServicio: ${serviceName}\nFecha: ${date}\nHora: ${time}\n\nTe esperamos!`
}

export function buildBarberNotification(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  price: string,
  bookedBy: string
): string {
  const source = bookedBy === "CLIENT" ? "desde la web" : "manual"
  return `Nueva cita (${source})\n\nCliente: ${clientName}\nServicio: ${serviceName}\nFecha: ${date}\nHora: ${time}\nPrecio: ${price}`
}

export function buildReminderMessage(
  clientName: string,
  serviceName: string,
  time: string,
  shopName: string
): string {
  const nombre = clientName.split(" ")[0]
  return `🌸 ¡Hola ${nombre}!\n\nQue no se te olvide — ¡ya es casi tu hora! 🕐\n\n💆‍♀️ Servicio: ${serviceName}\n🕐 Hora: ${time}\n📍 ${shopName}\n\nTe esperamos con todo listo. ¡Nos vemos! 💖`
}

export function buildLoyaltyMessage(
  clientName: string,
  shopName: string
): string {
  return `🎉 *¡Felicidades ${clientName}!*\n\nAlcanzaste *7 cortes* este mes en ${shopName}. 💈\n\n¡Has ganado un *descuento especial* en tu próxima cita! Menciónalo al llegar y te aplicamos el beneficio.\n\n¡Gracias por tu fidelidad!`
}

export function buildReengagementMessage(
  clientName: string,
  shopName: string,
  bookingLink: string
): string {
  return `Hola ${clientName.split(" ")[0]}! Te echamos de menos en ${shopName}.\n\nHace mas de 10 dias sin cita. Reserva aqui: ${bookingLink}`
}

export function buildReminder24hMessage(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  shopName: string,
  appointmentLink?: string
): string {
  let msg = `Recordatorio - ${shopName}\n\nHola ${clientName.split(" ")[0]}, manana tienes cita.\n\nServicio: ${serviceName}\nFecha: ${date}\nHora: ${time}`
  if (appointmentLink) {
    msg += `\n\nVer/cancelar: ${appointmentLink}`
  }
  return msg
}
