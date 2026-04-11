import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseColombia, getColombiaDateStr } from "@/lib/utils"

export const dynamic = "force-dynamic"

function maskName(name: string | null): string {
  if (!name) return "Cliente"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[1][0]}.`
}

export async function GET(req: NextRequest) {
  const today = getColombiaDateStr(new Date())
  const { searchParams } = new URL(req.url)
  const barberId = searchParams.get("barberId")

  const [professionals, adminSettings, appointments] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: { in: ["BARBER", "ADMIN"] },
        barberSettings: { isNot: null },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.barberSettings.findFirst({
      where: { user: { role: "ADMIN" } },
      select: { shopName: true },
    }),
    prisma.appointment.findMany({
      where: {
        date: {
          gte: parseColombia(today + "T00:00:00"),
          lt: parseColombia(today + "T23:59:59"),
        },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        ...(barberId ? { barberId } : {}),
      },
      include: {
        user: { select: { name: true } },
        service: { select: { name: true, duration: true } },
        barber: {
          select: {
            id: true,
            name: true,
            barberSettings: { select: { shopName: true } },
          },
        },
      },
      orderBy: [{ date: "asc" }, { barberId: "asc" }],
    }),
  ])

  const shopName = adminSettings?.shopName || appointments[0]?.barber?.barberSettings?.shopName || "Mi Spa"

  return NextResponse.json(
    {
      shopName,
      professionals,
      selectedProfessionalId: barberId,
      appointments: appointments.map((apt) => ({
        id: apt.id,
        clientName: maskName(apt.user.name),
        serviceName: apt.service.name,
        professionalId: apt.barber.id,
        professionalName: apt.barber.name || "Profesional",
        duration: apt.service.duration,
        date: apt.date,
        status: apt.status,
      })),
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  )
}
