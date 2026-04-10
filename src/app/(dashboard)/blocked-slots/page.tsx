"use client"

import { useEffect, useState } from "react"
import { to12Hour } from "@/lib/utils"
import { Loader } from "@/components/ui/loader"
import { RepeatIcon, CalendarX, Trash2 } from "lucide-react"

type BlockedSlot = {
  id: string
  date: string
  startTime: string
  endTime: string
  reason: string | null
  allDay: boolean
  createdAt: string
}

type RecurringBlock = {
  id: string
  startTime: string
  endTime: string
  reason: string | null
  allDay: boolean
}

const QUICK_PRESETS = [
  { label: "Almuerzo", emoji: "🍽", startTime: "11:58", endTime: "13:00", reason: "Almuerzo" },
  { label: "Día libre", emoji: "🏖", startTime: "00:00", endTime: "23:59", reason: "Día libre", allDay: true },
]

export default function BlockedSlotsPage() {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [recurringBlocks, setRecurringBlocks] = useState<RecurringBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showRecurringForm, setShowRecurringForm] = useState(false)
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split("T")[0])
  const [quickLoading, setQuickLoading] = useState<string | null>(null)
  const [recurringForm, setRecurringForm] = useState({ startTime: "11:58", endTime: "13:00", reason: "" })
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    reason: "",
    allDay: false,
  })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [slotsRes, recurringRes] = await Promise.all([
      fetch("/api/blocked-slots"),
      fetch("/api/recurring-blocks"),
    ])
    const [slots, recurring] = await Promise.all([slotsRes.json(), recurringRes.json()])
    setBlockedSlots(slots)
    setRecurringBlocks(recurring)
    setLoading(false)
  }

  const createBlock = async () => {
    if (!form.date) return
    if (!form.allDay && (!form.startTime || !form.endTime)) return
    if (!form.allDay && form.startTime >= form.endTime) {
      alert("La hora de inicio debe ser antes de la hora de fin")
      return
    }
    await fetch("/api/blocked-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setForm({ date: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "10:00", reason: "", allDay: false })
    setShowForm(false)
    fetchAll()
  }

  const deleteBlock = async (id: string) => {
    await fetch(`/api/blocked-slots?id=${id}`, { method: "DELETE" })
    fetchAll()
  }

  const quickBlock = async (preset: typeof QUICK_PRESETS[number]) => {
    if (!quickDate) return
    setQuickLoading(preset.label)
    await fetch("/api/blocked-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: quickDate,
        startTime: preset.startTime,
        endTime: preset.endTime,
        reason: preset.reason,
        allDay: preset.allDay ?? false,
      }),
    })
    setQuickLoading(null)
    fetchAll()
  }

  const createRecurring = async (preset?: { startTime: string; endTime: string; reason: string }) => {
    const data = preset ?? { ...recurringForm, allDay: false }
    await fetch("/api/recurring-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setRecurringForm({ startTime: "11:58", endTime: "13:00", reason: "" })
    setShowRecurringForm(false)
    fetchAll()
  }

  const deleteRecurring = async (id: string) => {
    await fetch(`/api/recurring-blocks?id=${id}`, { method: "DELETE" })
    fetchAll()
  }

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number)
    return new Date(y, m - 1, d).toLocaleDateString("es-CO", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bloqueo de Horarios</h1>
          <p className="text-sm text-white/40 mt-1">
            Bloquea días u horas para que no estén disponibles en el booking
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#00bcd4] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#c0392b] transition text-sm"
        >
          + Nuevo Bloqueo
        </button>
      </div>

      {/* ── Bloqueos fijos (recurrentes) ── */}
      <div className="bg-[#0a1520] rounded-xl border border-[#0e2530] mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#0e2530]">
          <div className="flex items-center gap-2">
            <RepeatIcon size={16} className="text-[#00bcd4]" />
            <p className="text-sm font-bold text-white">Bloqueos fijos</p>
            <span className="text-xs text-white/30 ml-1">· aplican todos los días</span>
          </div>
          <button
            onClick={() => setShowRecurringForm(!showRecurringForm)}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#00bcd4]/15 text-[#00bcd4] hover:bg-[#00bcd4]/25 transition font-medium"
          >
            + Agregar
          </button>
        </div>

        {/* Recurring quick add */}
        {showRecurringForm && (
          <div className="px-5 py-4 border-b border-[#0e2530] bg-[#080f16]">
            <p className="text-xs text-white/40 mb-3">Agrega un bloqueo que se repita cada día automáticamente</p>
            {/* Almuerzo shortcut */}
            <button
              onClick={() => createRecurring({ startTime: "11:58", endTime: "13:00", reason: "Almuerzo" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a1520] border border-[#00bcd4]/30 hover:bg-[#00bcd4]/10 transition text-sm text-white mb-3 w-full"
            >
              <span>🍽</span>
              <span className="font-medium">Almuerzo fijo</span>
              <span className="text-white/40 ml-1">11:58 AM – 1:00 PM, todos los días</span>
            </button>
            <p className="text-xs text-white/25 mb-2">O personaliza el horario:</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Hora inicio</label>
                <input
                  type="time"
                  value={recurringForm.startTime}
                  onChange={(e) => setRecurringForm({ ...recurringForm, startTime: e.target.value })}
                  className="p-2.5 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#0a1520] text-white text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Hora fin</label>
                <input
                  type="time"
                  value={recurringForm.endTime}
                  onChange={(e) => setRecurringForm({ ...recurringForm, endTime: e.target.value })}
                  className="p-2.5 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#0a1520] text-white text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs text-white/50 mb-1 block">Razón (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Almuerzo"
                  value={recurringForm.reason}
                  onChange={(e) => setRecurringForm({ ...recurringForm, reason: e.target.value })}
                  className="w-full p-2.5 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#0a1520] text-white text-sm placeholder-white/30"
                />
              </div>
              <button
                onClick={() => createRecurring()}
                className="px-4 py-2.5 rounded-xl bg-[#00bcd4] text-white text-sm hover:bg-[#c0392b] transition"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Recurring list */}
        {loading ? (
          <div className="p-5"><Loader /></div>
        ) : recurringBlocks.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-white/25">Sin bloqueos fijos. Agrega el horario de almuerzo para que nunca esté disponible.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#0e2530]">
            {recurringBlocks.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#00bcd4]/10 rounded-lg flex items-center justify-center">
                    <RepeatIcon size={14} className="text-[#00bcd4]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {r.allDay ? "Todo el día" : `${to12Hour(r.startTime)} – ${to12Hour(r.endTime)}`}
                      {r.reason && <span className="text-white/40 font-normal"> · {r.reason}</span>}
                    </p>
                    <p className="text-xs text-[#00bcd4]/70">Todos los días</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteRecurring(r.id)}
                  className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-900/20 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick presets (one-time) ── */}
      <div className="bg-[#0a1520] rounded-xl p-5 border border-[#0e2530] mb-6">
        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Bloqueo rápido para una fecha</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label className="text-xs text-white/50 mb-1 block">Fecha</label>
            <input
              type="date"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              className="w-full p-3 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#080f16] text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-5">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => quickBlock(preset)}
                disabled={quickLoading === preset.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#080f16] border border-[#0e2530] hover:border-[#00bcd4]/60 hover:bg-[#00bcd4]/10 transition text-sm text-white/70 hover:text-white disabled:opacity-50"
              >
                <span>{preset.emoji}</span>
                <span>{quickLoading === preset.label ? "Bloqueando..." : preset.label}</span>
                {!preset.allDay && (
                  <span className="text-xs text-white/30">{preset.startTime} – {preset.endTime}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="bg-[#0a1520] rounded-xl p-6 border border-[#0e2530] mb-6">
          <h3 className="font-semibold mb-4 text-white">Bloqueo personalizado</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-3 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#080f16] text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allDay}
                  onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
                  className="w-4 h-4 accent-[#00bcd4]"
                />
                <span className="text-sm text-white">Todo el día</span>
              </label>
            </div>
            {!form.allDay && (
              <>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Hora inicio</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full p-3 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#080f16] text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Hora fin</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full p-3 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#080f16] text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                  />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <label className="text-xs text-white/50 mb-1 block">Razón (opcional)</label>
              <input
                type="text"
                placeholder="Ej: Día libre, almuerzo, cita personal..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full p-3 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#080f16] text-white placeholder-white/40"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-[#0e2530] text-sm hover:bg-[#080f16] transition text-white"
            >
              Cancelar
            </button>
            <button
              onClick={createBlock}
              className="px-4 py-2 rounded-xl bg-[#00bcd4] text-white text-sm hover:bg-[#c0392b] transition"
            >
              Bloquear
            </button>
          </div>
        </div>
      )}

      {/* ── One-time blocks list ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CalendarX size={15} className="text-white/30" />
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Bloqueos por fecha</p>
        </div>
        {loading ? (
          <Loader />
        ) : blockedSlots.length === 0 ? (
          <div className="text-center py-10 bg-[#0a1520] rounded-xl border border-[#0e2530]">
            <p className="text-white/25 text-sm">Sin bloqueos por fecha</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-900/30 rounded-full flex items-center justify-center text-lg">
                    🚫
                  </div>
                  <div>
                    <p className="font-medium text-white">{formatDate(slot.date)}</p>
                    <p className="text-sm text-white/40">
                      {slot.allDay
                        ? "Todo el día"
                        : `${to12Hour(slot.startTime)} – ${to12Hour(slot.endTime)}`}
                      {slot.reason && ` · ${slot.reason}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteBlock(slot.id)}
                  className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-900/20 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
