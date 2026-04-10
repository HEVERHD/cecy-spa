import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@cecyspa.com"
  const password = "CecySpa2025!"
  const name = "Cecy Admin"

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log("✅ Admin ya existe:", existing.email)
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "ADMIN",
    },
  })

  await prisma.barberSettings.create({
    data: {
      userId: user.id,
      shopName: "Cecy D'Estética & Spa",
      openTime: "08:00",
      closeTime: "19:00",
      slotDuration: 30,
      daysOff: "0",
    },
  })

  // Create initial spa services
  const services = [
    { name: "Corte de Cabello", description: "Corte y peinado", price: 35000, duration: 45 },
    { name: "Tinte", description: "Coloración completa", price: 80000, duration: 90 },
    { name: "Mechas / Balayage", description: "Mechas o balayage profesional", price: 120000, duration: 120 },
    { name: "Tratamiento Capilar", description: "Nutrición e hidratación profunda", price: 60000, duration: 60 },
    { name: "Manicure", description: "Manicure clásico", price: 25000, duration: 45 },
    { name: "Pedicure", description: "Pedicure completo", price: 35000, duration: 60 },
    { name: "Facial Básico", description: "Limpieza facial profunda", price: 70000, duration: 60 },
    { name: "Depilación", description: "Depilación con cera", price: 30000, duration: 30 },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name.toLowerCase().replace(/[\s\/]+/g, "-") },
      update: {},
      create: {
        id: service.name.toLowerCase().replace(/[\s\/]+/g, "-"),
        ...service,
      },
    })
  }

  console.log("✅ Admin creado:", email)
  console.log("🔑 Contraseña:", password)
  console.log("🏪 Negocio:", "Cecy D'Estética & Spa")
  console.log("💆 Servicios creados:", services.length)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
