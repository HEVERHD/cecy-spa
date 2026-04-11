import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()
const TEMP_PASSWORD = "CecySpa2026!"
const ADMIN_EMAIL = "admin@cecyspa.com"

const teamMembers = [
  {
    name: "Maria Segura",
    email: "maria.segura@cecyspa.com",
    specialty: "Administradora y fisioterapeuta",
    role: Role.BARBER,
  },
  {
    name: "Gabriela Mesa",
    email: "gabriela.mesa@cecyspa.com",
    specialty: "Manicurista",
    role: Role.BARBER,
  },
  {
    name: "Cecilia Malpica",
    email: "cecilia.malpica@cecyspa.com",
    specialty: "Manicurista y esteticista",
    role: Role.BARBER,
  },
  {
    name: "Deliana",
    email: "deliana@cecyspa.com",
    specialty: "Manicurista",
    role: Role.BARBER,
  },
  {
    name: "Aron",
    email: "aron@cecyspa.com",
    specialty: "Manicurista, disenador de mirada, estilista y maquilladora integral",
    role: Role.BARBER,
  },
  {
    name: "Esperanza",
    email: "esperanza@cecyspa.com",
    specialty: "Estilista y maquilladora integral",
    role: Role.BARBER,
  },
  {
    name: "Laura",
    email: "laura@cecyspa.com",
    specialty: "Manicurista",
    role: Role.BARBER,
  },
]

async function ensureSettings(userId: string, defaults?: { shopName: string; openTime: string; closeTime: string; slotDuration: number; daysOff: string }) {
  const existing = await prisma.barberSettings.findUnique({ where: { userId } })
  if (existing) return

  await prisma.barberSettings.create({
    data: {
      userId,
      shopName: defaults?.shopName || "Cecy D'Estetica y Spa",
      openTime: defaults?.openTime || "08:00",
      closeTime: defaults?.closeTime || "19:00",
      slotDuration: defaults?.slotDuration || 30,
      daysOff: defaults?.daysOff || "0",
    },
  })
}

async function main() {
  const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 10)

  const admin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: ADMIN_EMAIL },
        { role: Role.ADMIN },
      ],
    },
    include: { barberSettings: true },
    orderBy: { createdAt: "asc" },
  })

  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        name: "Cecilia Salas",
        email: ADMIN_EMAIL,
        specialty: "Esteticista cosmetologa",
        role: Role.ADMIN,
      },
    })

    await ensureSettings(admin.id, {
      shopName: admin.barberSettings?.shopName || "Cecy D'Estetica y Spa",
      openTime: admin.barberSettings?.openTime || "08:00",
      closeTime: admin.barberSettings?.closeTime || "19:00",
      slotDuration: admin.barberSettings?.slotDuration || 30,
      daysOff: admin.barberSettings?.daysOff || "0",
    })
  }

  const settingsDefaults = admin?.barberSettings
    ? {
        shopName: admin.barberSettings.shopName,
        openTime: admin.barberSettings.openTime,
        closeTime: admin.barberSettings.closeTime,
        slotDuration: admin.barberSettings.slotDuration,
        daysOff: admin.barberSettings.daysOff,
      }
    : undefined

  const created: string[] = []
  const updated: string[] = []

  for (const member of teamMembers) {
    const existing = await prisma.user.findUnique({ where: { email: member.email } })

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: member.name,
          specialty: member.specialty,
          role: member.role,
          password: existing.password || passwordHash,
        },
      })
      await ensureSettings(existing.id, settingsDefaults)
      updated.push(`${member.name} -> ${member.email}`)
      continue
    }

    const user = await prisma.user.create({
      data: {
        name: member.name,
        email: member.email,
        specialty: member.specialty,
        role: member.role,
        password: passwordHash,
      },
    })

    await ensureSettings(user.id, settingsDefaults)
    created.push(`${member.name} -> ${member.email}`)
  }

  console.log("Equipo procesado correctamente.")
  console.log(`Contrasena temporal para las nuevas cuentas: ${TEMP_PASSWORD}`)
  console.log(`Admin asumida: Cecilia Salas (${ADMIN_EMAIL})`)
  console.log("Creados:")
  created.forEach((line) => console.log(`- ${line}`))
  console.log("Actualizados:")
  updated.forEach((line) => console.log(`- ${line}`))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
