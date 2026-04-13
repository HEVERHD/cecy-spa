import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadAvatar } from "@/lib/cloudinary"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const role = (session.user as any)?.role
  const userId = (session.user as any)?.id

  if (role !== "ADMIN" && role !== "BARBER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { base64, barberId } = await req.json()
  if (!base64) return NextResponse.json({ error: "No se recibió imagen" }, { status: 400 })

  // ADMIN can upload for any barber; BARBER only for themselves
  const targetId = role === "ADMIN" && barberId ? barberId : userId

  const { url } = await uploadAvatar(base64)

  await prisma.user.update({
    where: { id: targetId },
    data: { avatarUrl: url },
  })

  return NextResponse.json({ url })
}
