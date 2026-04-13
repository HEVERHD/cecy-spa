import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendSMS } from "@/lib/twilio"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const to = searchParams.get("to")

  const config = {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID
      ? process.env.TWILIO_ACCOUNT_SID.slice(0, 8) + "..."
      : "❌ NO CONFIGURADA",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN
      ? "✅ configurada"
      : "❌ NO CONFIGURADA",
    TWILIO_SMS_FROM: process.env.TWILIO_SMS_FROM || "❌ NO CONFIGURADA",
  }

  if (!to) {
    return NextResponse.json({ config, hint: "Agrega ?to=57XXXXXXXXXX para enviar un SMS de prueba" })
  }

  try {
    await sendSMS(to, "Prueba de SMS desde Cecy Spa ✓")
    return NextResponse.json({ config, result: "✅ SMS enviado a " + to })
  } catch (err: any) {
    return NextResponse.json({ config, error: err.message, code: err.code }, { status: 500 })
  }
}
