import twilio from "twilio"

// ── Twilio client (lazy, returns null when credentials are missing) ──────────
function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token || sid.startsWith("your-") || token.startsWith("your-")) {
    return null
  }
  return twilio(sid, token)
}

const WHATSAPP_FROM =
  process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+16624992878"

/** Normalise any phone string to E.164 and prepend "whatsapp:" */
function toWhatsApp(to: string): string {
  let phone = to.replace(/[\s\-().]/g, "")
  if (!phone.startsWith("+")) {
    phone = phone.startsWith("57") ? `+${phone}` : `+57${phone}`
  }
  return `whatsapp:${phone}`
}

// ── Core send ─────────────────────────────────────────────────────────────────
/** Send a WhatsApp message using a Twilio Content Template (approved by Meta). */
export async function sendWhatsAppWithTemplate(
  to: string,
  contentSid: string,
  contentVariables: Record<string, string>
): Promise<void> {
  const client = getClient()
  const dest = toWhatsApp(to)
  if (!client) {
    console.log(`[WhatsApp Template Mock] → ${dest} | ${contentSid}`, contentVariables)
    return
  }
  try {
    const msg = await client.messages.create({
      from: WHATSAPP_FROM,
      to: dest,
      contentSid,
      contentVariables: JSON.stringify(contentVariables),
    })
    console.log(`[WhatsApp Template ✓] ${dest} | SID: ${msg.sid}`)
  } catch (err: any) {
    console.error(`[WhatsApp Template ✗] ${dest} | ${err.message}`)
    throw err
  }
}

/** Send a free-form WhatsApp message via Twilio. */
export async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  const client = getClient()
  if (!client) {
    // Dev/staging fallback — just log so the rest of the booking still works
    console.log(`[WhatsApp Mock] → ${to}\n${message}\n`)
    return
  }

  const dest = toWhatsApp(to)
  try {
    const msg = await client.messages.create({
      from: WHATSAPP_FROM,
      to: dest,
      body: message,
    })
    console.log(`[WhatsApp ✓] ${dest} | SID: ${msg.sid}`)
  } catch (err: any) {
    console.error(`[WhatsApp ✗] ${dest} | ${err.message}`)
    throw err
  }
}

/** Alias kept for backward-compatibility (reminder/reengagement callers). */
export async function sendSMS(to: string, message: string): Promise<void> {
  await sendWhatsAppMessage(to, message).catch((err) =>
    console.error(`[WhatsApp/SMS Failed] ${err.message}`)
  )
}

/** Template-based send — uses plain-text body as fallback (WA template flow removed). */
export async function sendWhatsAppTemplate(
  to: string,
  _contentSid: string,
  variables: Record<string, string>
): Promise<void> {
  const body = Object.values(variables).join("\n")
  await sendWhatsAppMessage(to, body).catch(() => {})
}

/** Template with SMS fallback — sends the fallback body via WhatsApp. */
export async function sendWhatsAppTemplateWithSMSFallback(
  to: string,
  _contentSid: string,
  _variables: Record<string, string>,
  smsFallbackBody: string
): Promise<void> {
  await sendWhatsAppMessage(to, smsFallbackBody).catch((err) =>
    console.error(`[WhatsApp Failed] ${err.message} for ${to}`)
  )
}

// ── Message builders ──────────────────────────────────────────────────────────

export function buildConfirmationMessage(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  shopName: string,
  appointmentLink?: string
): string {
  const nombre = clientName.split(" ")[0]
  let msg =
    `✅ *Cita confirmada — ${shopName}*\n\n` +
    `Hola ${nombre}! Tu cita está agendada.\n\n` +
    `💆 Servicio: ${serviceName}\n` +
    `📅 Fecha: ${date}\n` +
    `🕐 Hora: ${time}`
  if (appointmentLink) {
    msg += `\n\n🔗 Ver / cancelar:\n${appointmentLink}`
  }
  return msg
}

export function buildReminderMessage(
  clientName: string,
  serviceName: string,
  time: string,
  shopName: string
): string {
  const nombre = clientName.split(" ")[0]
  return (
    `🌸 *¡Hola ${nombre}!*\n\n` +
    `Ya casi es tu hora ⏰\n\n` +
    `💆 ${serviceName}\n` +
    `🕐 Hora: ${time}\n` +
    `📍 ${shopName}\n\n` +
    `¡Te esperamos con todo listo! 💖`
  )
}

export function buildStatusConfirmedMessage(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  shopName: string
): string {
  const nombre = clientName.split(" ")[0]
  return (
    `✅ *Tu cita fue confirmada — ${shopName}*\n\n` +
    `Hola ${nombre}!\n\n` +
    `💆 ${serviceName}\n` +
    `📅 ${date}\n` +
    `🕐 ${time}\n\n` +
    `¡Te esperamos!`
  )
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
  return (
    `📅 *Nueva cita (${source})*\n\n` +
    `👤 ${clientName}\n` +
    `💆 ${serviceName}\n` +
    `📅 ${date}\n` +
    `🕐 ${time}\n` +
    `💵 ${price}`
  )
}

export function buildLoyaltyMessage(clientName: string, shopName: string): string {
  return (
    `🎉 *¡Felicidades ${clientName}!*\n\n` +
    `Completaste *7 servicios* en ${shopName}.\n\n` +
    `Has ganado un *descuento especial* en tu próxima cita. ` +
    `Menciónalo al llegar y te lo aplicamos.\n\n` +
    `¡Gracias por tu fidelidad! 💖`
  )
}

export function buildReengagementMessage(
  clientName: string,
  shopName: string,
  bookingLink: string
): string {
  return (
    `Hola ${clientName.split(" ")[0]}! Te echamos de menos en ${shopName} 🌸\n\n` +
    `Hace más de 10 días sin cita. Reserva aquí:\n${bookingLink}`
  )
}

export function buildReminder24hMessage(
  clientName: string,
  serviceName: string,
  date: string,
  time: string,
  shopName: string,
  appointmentLink?: string
): string {
  let msg =
    `⏰ *Recordatorio — ${shopName}*\n\n` +
    `Hola ${clientName.split(" ")[0]}, mañana tienes cita:\n\n` +
    `💆 ${serviceName}\n` +
    `📅 ${date}\n` +
    `🕐 ${time}`
  if (appointmentLink) {
    msg += `\n\n🔗 Ver / cancelar:\n${appointmentLink}`
  }
  return msg
}
