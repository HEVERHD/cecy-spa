/**
 * Seed script — carga todos los servicios del listado de precios de Cecy D'Estética & Spa
 * Uso: npx tsx scripts/seed-services.ts
 *
 * NOTA: Los servicios existentes NO se borran. Solo se insertan los que no existan aún
 * (se verifica por nombre exacto). Ejecuta cuando quieras actualizar el catálogo.
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const services = [
  // ── Cejas y Pestañas ──────────────────────────────────────
  { name: "Diseño de cejas",              category: "Cejas y Pestañas", price: 35000,  duration: 30  },
  { name: "Diseño de cejas + henna",      category: "Cejas y Pestañas", price: 45000,  duration: 45  },
  { name: "Laminado de cejas",            category: "Cejas y Pestañas", price: 100000, duration: 60  },
  { name: "Lifting",                      category: "Cejas y Pestañas", price: 90000,  duration: 60  },
  { name: "Lifting efecto pestañina",     category: "Cejas y Pestañas", price: 95000,  duration: 60  },
  { name: "Pestañas clásicas",            category: "Cejas y Pestañas", price: 100000, duration: 120 },
  { name: "Pestañas pestañina",           category: "Cejas y Pestañas", price: 110000, duration: 120 },
  { name: "Pestañas híbridas",            category: "Cejas y Pestañas", price: 120000, duration: 150 },
  { name: "Pestañas volumen 2D",          category: "Cejas y Pestañas", price: 120000, duration: 150 },
  { name: "Pestañas volumen 3D",          category: "Cejas y Pestañas", price: 130000, duration: 150 },
  { name: "Pestañas volumen 4D",          category: "Cejas y Pestañas", price: 140000, duration: 180 },
  { name: "Pestañas pelo a pelo",         category: "Cejas y Pestañas", price: 100000, duration: 120 },
  { name: "Pestañas punto a punto",       category: "Cejas y Pestañas", price: 60000,  duration: 60  },
  { name: "Retiro de pestañas",           category: "Cejas y Pestañas", price: 50000,  duration: 30  },
  { name: "Microblading cejas",           category: "Cejas y Pestañas", price: 200000, duration: 120 },
  { name: "Microblading cejas (retoque)", category: "Cejas y Pestañas", price: 150000, duration: 90  },
  { name: "Microblading labios",          category: "Cejas y Pestañas", price: 280000, duration: 120 },

  // ── Peluquería ────────────────────────────────────────────
  { name: "Corte cabello dama",                           category: "Peluquería", price: 30000,  duration: 45  },
  { name: "Solo shampoo",                                 category: "Peluquería", price: 10000,  duration: 20  },
  { name: "Cepillado",                                    category: "Peluquería", price: 35000,  duration: 45  },
  { name: "Planchado",                                    category: "Peluquería", price: 30000,  duration: 45  },
  { name: "Tinte (un tono)",                              category: "Peluquería", price: 120000, duration: 120 },
  { name: "Aplicación de tinte (clienta trae el tinte)",  category: "Peluquería", price: 90000,  duration: 90  },
  { name: "Balayage",                                     category: "Peluquería", price: 280000, duration: 180 },
  { name: "Aplicación de matizante",                      category: "Peluquería", price: 60000,  duration: 60  },
  { name: "Hidratación capilar",                          category: "Peluquería", price: 80000,  duration: 60  },
  { name: "Hidratación capilar + corte y cepillado",      category: "Peluquería", price: 130000, duration: 90  },
  { name: "Aminoácidos o Keratina",                       category: "Peluquería", price: 250000, duration: 120 },
  { name: "Repolarización capilar",                       category: "Peluquería", price: 80000,  duration: 60  },

  // ── Maquillaje ────────────────────────────────────────────
  { name: "Maquillaje sencillo",     category: "Maquillaje", price: 90000,  duration: 60  },
  { name: "Maquillaje social",       category: "Maquillaje", price: 120000, duration: 90  },
  { name: "Maquillaje quinceañero",  category: "Maquillaje", price: 160000, duration: 120 },
  { name: "Maquillaje matrimonio",   category: "Maquillaje", price: 180000, duration: 120 },
  { name: "Maquillaje novia",        category: "Maquillaje", price: 300000, duration: 150 },

  // ── Estética y Spa ────────────────────────────────────────
  { name: "Limpieza facial básica",                    category: "Estética y Spa", price: 100000, duration: 60  },
  { name: "Limpieza facial profunda",                  category: "Estética y Spa", price: 150000, duration: 90  },
  { name: "Limpieza facial + Microdermoabrasión",      category: "Estética y Spa", price: 190000, duration: 90  },
  { name: "Limpieza facial + Radiofrecuencia",         category: "Estética y Spa", price: 220000, duration: 90  },
  { name: "Limpieza facial + Microderma + R.F.",       category: "Estética y Spa", price: 280000, duration: 120 },
  { name: "Hydrafacial",                               category: "Estética y Spa", price: 170000, duration: 60  },
  { name: "Masaje espalda",                            category: "Estética y Spa", price: 90000,  duration: 45  },
  { name: "Masaje relajante completo",                 category: "Estética y Spa", price: 150000, duration: 90  },
  { name: "Masaje deportivo",                          category: "Estética y Spa", price: 120000, duration: 60  },
  { name: "Terapia 3 pasos",                           category: "Estética y Spa", price: 180000, duration: 120 },
  { name: "Masaje reductor (1 sesión)",                category: "Estética y Spa", price: 79900,  duration: 60  },
  { name: "Reducción y moldeo (1 sesión)",             category: "Estética y Spa", price: 99000,  duration: 60  },
  { name: "Terapia de colon",                          category: "Estética y Spa", price: 60000,  duration: 45  },
  { name: "Levantamiento de glúteos",                  category: "Estética y Spa", price: 89000,  duration: 60  },
  { name: "Desintoxicación iónica",                    category: "Estética y Spa", price: 80000,  duration: 45  },
  { name: "SPA pies",                                  category: "Estética y Spa", price: 75000,  duration: 60  },

  // ── Depilación Damas ──────────────────────────────────────
  { name: "Depilación cejas cera",      category: "Depilación Damas", price: 15000, duration: 20 },
  { name: "Depilación bozo/bigote",     category: "Depilación Damas", price: 13000, duration: 15 },
  { name: "Depilación patillas/pómulos",category: "Depilación Damas", price: 10000, duration: 15 },
  { name: "Depilación barbilla",        category: "Depilación Damas", price: 8000,  duration: 15 },
  { name: "Depilación brazo",           category: "Depilación Damas", price: 15000, duration: 30 },
  { name: "Depilación axilas",          category: "Depilación Damas", price: 18000, duration: 20 },
  { name: "Depilación media pierna",    category: "Depilación Damas", price: 25000, duration: 30 },
  { name: "Depilación pierna completa", category: "Depilación Damas", price: 35000, duration: 45 },
  { name: "Depilación bikini parcial",  category: "Depilación Damas", price: 40000, duration: 30 },
  { name: "Depilación bikini completo", category: "Depilación Damas", price: 60000, duration: 45 },

  // ── Depilación Caballero ──────────────────────────────────
  { name: "Depilación pecho (poco)",         category: "Depilación Caballero", price: 45000, duration: 30 },
  { name: "Depilación pecho (mucho)",        category: "Depilación Caballero", price: 60000, duration: 45 },
  { name: "Depilación espalda (poco)",       category: "Depilación Caballero", price: 60000, duration: 30 },
  { name: "Depilación espalda (mucho)",      category: "Depilación Caballero", price: 70000, duration: 45 },
  { name: "Depilación brazos (poco)",        category: "Depilación Caballero", price: 20000, duration: 30 },
  { name: "Depilación brazos (mucho)",       category: "Depilación Caballero", price: 35000, duration: 45 },
  { name: "Depilación media pierna caball.", category: "Depilación Caballero", price: 25000, duration: 30 },
  { name: "Depilación pierna completa cab.", category: "Depilación Caballero", price: 55000, duration: 45 },
  { name: "Depilación bikini medio caball.", category: "Depilación Caballero", price: 40000, duration: 30 },
  { name: "Depilación bikini completo cab.", category: "Depilación Caballero", price: 85000, duration: 45 },

  // ── Rehabilitación ────────────────────────────────────────
  { name: "Rehabilitación (sesión única)",            category: "Rehabilitación", price: 80000,  duration: 60  },
  { name: "Rehabilitación (sesión a domicilio)",      category: "Rehabilitación", price: 100000, duration: 60  },
  { name: "Masaje terapéutico",                       category: "Rehabilitación", price: 70000,  duration: 45  },

  // ── Manos y Pies ──────────────────────────────────────────
  { name: "Limpieza manos",                  category: "Manos y Pies", price: 20000,  duration: 30  },
  { name: "Limpieza pies",                   category: "Manos y Pies", price: 35000,  duration: 30  },
  { name: "Spa de manos y pies",             category: "Manos y Pies", price: 150000, duration: 120 },
  { name: "Manicure tradicional",            category: "Manos y Pies", price: 25000,  duration: 45  },
  { name: "Pedicure tradicional",            category: "Manos y Pies", price: 40000,  duration: 60  },
  { name: "Polish",                          category: "Manos y Pies", price: 24000,  duration: 30  },
  { name: "Manicure semipermanente",         category: "Manos y Pies", price: 55000,  duration: 60  },
  { name: "Pedicure semipermanente",         category: "Manos y Pies", price: 60000,  duration: 75  },
  { name: "Base rubber sola",                category: "Manos y Pies", price: 70000,  duration: 45  },
  { name: "Base rubber + tradicional",       category: "Manos y Pies", price: 80000,  duration: 60  },
  { name: "Base rubber + semipermanente",    category: "Manos y Pies", price: 85000,  duration: 75  },
  { name: "Pedicure uñas encarnadas",        category: "Manos y Pies", price: 45000,  duration: 60  },
  { name: "Pedicure medicado",               category: "Manos y Pies", price: 55000,  duration: 60  },
  { name: "Dipping o Kapping",               category: "Manos y Pies", price: 85000,  duration: 75  },
  { name: "Press on / Poly gel",             category: "Manos y Pies", price: 120000, duration: 90  },
  { name: "Acrílico esculpidas o con tips",  category: "Manos y Pies", price: 140000, duration: 120 },

  // ── Peinados ──────────────────────────────────────────────
  { name: "Trenzas sencillas",           category: "Peinados", price: 20000, duration: 45  },
  { name: "Trenzas boxeadoras",          category: "Peinados", price: 25000, duration: 60  },
  { name: "Trenzas con accesorios",      category: "Peinados", price: 26000, duration: 60  },
  { name: "Balaca sencilla",             category: "Peinados", price: 25000, duration: 30  },
  { name: "Peinado con ondas",           category: "Peinados", price: 40000, duration: 60  },
  { name: "Peinado con ondas y trenzas", category: "Peinados", price: 60000, duration: 75  },
  { name: "Cola alta con trenzas",       category: "Peinados", price: 50000, duration: 60  },
  { name: "Peinado con Donna",           category: "Peinados", price: 60000, duration: 75  },
]

async function main() {
  console.log(`\n🌸 Seeding ${services.length} servicios...\n`)
  let created = 0
  let skipped = 0

  for (const s of services) {
    const exists = await prisma.service.findFirst({ where: { name: s.name } })
    if (exists) {
      console.log(`  ⏭  Ya existe: ${s.name}`)
      skipped++
    } else {
      await prisma.service.create({ data: s })
      console.log(`  ✅ Creado: ${s.name} (${s.category}) — $${s.price.toLocaleString("es-CO")}`)
      created++
    }
  }

  console.log(`\n✨ Listo: ${created} creados, ${skipped} omitidos.\n`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
