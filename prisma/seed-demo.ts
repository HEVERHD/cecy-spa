import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const ADMINS = [
  { email: "hever11.hdgd@gmail.com", name: "Hever" },
  { email: "arnulfoadg@gmail.com",   name: "Arnulfo" },
]

async function main() {
  // 1. Crear los dos usuarios admin
  for (const admin of ADMINS) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { role: "ADMIN" },
      create: { name: admin.name, email: admin.email, role: "ADMIN" },
    })
    console.log("Admin creado:", admin.email)
  }

  // Usar el primero como barbero principal para los settings
  const barber = await prisma.user.findUnique({ where: { email: ADMINS[0].email } })
  if (!barber) throw new Error("No se pudo crear el barbero principal")

  // 2. Configuración de la barbería demo
  await prisma.barberSettings.upsert({
    where: { userId: barber.id },
    update: {},
    create: {
      shopName: "StyleCut Barbería",
      openTime: "09:00",
      closeTime: "19:00",
      slotDuration: 30,
      daysOff: "0",
      userId: barber.id,
    },
  })
  console.log("Configuración creada: StyleCut Barbería")

  // 3. Servicios
  const services = [
    { id: "corte-clasico",       name: "Corte Clásico",       description: "Corte de cabello tradicional con tijera y máquina", price: 15000, duration: 30 },
    { id: "corte-degradado",     name: "Corte Degradado",     description: "Fade y degradado profesional con máquina",           price: 18000, duration: 40 },
    { id: "corte-barba",         name: "Corte + Barba",       description: "Corte de cabello más arreglo y perfilado de barba",  price: 25000, duration: 50 },
    { id: "arreglo-barba",       name: "Arreglo de Barba",    description: "Perfilado y arreglo profesional de barba",           price: 10000, duration: 20 },
    { id: "tratamiento-capilar", name: "Tratamiento Capilar", description: "Lavado, masaje capilar y tratamiento hidratante",    price: 20000, duration: 35 },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: service,
    })
  }
  console.log("Servicios creados:", services.length)
  console.log("\n✅ Demo listo")
  console.log("   Login: entrar con Google usando cualquiera de los dos emails")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
