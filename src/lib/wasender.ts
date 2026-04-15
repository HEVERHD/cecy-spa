const WASENDER_API_URL = "https://www.wasenderapi.com/api/send-message"

function formatPhone(to: string): string {
  let phone = to.replace(/\s+/g, "").replace(/^0+/, "")
  if (!phone.startsWith("+")) {
    phone = phone.startsWith("57") ? `+${phone}` : `+57${phone}`
  }
  return phone
}

export async function sendWhatsAppViaWasender(to: string, message: string): Promise<void> {
  const apiKey = process.env.WASENDER_API_KEY
  if (!apiKey) {
    console.log(`[WhatsApp Mock] To: ${to} | Message: ${message}`)
    return
  }

  const phone = formatPhone(to)

  const response = await fetch(WASENDER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to: phone, text: message }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`WASenderAPI error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  console.log(`[WhatsApp] Sent to ${phone} | MsgId: ${data.data?.msgId}`)
}
