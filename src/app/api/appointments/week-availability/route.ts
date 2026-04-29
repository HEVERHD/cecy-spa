import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseColombia, getColombiaTime, getColombiaDayOfWeek } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const weekStartStr = searchParams.get("weekStart") // "YYYY-MM-DD" (Monday)
  const serviceId = searchParams.get("serviceId")
  const barberId = searchParams.get("barberId")

  if (!weekStartStr || !serviceId || !barberId) {
    return NextResponse.json({ error: "weekStart, serviceId and barberId required" }, { status: 400 })
  }

  // Build the 7 date strings for the week
  const base = parseColombia(weekStartStr + "T12:00:00")
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    // Format as YYYY-MM-DD in Colombia time
    dates.push(
      new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Bogota" }).format(d)
    )
  }

  const weekEnd = parseColombia(dates[6] + "T23:59:59")

  // Fetch everything in a single round-trip
  const [settings, service, appointments, blockedSlots, recurringBlocks] = await Promise.all([
    prisma.barberSettings.findUnique({ where: { userId: barberId } }),
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.appointment.findMany({
      where: {
        date: { gte: parseColombia(dates[0] + "T00:00:00"), lte: weekEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
        barberId,
      },
      include: { service: true },
    }),
    prisma.blockedSlot.findMany({ where: { date: { in: dates }, barberId } }),
    prisma.recurringBlock.findMany({ where: { barberId } }),
  ])

  if (!settings || !service) {
    return NextResponse.json({ error: "Settings or service not found" }, { status: 404 })
  }

  const daysOff = settings.daysOff.split(",").filter(Boolean).map(Number)

  // Current Colombia time for "past slot" detection
  const nowColombia = new Date(Date.now() - 5 * 60 * 60 * 1000)
  const todayColombia = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Bogota" }).format(new Date())
  const currentMinutes = nowColombia.getUTCHours() * 60 + nowColombia.getUTCMinutes()

  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
  }

  const availability: Record<string, "available" | "full" | "off"> = {}

  for (const dateStr of dates) {
    const dayStart = parseColombia(dateStr + "T00:00:00")
    const dayOfWeek = getColombiaDayOfWeek(dayStart)

    // Day off?
    if (daysOff.includes(dayOfWeek)) {
      availability[dateStr] = "off"
      continue
    }

    // All-day block?
    const dayBlocks = blockedSlots.filter((b) => b.date === dateStr)
    if (dayBlocks.some((b) => b.allDay)) {
      availability[dateStr] = "off"
      continue
    }

    // Resolve effective open/close for this day
    let effectiveOpen = settings.openTime
    let effectiveClose = settings.closeTime
    if (settings.daySchedules) {
      try {
        const daySchedules = JSON.parse(settings.daySchedules) as Record<string, { open: string; close: string }>
        const override = daySchedules[String(dayOfWeek)]
        if (override) { effectiveOpen = override.open; effectiveClose = override.close }
      } catch {}
    }

    const startMin = toMin(effectiveOpen)
    const endMin = toMin(effectiveClose)
    const isToday = dateStr === todayColombia

    // Appointments for this specific day
    const dayEnd = parseColombia(dateStr + "T23:59:59")
    const dayAppointments = appointments.filter((apt) => {
      const d = new Date(apt.date)
      return d >= dayStart && d < dayEnd
    })

    // Scan slots — stop as soon as we find one available slot
    let hasAvailable = false
    for (let m = startMin; m + service.duration <= endMin; m += 15) {
      const slotStart = m
      const slotEnd = m + service.duration

      if (isToday && slotStart < currentMinutes) continue

      const isBooked = dayAppointments.some((apt) => {
        const aptTime = getColombiaTime(new Date(apt.date))
        const aptStart = aptTime.hours * 60 + aptTime.minutes
        const aptEnd = aptStart + apt.service.duration
        return slotStart < aptEnd && slotEnd > aptStart
      })
      if (isBooked) continue

      const isBlocked =
        dayBlocks.some((b) => {
          if (b.allDay) return true
          const bs = toMin(b.startTime); const be = toMin(b.endTime)
          return slotStart < be && slotEnd > bs
        }) ||
        recurringBlocks.some((r) => {
          if (r.allDay) return true
          const bs = toMin(r.startTime); const be = toMin(r.endTime)
          return slotStart < be && slotEnd > bs
        })
      if (isBlocked) continue

      hasAvailable = true
      break
    }

    availability[dateStr] = hasAvailable ? "available" : "full"
  }

  return NextResponse.json({ availability })
}
