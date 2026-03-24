"use client"

import { useEffect, useState } from "react"
import { CalendarDays, UserCheck, UserX, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react"

type EventType = "booked" | "confirmed" | "completed" | "cancelled" | "noshow"

type ActivityEvent = {
  id: string
  type: EventType
  clientName: string
  clientPhone: string | null
  serviceName: string
  appointmentDate: string
  bookedBy: string
  eventAt: string
}

const EVENT_CONFIG: Record<EventType, { label: string; icon: React.ElementType; color: string; bg: string; dot: string }> = {
  booked:    { label: "Agendó",     icon: CalendarDays, color: "text-blue-400",   bg: "bg-blue-500/10",   dot: "bg-blue-400" },
  confirmed: { label: "Confirmada", icon: UserCheck,    color: "text-indigo-400", bg: "bg-indigo-500/10", dot: "bg-indigo-400" },
  completed: { label: "Completada", icon: CheckCircle2, color: "text-green-400",  bg: "bg-green-500/10",  dot: "bg-green-400" },
  cancelled: { label: "Canceló",    icon: XCircle,      color: "text-red-400",    bg: "bg-red-500/10",    dot: "bg-red-400" },
  noshow:    { label: "No asistió", icon: UserX,        color: "text-white/40",   bg: "bg-white/5",       dot: "bg-white/30" },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return "ahora"
  if (mins < 60)  return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days < 7)   return `${days}d`
  return new Date(dateStr).toLocaleDateString("es-CO", { day: "numeric", month: "short" })
}

function formatApptDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
    timeZone: "America/Bogota",
  })
}

export default function ActivityPage() {
  const [events, setEvents]     = useState<ActivityEvent[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<EventType | "all">("all")
  const [refreshing, setRefreshing] = useState(false)

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    const data = await fetch("/api/activity").then((r) => r.json())
    setEvents(data)
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter)

  const chips = [
    { key: "booked",    label: "Agendadas",   count: events.filter((e) => e.type === "booked").length,    dot: "bg-blue-400" },
    { key: "completed", label: "Completadas", count: events.filter((e) => e.type === "completed").length, dot: "bg-green-400" },
    { key: "cancelled", label: "Canceladas",  count: events.filter((e) => e.type === "cancelled").length, dot: "bg-red-400" },
    { key: "noshow",    label: "No asistió",  count: events.filter((e) => e.type === "noshow").length,    dot: "bg-white/30" },
  ] as const

  return (
    <div className="w-full max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white">Historial</h1>
          <p className="text-xs text-white/40 mt-0.5">Actividad reciente</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-white/50 hover:text-white"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Summary chips — 2×2 on mobile, 4 cols on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {chips.map(({ key, label, count, dot }) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? "all" : key)}
            className={`rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition border ${
              filter === key
                ? "border-[#e84118]/50 bg-[#e84118]/10"
                : "border-white/8 bg-[#1a1a1a] hover:border-white/20"
            }`}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
            <div className="text-left min-w-0">
              <p className="text-sm font-black text-white leading-none">{count}</p>
              <p className="text-[10px] text-white/40 leading-tight truncate">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-[#e84118]/20 border-t-[#e84118] animate-spin" />
          <p className="text-sm text-white/30">Cargando...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Clock size={28} className="text-white/15 mx-auto mb-2" />
          <p className="text-white/40 text-sm">No hay actividad</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((event) => {
            const cfg = EVENT_CONFIG[event.type]
            const Icon = cfg.icon
            return (
              <div
                key={`${event.id}-${event.type}`}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#1a1a1a] border border-white/8 hover:border-white/15 transition"
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                  <Icon size={14} className={cfg.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: name + time */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white text-sm leading-tight truncate">{event.clientName}</p>
                    <span className="text-[11px] text-white/30 flex-shrink-0 mt-px">{timeAgo(event.eventAt)}</span>
                  </div>
                  {/* Row 2: badge + bookedBy */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[11px] font-medium px-1.5 py-px rounded-md ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {event.bookedBy === "CLIENT" && (
                      <span className="text-[10px] text-white/20">· web</span>
                    )}
                  </div>
                  {/* Row 3: service + date */}
                  <p className="text-[11px] text-white/40 mt-1 truncate">
                    {event.serviceName} · {formatApptDate(event.appointmentDate)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
