"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock, Scissors, ChevronLeft, ChevronRight, Search } from "lucide-react"

type Barber = {
  id: string
  name: string | null
  image: string | null
  avatarUrl: string | null
  specialty: string | null
}

type Service = {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  category: string
}

type Step = "barber" | "service" | "datetime" | "info" | "notify" | "confirm"

// ── Week helpers ──────────────────────────────────────────────
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
}

const COL_TZ = "America/Bogota"

function toLocalDateStr(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: COL_TZ }).format(date)
}

function formatTime(slot: string): string {
  const [h, m] = slot.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`
}

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"]

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("barber")
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [slots, setSlots] = useState<string[]>([])
  const [dayOff, setDayOff] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifySMS, setNotifySMS] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [nameSuggestions, setNameSuggestions] = useState<{ name: string; phone: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [serviceSearch, setServiceSearch] = useState("")
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [waitlistName, setWaitlistName] = useState("")
  const [waitlistPhone, setWaitlistPhone] = useState("")
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false)
  const [waitlistDone, setWaitlistDone] = useState(false)
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [shopName, setShopName] = useState("Mi Spa")
  const [rememberMe, setRememberMe] = useState(false)
  const [weekAvailability, setWeekAvailability] = useState<Record<string, "available" | "full" | "off">>({})

  // ── Data fetching ──────────────────────────────────────────
  // Pre-fill client info from localStorage on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cecy-client-info")
      if (saved) {
        const info = JSON.parse(saved)
        if (info.name) setClientName(info.name)
        if (info.phone) setClientPhone(info.phone)
        if (info.email) setClientEmail(info.email)
        setRememberMe(true)
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => { if (s?.shopName) setShopName(s.shopName) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/barbers")
      .then((r) => r.json())
      .then((data: Barber[]) => {
        setBarbers(data)
        if (data.length === 1) {
          setSelectedBarber(data[0])
          setStep("service")
        }
      })
  }, [])

  useEffect(() => {
    if (step === "service" && services.length === 0) {
      fetch("/api/services")
        .then((r) => r.json())
        .then(setServices)
    }
  }, [step, services.length])

  // Auto-select today when entering the datetime step (so slots load immediately)
  useEffect(() => {
    if (step === "datetime" && !selectedDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      setSelectedDate(toLocalDateStr(today))
    }
  }, [step, selectedDate])

  useEffect(() => {
    if (selectedDate && selectedService && selectedBarber) {
      setLoading(true)
      setSlots([])
      setDayOff(false)
      fetch(`/api/appointments/slots?date=${selectedDate}&serviceId=${selectedService.id}&barberId=${selectedBarber.id}`)
        .then((r) => r.json())
        .then((data) => {
          const allSlots: { time: string; available: boolean }[] = data.slots ?? []
          setSlots(allSlots.filter((s) => s.available).map((s) => s.time))
          setDayOff(data.dayOff ?? false)
          setLoading(false)
        })
    }
  }, [selectedDate, selectedService, selectedBarber])

  // Fetch week availability for dot indicators — one request covers all 7 days
  useEffect(() => {
    if (!selectedService || !selectedBarber) return
    const wStr = toLocalDateStr(weekStart)
    fetch(
      `/api/appointments/week-availability?weekStart=${wStr}&serviceId=${selectedService.id}&barberId=${selectedBarber.id}`
    )
      .then((r) => r.json())
      .then((data) => setWeekAvailability(data.availability ?? {}))
      .catch(() => {})
  }, [weekStart, selectedService, selectedBarber])

  // ── Handlers ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone || !selectedBarber) return
    setSubmitting(true)
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: selectedService.id,
        barberId: selectedBarber.id,
        date: `${selectedDate}T${selectedTime}:00`,
        clientName,
        phone: clientPhone,
        email: clientEmail,
        bookedBy: "CLIENT",
        notificationChannels: [
          ...(notifyWhatsApp ? ["whatsapp"] : []),
          ...(notifyEmail ? ["email"] : []),
          ...(notifySMS ? ["sms"] : []),
        ],
      }),
    })
    if (res.ok) {
      const params = new URLSearchParams({
        service: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        duration: selectedService.duration.toString(),
        price: selectedService.price.toString(),
        name: clientName,
        barber: selectedBarber.name || "",
      })
      router.push(`/booking/confirm?${params.toString()}`)
    } else {
      const data = await res.json()
      setError(data.error || "Error al agendar la cita")
    }
    setSubmitting(false)
  }

  const handleWaitlistSubmit = async () => {
    if (!waitlistName || !waitlistPhone || !selectedService || !selectedDate) return
    setWaitlistSubmitting(true)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, name: waitlistName, phone: waitlistPhone, serviceId: selectedService.id }),
      })
      if (res.ok) {
        setWaitlistDone(true)
      } else {
        const data = await res.json()
        setError(data.error || "Error al unirse a la lista")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setWaitlistSubmitting(false)
    }
  }

  useEffect(() => {
    if (clientName.length >= 1) {
      fetch(`/api/search-client?q=${encodeURIComponent(clientName)}`)
        .then((r) => r.json())
        .then((clients: { name: string; phone: string }[]) => {
          setNameSuggestions(clients)
          setShowSuggestions(clients.length > 0)
        })
    } else {
      setNameSuggestions([])
      setShowSuggestions(false)
    }
  }, [clientName])

  // ── Week navigation ────────────────────────────────────────
  const todayLocal = new Date()
  todayLocal.setHours(0, 0, 0, 0)
  const todayStr = toLocalDateStr(todayLocal)
  const currentWeekStart = getWeekStart(todayLocal)
  const weekDays = getWeekDays(weekStart)
  const monthLabel = weekStart.toLocaleDateString("es-ES", { month: "long", year: "numeric" })

  const handleDateSelect = (date: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    if (d.getTime() < todayLocal.getTime()) return
    setSelectedDate(toLocalDateStr(d))
    setSelectedTime("")
  }

  const prevWeek = () => {
    const prev = new Date(weekStart)
    prev.setDate(prev.getDate() - 7)
    if (prev.getTime() >= currentWeekStart.getTime()) setWeekStart(prev)
  }

  const nextWeek = () => {
    const next = new Date(weekStart)
    next.setDate(next.getDate() + 7)
    setWeekStart(next)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price)

  const progressSteps: Step[] = ["barber", "service", "datetime", "info", "notify"]
  const visibleProgressSteps = barbers.length <= 1 ? progressSteps.filter((s) => s !== "barber") : progressSteps
  const allSteps: Step[] =
    barbers.length <= 1
      ? ["service", "datetime", "info", "notify", "confirm"]
      : ["barber", "service", "datetime", "info", "notify", "confirm"]

  // Auto-select category based on barber specialty when services load or barber changes
  useEffect(() => {
    if (services.length === 0) return
    if (!selectedBarber?.specialty) { setActiveCategory("Todos"); return }
    const specialty = selectedBarber.specialty.trim().toLowerCase()
    const cats = Array.from(new Set(services.map((s: Service) => s.category).filter(Boolean)))
    const match = cats.find((c) => c.toLowerCase() === specialty)
    setActiveCategory(match ?? "Todos")
  }, [selectedBarber?.id, services.length])

  // ── Category filter ────────────────────────────────────────
  const categories = ["Todos", ...Array.from(new Set(services.map((s: Service) => s.category).filter(Boolean)))]
  const filteredServices = services
    .filter((s: Service) => activeCategory === "Todos" || s.category === activeCategory)
    .filter((s: Service) => !serviceSearch || s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || (s.description ?? "").toLowerCase().includes(serviceSearch.toLowerCase()))

  // ── Input styles ───────────────────────────────────────────
  const inputCls = "w-full p-3.5 bg-[#151515] border border-white/12 rounded-xl text-white placeholder-white/25 focus:border-[#00bcd4] focus:outline-none transition text-sm"

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Image src="/barberia.jpg" alt="" fill className="object-cover object-center scale-105" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/75" />
      </div>

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#00bcd4]/8 rounded-full blur-[120px] pointer-events-none z-10" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-10 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-1.5 text-white/30 hover:text-white/70 transition text-sm">
            <ArrowLeft size={15} />
            <span>Inicio</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Image src="/logo2.png" alt="Spa" width={28} height={28} />
            <span className="font-black text-base tracking-wide">
              {shopName}
            </span>
          </div>
          <div className="w-16" />
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {visibleProgressSteps.map((s) => {
            const active = allSteps.indexOf(step) >= allSteps.indexOf(s)
            return (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${active ? "w-8 bg-[#00bcd4]" : "w-5 bg-white/10"}`}
              />
            )
          })}
        </div>

        {/* ── Step: Barber ── */}
        {step === "barber" && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-bold text-[#00bcd4] tracking-[0.2em] uppercase mb-2">Paso 1</p>
              <h2 className="text-2xl font-black">Elige tu profesional</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {barbers.map((barber, index) => {
                const isLastOdd = barbers.length % 2 !== 0 && index === barbers.length - 1
                return (
                  <button
                    key={barber.id}
                    onClick={() => { setSelectedBarber(barber); setStep("service") }}
                    className={`group relative rounded-2xl overflow-hidden border border-white/10 hover:border-[#00bcd4]/70 transition-all duration-300 bg-[#111] shadow-lg hover:shadow-[0_8px_30px_rgba(0,188,212,0.15)] ${isLastOdd ? "col-span-2" : ""}`}
                  >
                    {/* Photo */}
                    <div className={`relative w-full overflow-hidden ${isLastOdd ? "aspect-[21/9]" : "aspect-[3/4]"}`}>
                      {barber.avatarUrl || barber.image ? (
                        <Image
                          src={barber.avatarUrl || barber.image || ""}
                          alt={barber.name || ""}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0d2535] to-[#091820] flex items-center justify-center">
                          <span className="text-6xl font-black text-[#00bcd4]/30">
                            {(barber.name || "B").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Bottom gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                      {/* Hover cyan tint */}
                      <div className="absolute inset-0 bg-[#00bcd4]/0 group-hover:bg-[#00bcd4]/8 transition-colors duration-300" />
                    </div>

                    {/* Name + specialty on gradient */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5">
                      <p className="font-bold text-white text-sm leading-snug">{barber.name || "Profesional"}</p>
                      {barber.specialty && (
                        <p className="text-[11px] text-white/50 mt-0.5 leading-snug line-clamp-2">{barber.specialty}</p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 flex items-center justify-center group-hover:bg-[#00bcd4] group-hover:border-[#00bcd4] transition-all duration-300">
                      <ChevronRight size={12} className="text-white/60 group-hover:text-white transition" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step: Service ── */}
        {step === "service" && (
          <div>
            <div className="mb-6">
              <p className="text-xs font-bold text-[#00bcd4] tracking-[0.2em] uppercase mb-2">
                {barbers.length > 1 ? "Paso 2" : "Paso 1"}
              </p>
              <h2 className="text-2xl font-black">Elige tu servicio</h2>
            </div>

            {/* Search bar */}
            <div className="relative mb-5">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar servicio..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full py-3 pl-10 pr-4 bg-[#151515] border border-white/12 rounded-xl text-white placeholder-white/25 focus:border-[#00bcd4] focus:outline-none transition text-sm"
              />
            </div>

            {/* Category chips */}
            {categories.length > 2 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide -mx-1 px-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-[#00bcd4] text-white shadow-md shadow-[#00bcd4]/30"
                        : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {filteredServices.map((service: Service) => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep("datetime") }}
                  className="w-full text-left p-5 rounded-2xl border border-white/12 bg-[#1a1a1a] hover:border-[#00bcd4]/50 hover:bg-[#00bcd4]/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-white text-base">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-white/40 mt-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <Clock size={12} className="text-white/25" />
                        <span className="text-xs text-white/30">{service.duration} min</span>
                      </div>
                    </div>
                    <span className="font-black text-[#00bcd4] text-lg shrink-0">{formatPrice(service.price)}</span>
                  </div>
                </button>
              ))}
            </div>
            {barbers.length > 1 && (
              <button onClick={() => setStep("barber")} className="w-full mt-5 py-3.5 rounded-xl border border-white/12 text-white/50 hover:text-white hover:border-white/20 transition text-sm font-medium flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Atrás
              </button>
            )}
          </div>
        )}

        {/* ── Step: Date + Time ── */}
        {step === "datetime" && (
          <div>
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00bcd4] tracking-[0.2em] uppercase mb-2">
                {barbers.length > 1 ? "Paso 3" : "Paso 2"}
              </p>
              <h2 className="text-2xl font-black">Fecha y hora</h2>
            </div>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevWeek}
                disabled={weekStart.getTime() <= currentWeekStart.getTime()}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-20 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold capitalize text-white/60">{monthLabel}</span>
              <button onClick={nextWeek} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Week strip */}
            <div className="grid grid-cols-7 gap-1.5 mb-6">
              {weekDays.map((day, i) => {
                const dateStr = toLocalDateStr(day)
                const isPast = day.getTime() < todayLocal.getTime()
                const isToday = dateStr === todayStr
                const isSelected = dateStr === selectedDate
                const avail = weekAvailability[dateStr]
                const isOff = avail === "off"
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-white/25 uppercase">{DAY_LABELS[i]}</span>
                    <button
                      onClick={() => handleDateSelect(day)}
                      disabled={isPast || isOff}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition select-none
                        ${isSelected ? "bg-[#00bcd4] text-white shadow-lg shadow-[#00bcd4]/30"
                          : isToday ? "bg-white/8 text-white ring-1 ring-white/20"
                          : (isPast || isOff) ? "text-white/15 cursor-not-allowed"
                          : "text-white/60 hover:bg-white/8 hover:text-white"
                        }`}
                    >
                      {day.getDate()}
                    </button>
                    {/* Availability dot */}
                    <div className="h-1.5 flex items-center justify-center">
                      {!isPast && avail === "available" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                      {!isPast && avail === "full" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 mb-5" />

            {/* Time slots */}
            {!selectedDate ? (
              <p className="text-center text-white/25 text-sm py-8">Selecciona un día para ver los horarios</p>
            ) : loading ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#00bcd4]/20 border-t-[#00bcd4] animate-spin" />
                <p className="text-sm text-white/30">Cargando horarios...</p>
              </div>
            ) : dayOff ? (
              <div className="text-center py-8">
                <p className="text-white/50 font-medium">Este día no hay servicio</p>
                <p className="text-sm text-white/25 mt-1">Elige otra fecha</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-white/40 mb-4 text-sm">No hay horarios disponibles para este día</p>
                {waitlistDone ? (
                  <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-emerald-400 font-medium text-sm">Te avisamos si se abre un horario ✓</p>
                  </div>
                ) : showWaitlist ? (
                  <div className="text-left space-y-3">
                    <p className="text-sm text-white/50 font-medium mb-3">Lista de espera</p>
                    <input type="text" placeholder="Tu nombre" value={waitlistName} onChange={(e) => setWaitlistName(e.target.value)} className={inputCls} />
                    <input type="tel" placeholder="+57 3001234567" value={waitlistPhone} onChange={(e) => setWaitlistPhone(e.target.value)} className={inputCls} />
                    <div className="flex gap-3">
                      <button onClick={() => setShowWaitlist(false)} className="flex-1 py-3 rounded-xl border border-white/12 text-white/50 hover:text-white transition text-sm">Cancelar</button>
                      <button onClick={handleWaitlistSubmit} disabled={waitlistSubmitting || !waitlistName || !waitlistPhone} className="flex-1 py-3 rounded-xl bg-[#00bcd4] text-white font-medium hover:bg-[#0097a7] transition disabled:opacity-50 text-sm">
                        {waitlistSubmitting ? "Enviando..." : "Avisarme"}
                      </button>
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                  </div>
                ) : (
                  <button onClick={() => setShowWaitlist(true)} className="w-full py-3.5 rounded-xl border border-[#00bcd4]/40 text-[#00bcd4] font-medium hover:bg-[#00bcd4]/10 transition text-sm">
                    Unirme a lista de espera
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => {
                  const [h, m] = slot.split(":").map(Number)
                  const period = h >= 12 ? "PM" : "AM"
                  const hour = h % 12 || 12
                  const timeStr = `${hour}:${m.toString().padStart(2, "0")}`
                  const isSelected = selectedTime === slot
                  return (
                    <button
                      key={slot}
                      onClick={() => { setSelectedTime(slot); setTimeout(() => setStep("info"), 150) }}
                      className={`py-3 rounded-xl border transition flex flex-col items-center gap-0.5
                        ${isSelected
                          ? "bg-[#00bcd4] border-[#00bcd4] text-white shadow-lg shadow-[#00bcd4]/25"
                          : "border-white/12 bg-[#1a1a1a] text-white/70 hover:border-[#00bcd4]/40 hover:text-white"
                        }`}
                    >
                      <span className="font-bold text-[13px] leading-tight">{timeStr}</span>
                      <span className={`text-[10px] leading-tight ${isSelected ? "text-white/70" : "text-white/30"}`}>{period}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Nav */}
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep("service")} className="flex-1 py-3.5 rounded-xl border border-white/12 text-white/50 hover:text-white hover:border-white/20 transition text-sm font-medium flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Atrás
              </button>
              <button
                onClick={() => selectedDate && selectedTime && setStep("info")}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 py-3.5 rounded-xl bg-[#00bcd4] text-white font-semibold hover:bg-[#0097a7] transition disabled:opacity-30 text-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Info ── */}
        {step === "info" && (
          <div>
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00bcd4] tracking-[0.2em] uppercase mb-2">
                {barbers.length > 1 ? "Paso 4" : "Paso 3"}
              </p>
              <h2 className="text-2xl font-black">Tus datos</h2>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Nombre *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus={() => nameSuggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Tu nombre completo"
                  className={inputCls}
                />
                {showSuggestions && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-[#1a1a1a] border border-white/12 rounded-xl shadow-2xl overflow-hidden">
                    {nameSuggestions.map((s) => (
                      <button
                        key={s.name}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setClientName(s.name); if (s.phone) setClientPhone(s.phone); setShowSuggestions(false) }}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0 flex items-center gap-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#00bcd4]/15 flex items-center justify-center text-[#00bcd4] font-bold text-xs flex-shrink-0">
                          {s.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white/70">{s.name}</p>
                          {s.phone && <p className="text-xs text-white/30">{s.phone}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">WhatsApp *</label>
                <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+57 300 123 4567" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Email <span className="normal-case font-normal text-white/20">(opcional)</span></label>
                <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="tu@email.com" className={inputCls} />
              </div>

              {/* Recuérdame */}
              <button
                type="button"
                onClick={() => {
                  const next = !rememberMe
                  setRememberMe(next)
                  if (!next) { try { localStorage.removeItem("cecy-client-info") } catch {} }
                }}
                className="flex items-center gap-3 pt-1 group"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${rememberMe ? "border-[#00bcd4] bg-[#00bcd4]" : "border-white/20 group-hover:border-white/40"}`}>
                  {rememberMe && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-white/50 group-hover:text-white/70 transition">Recuérdame para la próxima vez</span>
              </button>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep("datetime")} className="flex-1 py-3.5 rounded-xl border border-white/12 text-white/50 hover:text-white hover:border-white/20 transition text-sm font-medium flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Atrás
              </button>
              <button
                onClick={() => {
                  if (!clientName || !clientPhone) return
                  if (rememberMe) {
                    try { localStorage.setItem("cecy-client-info", JSON.stringify({ name: clientName, phone: clientPhone, email: clientEmail })) } catch {}
                  }
                  setStep("notify")
                }}
                disabled={!clientName || !clientPhone}
                className="flex-1 py-3.5 rounded-xl bg-[#00bcd4] text-white font-semibold hover:bg-[#0097a7] transition disabled:opacity-30 text-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Notify ── */}
        {step === "notify" && (
          <div>
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00bcd4] tracking-[0.2em] uppercase mb-2">
                {barbers.length > 1 ? "Paso 5" : "Paso 4"}
              </p>
              <h2 className="text-2xl font-black">¿Cómo te avisamos?</h2>
              <p className="text-white/40 text-sm mt-2">Confirmación y recordatorio 1 hora antes</p>
            </div>

            {/* Panel oscuro con blur para que las cards sean legibles sobre el fondo */}
            <div className="space-y-2.5 bg-black/55 backdrop-blur-xl rounded-2xl p-4 border border-white/8">

              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => setNotifyWhatsApp(!notifyWhatsApp)}
                className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 text-left ${
                  notifyWhatsApp
                    ? "border-[#00bcd4] bg-[#00bcd4]/20"
                    : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${notifyWhatsApp ? "bg-green-500/25" : "bg-white/8"}`}>
                  💬
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">WhatsApp</p>
                  <p className="text-xs text-white/50 truncate">{clientPhone || "Tu número celular"}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${notifyWhatsApp ? "border-[#00bcd4] bg-[#00bcd4]" : "border-white/20"}`}>
                  {notifyWhatsApp && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={() => { if (clientEmail) setNotifyEmail(!notifyEmail) }}
                disabled={!clientEmail}
                className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 text-left ${
                  !clientEmail
                    ? "border-white/5 bg-white/3 opacity-40 cursor-not-allowed"
                    : notifyEmail
                    ? "border-[#00bcd4] bg-[#00bcd4]/20"
                    : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${notifyEmail && clientEmail ? "bg-blue-500/25" : "bg-white/8"}`}>
                  ✉️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">Email</p>
                  <p className="text-xs text-white/50 truncate">{clientEmail || "Vuelve atrás y agrega tu email"}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${notifyEmail && clientEmail ? "border-[#00bcd4] bg-[#00bcd4]" : "border-white/20"}`}>
                  {notifyEmail && clientEmail && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </button>

              {/* SMS - disabled */}
              <div className="w-full p-4 rounded-xl border border-white/8 bg-white/3 flex items-center gap-4 opacity-35 cursor-not-allowed">
                <div className="w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center text-xl flex-shrink-0">📱</div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">SMS</p>
                  <p className="text-xs text-white/50">No disponible actualmente</p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-white/20 flex-shrink-0" />
              </div>

            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep("info")} className="flex-1 py-3.5 rounded-xl border border-white/12 text-white/50 hover:text-white hover:border-white/20 transition text-sm font-medium flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Atrás
              </button>
              <button
                onClick={() => (notifyWhatsApp || notifyEmail) && setStep("confirm")}
                disabled={!notifyWhatsApp && !notifyEmail}
                className="flex-1 py-3.5 rounded-xl bg-[#00bcd4] text-white font-semibold hover:bg-[#0097a7] transition disabled:opacity-30 text-sm"
              >
                Revisar
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Confirm ── */}
        {step === "confirm" && (
          <div>
            <div className="mb-8">
              <p className="text-xs font-bold text-[#00bcd4] tracking-[0.2em] uppercase mb-2">Último paso</p>
              <h2 className="text-2xl font-black">Confirma tu cita</h2>
            </div>

            {/* Summary card */}
            <div className="bg-[#1a1a1a] border border-white/12 rounded-2xl overflow-hidden mb-4">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#00bcd4]/15 rounded-lg flex items-center justify-center">
                  <Scissors size={15} className="text-[#00bcd4]" />
                </div>
                <p className="font-bold text-white">{selectedService?.name}</p>
              </div>
              {/* Details */}
              <div className="divide-y divide-white/5">
                {selectedBarber && barbers.length > 1 && (
                  <div className="flex justify-between items-center px-5 py-3.5">
                    <span className="text-sm text-white/40">Profesional</span>
                    <span className="text-sm font-semibold text-white">{selectedBarber.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="text-sm text-white/40">Fecha</span>
                  <span className="text-sm font-semibold text-white capitalize">
                    {selectedDate && new Date(selectedDate + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                </div>
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="text-sm text-white/40">Hora</span>
                  <span className="text-sm font-semibold text-white">{selectedTime && formatTime(selectedTime)}</span>
                </div>
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="text-sm text-white/40">Duración</span>
                  <span className="text-sm font-semibold text-white">{selectedService?.duration} min</span>
                </div>
                <div className="flex justify-between items-center px-5 py-4 bg-[#00bcd4]/5">
                  <span className="text-sm font-bold text-white">Total</span>
                  <span className="font-black text-xl text-[#00bcd4]">{selectedService && formatPrice(selectedService.price)}</span>
                </div>
              </div>
            </div>

            {/* Client summary */}
            <div className="bg-[#1a1a1a] border border-white/12 rounded-xl px-5 py-3.5 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#00bcd4]/15 rounded-full flex items-center justify-center text-[#00bcd4] font-black text-sm">
                {clientName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{clientName}</p>
                <p className="text-xs text-white/35">{clientPhone}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("info")} className="flex-1 py-3.5 rounded-xl border border-white/12 text-white/50 hover:text-white hover:border-white/20 transition text-sm font-medium flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white font-bold hover:shadow-lg hover:shadow-[#00bcd4]/25 transition-all disabled:opacity-50 text-sm"
              >
                {submitting ? "Agendando..." : "Confirmar Cita"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3.5 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
