import { NextRequest, NextResponse } from "next/server"
import { sendWhatsAppMessage } from "@/lib/twilio"
import { prisma } from "@/lib/prisma"

const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || "+573102848135"

/** Strip "whatsapp:" prefix and normalise to E.164 */
function normaliseNumber(raw: string): string {
  return raw.replace(/^whatsapp:/i, "").trim()
}

/** Parse "REPLY XXXXXXXXXX mensaje..." → { to, message } | null */
function parseReply(body: string): { to: string; message: string } | null {
  const match = body.trim().match(/^REPLY\s+(\+?\d{7,15})\s+([\s\S]+)$/i)
  if (!match) return null
  let to = match[1]
  if (!to.startsWith("+")) {
    to = to.startsWith("57") ? `+${to}` : `+57${to}`
  }
  return { to, message: match[2].trim() }
}

export async function POST(req: NextRequest) {
  // Twilio sends form-encoded bodies
  const formData = await req.formData()
  const from = formData.get("From") as string | null
  const body = formData.get("Body") as string | null

  if (!from || !body) {
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    })
  }

  const senderNumber = normaliseNumber(from)
  const adminNormalised = normaliseNumber(ADMIN_NUMBER)

  const isFromAdmin =
    senderNumber === adminNormalised ||
    senderNumber.replace(/\s/g, "") === adminNormalised.replace(/\s/g, "")

  if (isFromAdmin) {
    // Admin is replying to a client
    const parsed = parseReply(body)
    if (parsed) {
      try {
        await sendWhatsAppMessage(parsed.to, parsed.message)
        console.log(`[WA Relay] Admin → ${parsed.to}: enviado`)
      } catch (err: any) {
        console.error(`[WA Relay] Error enviando al cliente: ${err.message}`)
        // Notify admin of failure
        await sendWhatsAppMessage(
          ADMIN_NUMBER,
          `⚠️ No se pudo enviar el mensaje a ${parsed.to}.\n\nError: ${err.message}`
        ).catch(() => {})
      }
    } else {
      // Admin sent something but not a REPLY command — remind them of the format
      await sendWhatsAppMessage(
        ADMIN_NUMBER,
        `ℹ️ Para responder a un cliente usa:\n\nREPLY [número] [mensaje]\n\nEjemplo:\nREPLY 3118450762 Hola, confirmamos tu cita`
      ).catch(() => {})
    }
  } else {
    // Message from a client — look up their name in DB then forward to admin
    const displayNumber = senderNumber.replace("+57", "").trim()

    let clientLabel = senderNumber
    try {
      // Try to find user by phone — stored in different formats, normalise both sides
      const users = await prisma.user.findMany({
        where: { phone: { not: null } },
        select: { name: true, phone: true },
      })
      const match = users.find((u) => {
        const stored = (u.phone || "").replace(/[\s\-().]/g, "")
        const incoming = senderNumber.replace(/[\s\-().]/g, "")
        // Compare last 10 digits to handle +57/0 prefix variants
        return stored.slice(-10) === incoming.slice(-10)
      })
      if (match?.name) {
        clientLabel = `${match.name} (${senderNumber})`
      }
    } catch {
      // DB lookup failed — fall back to number only
    }

    const forwardMsg =
      `📨 *Mensaje de cliente*\n` +
      `👤 ${clientLabel}\n\n` +
      `"${body}"\n\n` +
      `↩️ Responde:\nREPLY ${displayNumber} Tu respuesta aquí`

    try {
      await sendWhatsAppMessage(ADMIN_NUMBER, forwardMsg)
      console.log(`[WA Relay] ${senderNumber} → admin: reenviado`)
    } catch (err: any) {
      console.error(`[WA Relay] Error reenviando al admin: ${err.message}`)
    }
  }

  // Return empty TwiML — Twilio requires this to avoid auto-reply
  return new NextResponse("<Response></Response>", {
    headers: { "Content-Type": "text/xml" },
  })
}
