import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      _count: { select: { appointments: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
  })
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede crear usuarios" }, { status: 403 })
  }

  const { name, email, phone, password, role } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 })
  }
  if (!["ADMIN", "BARBER", "CLIENT"].includes(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 })

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, password: hashedPassword, role },
  })

  // Auto-create BarberSettings for BARBER/ADMIN
  if (role === "BARBER" || role === "ADMIN") {
    const adminSettings = await prisma.barberSettings.findUnique({
      where: { userId: currentUser.id },
    })
    await prisma.barberSettings.create({
      data: {
        shopName: adminSettings?.shopName || "Mi Spa",
        openTime: adminSettings?.openTime || "09:00",
        closeTime: adminSettings?.closeTime || "19:00",
        slotDuration: adminSettings?.slotDuration || 30,
        daysOff: adminSettings?.daysOff || "0",
        userId: user.id,
      },
    })
  }

  return NextResponse.json(user, { status: 201 })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Only BARBER can change roles
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
  })

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede cambiar roles" }, { status: 403 })
  }

  const { userId, role, password } = await req.json()

  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 })

  // Password reset
  if (password) {
    if (password.length < 6) return NextResponse.json({ error: "Mínimo 6 caracteres" }, { status: 400 })
    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
    return NextResponse.json({ ok: true })
  }

  if (!role || !["ADMIN", "BARBER", "CLIENT"].includes(role)) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 })
  }

  // Prevent removing your own ADMIN role
  if (userId === currentUser.id && role !== "ADMIN") {
    return NextResponse.json({ error: "No puedes quitarte el rol de administrador" }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  // Auto-create BarberSettings when promoting to BARBER or ADMIN
  if (role === "BARBER" || role === "ADMIN") {
    const existingSettings = await prisma.barberSettings.findUnique({
      where: { userId },
    })
    if (!existingSettings) {
      const adminSettings = await prisma.barberSettings.findUnique({
        where: { userId: currentUser.id },
      })
      await prisma.barberSettings.create({
        data: {
          shopName: adminSettings?.shopName || "Mi Barbería",
          openTime: adminSettings?.openTime || "09:00",
          closeTime: adminSettings?.closeTime || "19:00",
          slotDuration: adminSettings?.slotDuration || 30,
          daysOff: adminSettings?.daysOff || "0",
          userId,
        },
      })
    }
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
  })
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo el administrador puede eliminar usuarios" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("id")
  if (!userId) return NextResponse.json({ error: "id requerido" }, { status: 400 })

  if (userId === currentUser.id) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  // Delete all related data before removing the user
  await prisma.$transaction(async (tx) => {
    await tx.appointment.deleteMany({ where: { userId } })
    await tx.appointment.deleteMany({ where: { barberId: userId } })
    await tx.blockedSlot.deleteMany({ where: { barberId: userId } })
    await tx.recurringBlock.deleteMany({ where: { barberId: userId } })
    await tx.barberSettings.deleteMany({ where: { userId } })
    await tx.user.delete({ where: { id: userId } })
  })

  return NextResponse.json({ ok: true })
}
