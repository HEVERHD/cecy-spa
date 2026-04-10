"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/toast"
import { Phone, X, Plus, Clock, MessageCircle, CheckCheck, Trash2 } from "lucide-react"

type WaitlistEntry = {
  id: string
  date: string
  name: string
  phone: string
  status: "WAITING" | "NOTIFIED" | "BOOKED" | "EXPIRED"
  notified: boolean
  createdAt: string
  service: { id: string; name: string }
}

type Service = { id: string; name: string }

const STATUS_CONFIG = {
  WAITING:  { label: "Esperando",  bg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  NOTIFIED: { label: "Notificado", bg: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  BOOKED:   { label: "Agendado",   bg: "bg-green-500/15 text-green-400 border-green-500/30" },
  EXPIRED:  { label: "Expirado",   bg: "bg-white/5 text-white/30 border-white/10" },
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-")
  return new Date(+y, +m - 1, +d).toLocaleDateString("es-CO", {
    weekday: "short", day: "numeric", month: "short",
  })
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // New entry form state
  const [form, setForm] = useState({ date: todayStr(), name: "", phone: "", serviceId: "" })
  const [formError, setFormError] = useState("")
  const [formSubmitting, setFormSubmitting] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchEntries()
    fetch("/api/services").then(r => r.json()).then(setServices)
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    const res = await fetch("/api/waitlist")
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id + status)
    try {
      await fetch("/api/waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      const msgs: Record<string, string> = {
        NOTIFIED: "✅ WhatsApp enviado al cliente",
        BOOKED:   "✅ Marcado como agendado",
        EXPIRED:  "Marcado como expirado",
      }
      toast(msgs[status] || "Estado actualizado")
      fetchEntries()
    } finally {
      setActionLoading(null)
    }
  }

  const deleteEntry = async (id: string) => {
    setActionLoading(id + "delete")
    try {
      await fetch(`/api/waitlist?id=${id}`, { method: "DELETE" })
      toast("Entrada eliminada")
      fetchEntries()
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddEntry = async () => {
    if (!form.date || !form.name || !form.phone || !form.serviceId) {
      setFormError("Todos los campos son obligatorios")
      return
    }
    setFormError("")
    setFormSubmitting(true)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || "Error al agregar")
        return
      }
      toast("✅ Entrada agregada a la lista de espera")
      setForm({ date: todayStr(), name: "", phone: "", serviceId: "" })
      setShowForm(false)
      fetchEntries()
    } finally {
      setFormSubmitting(false)
    }
  }

  const waitingCount = entries.filter(e => e.status === "WAITING").length
  const filtered = filterStatus === "all" ? entries : entries.filter(e => e.status === filterStatus)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Lista de Espera</h1>
          {waitingCount > 0 && (
            <p className="text-sm text-yellow-400 mt-0.5">{waitingCount} persona{waitingCount > 1 ? "s" : ""} esperando</p>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00bcd4] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#c0392b] transition text-sm"
        >
          <Plus size={16} />
          Nueva entrada
        </button>
      </div>

      {/* Add entry form */}
      {showForm && (
        <div className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530] mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm">Agregar a lista de espera</h3>
            <button onClick={() => { setShowForm(false); setFormError("") }} className="text-white/40 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full p-3 border border-[#0e2530] rounded-xl bg-[#080f16] text-white text-sm focus:border-[#00bcd4] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Servicio</label>
              <select
                value={form.serviceId}
                onChange={e => setForm({ ...form, serviceId: e.target.value })}
                className="w-full p-3 border border-[#0e2530] rounded-xl bg-[#080f16] text-white text-sm focus:border-[#00bcd4] focus:outline-none"
              >
                <option value="">Seleccionar...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Nombre</label>
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 border border-[#0e2530] rounded-xl bg-[#080f16] text-white placeholder-white/30 text-sm focus:border-[#00bcd4] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">WhatsApp</label>
              <input
                type="tel"
                placeholder="3001234567"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full p-3 border border-[#0e2530] rounded-xl bg-[#080f16] text-white placeholder-white/30 text-sm focus:border-[#00bcd4] focus:outline-none"
              />
            </div>
          </div>
          {formError && (
            <p className="text-red-400 text-xs mt-2">{formError}</p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { setShowForm(false); setFormError("") }}
              className="px-4 py-2 rounded-xl border border-[#0e2530] text-white/60 text-sm hover:bg-[#080f16] transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddEntry}
              disabled={formSubmitting}
              className="px-4 py-2 rounded-xl bg-[#00bcd4] text-white text-sm font-medium hover:bg-[#c0392b] transition disabled:opacity-50"
            >
              {formSubmitting ? "Agregando..." : "Agregar"}
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {[
          { value: "all", label: "Todos" },
          { value: "WAITING", label: "Esperando" },
          { value: "NOTIFIED", label: "Notificados" },
          { value: "BOOKED", label: "Agendados" },
          { value: "EXPIRED", label: "Expirados" },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterStatus === f.value
                ? "bg-[#00bcd4] text-white"
                : "bg-[#080f16] border border-[#0e2530] text-white/50 hover:text-white"
            }`}
          >
            {f.label}
            {f.value === "WAITING" && waitingCount > 0 && (
              <span className="ml-1.5 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {waitingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#0a1520] rounded-xl p-5 border border-[#0e2530] animate-pulse h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-base">Sin entradas</p>
          <p className="text-sm mt-1">Los clientes aparecerán aquí cuando no encuentren horario disponible</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => {
            const cfg = STATUS_CONFIG[entry.status]
            const isLoading = (s: string) => actionLoading === entry.id + s
            return (
              <div key={entry.id} className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{entry.name}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-white/40 mt-0.5">
                      {entry.service.name} · {formatDate(entry.date)}
                    </p>
                    <a
                      href={`https://wa.me/${entry.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#00bcd4] hover:underline mt-1"
                    >
                      <Phone size={11} />
                      {entry.phone}
                    </a>
                  </div>

                  {/* Delete */}
                  {(entry.status === "EXPIRED" || entry.status === "BOOKED") && (
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      disabled={isLoading("delete")}
                      className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-900/20 transition flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Action buttons */}
                {entry.status === "WAITING" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#0e2530]">
                    <button
                      onClick={() => updateStatus(entry.id, "NOTIFIED")}
                      disabled={isLoading("NOTIFIED")}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition disabled:opacity-50"
                    >
                      <MessageCircle size={12} />
                      {isLoading("NOTIFIED") ? "Enviando..." : "Notificar por WhatsApp"}
                    </button>
                    <button
                      onClick={() => updateStatus(entry.id, "EXPIRED")}
                      disabled={isLoading("EXPIRED")}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 transition disabled:opacity-50"
                    >
                      <X size={12} />
                      Expirar
                    </button>
                  </div>
                )}

                {entry.status === "NOTIFIED" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#0e2530]">
                    <button
                      onClick={() => updateStatus(entry.id, "BOOKED")}
                      disabled={isLoading("BOOKED")}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition disabled:opacity-50"
                    >
                      <CheckCheck size={12} />
                      {isLoading("BOOKED") ? "Guardando..." : "Marcar agendado"}
                    </button>
                    <button
                      onClick={() => updateStatus(entry.id, "NOTIFIED")}
                      disabled={isLoading("NOTIFIED")}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition disabled:opacity-50"
                    >
                      <MessageCircle size={12} />
                      {isLoading("NOTIFIED") ? "Enviando..." : "Reenviar WhatsApp"}
                    </button>
                    <button
                      onClick={() => updateStatus(entry.id, "EXPIRED")}
                      disabled={isLoading("EXPIRED")}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 transition disabled:opacity-50"
                    >
                      <X size={12} />
                      Expirar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
