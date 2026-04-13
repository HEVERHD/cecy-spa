"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/toast"

const CATEGORIES = [
  "Cejas y Pestañas",
  "Peluquería",
  "Maquillaje",
  "Estética y Spa",
  "Depilación Damas",
  "Depilación Caballero",
  "Rehabilitación",
  "Manos y Pies",
  "Peinados",
  "General",
]

type Service = {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  category: string
  active: boolean
  commissionRate: number
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState({ name: "", description: "", price: "", duration: "", category: "General", commissionRate: "0.5" })
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    const res = await fetch("/api/services")
    const data = await res.json()
    setServices(data)
    setLoading(false)
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: "", description: "", price: "", duration: "", category: "General", commissionRate: "0.5" })
    setShowForm(true)
  }

  const openEdit = (service: Service) => {
    setEditing(service)
    setForm({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category || "General",
      commissionRate: (service.commissionRate ?? 0.5).toString(),
    })
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.duration) return

    if (editing) {
      await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form, active: editing.active }),
      })
    } else {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    }

    setShowForm(false)
    toast(editing ? "Servicio actualizado" : "Servicio creado")
    setEditing(null)
    fetchServices()
  }

  const toggleActive = async (service: Service) => {
    await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...service, active: !service.active }),
    })
    fetchServices()
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Servicios</h1>
        <button
          onClick={openNew}
          className="bg-[#00bcd4] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#c0392b] transition text-sm"
        >
          + Nuevo Servicio
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[#0a1520] rounded-xl p-6 border border-[#0e2530] mb-6">
          <h3 className="font-semibold mb-4 text-white">
            {editing ? "Editar servicio" : "Nuevo servicio"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre del servicio"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="p-3 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#080f16] text-white placeholder-white/40"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="p-3 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#080f16] text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="p-3 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#080f16] text-white placeholder-white/40"
            />
            <input
              type="number"
              placeholder="Precio"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="p-3 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#080f16] text-white placeholder-white/40"
            />
            <input
              type="number"
              placeholder="Duración (minutos)"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="p-3 border border-[#0e2530] rounded-xl focus:border-[#00bcd4] focus:outline-none bg-[#080f16] text-white placeholder-white/40"
            />
            {/* Commission rate selector */}
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Porcentaje del especialista</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, commissionRate: "0.5" })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition border ${
                    form.commissionRate === "0.5"
                      ? "bg-[#00bcd4] border-[#00bcd4] text-white"
                      : "bg-[#080f16] border-[#0e2530] text-white/50 hover:text-white"
                  }`}
                >
                  50% — Estándar
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, commissionRate: "0.6" })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition border ${
                    form.commissionRate === "0.6"
                      ? "bg-[#f0932b] border-[#f0932b] text-white"
                      : "bg-[#080f16] border-[#0e2530] text-white/50 hover:text-white"
                  }`}
                >
                  60% — Con materiales
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
              className="px-4 py-2 rounded-xl border border-[#0e2530] text-sm hover:bg-[#080f16] transition text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-xl bg-[#00bcd4] text-white text-sm hover:bg-[#c0392b] transition"
            >
              {editing ? "Guardar" : "Crear"}
            </button>
          </div>
        </div>
      )}

      {/* Service list */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#0a1520] rounded-xl p-5 border border-[#0e2530] animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-5 w-28 bg-[#0e2530] rounded" />
                <div className="h-5 w-20 bg-[#0e2530] rounded" />
              </div>
              <div className="h-3 w-full bg-[#0e2530] rounded mb-2" />
              <div className="h-3 w-16 bg-[#0e2530] rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-7 w-16 bg-[#0e2530] rounded-lg" />
                <div className="h-7 w-20 bg-[#0e2530] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const rate = service.commissionRate ?? 0.5
            const commission = service.price * rate
            return (
              <div
                key={service.id}
                className={`bg-[#0a1520] rounded-xl p-5 border border-[#0e2530] transition ${
                  !service.active ? "opacity-50" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">{service.name}</h3>
                  <span className="text-lg font-bold text-[#00bcd4]">
                    {formatPrice(service.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#00bcd4]/10 text-[#00bcd4]">
                    {service.category}
                  </span>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    rate >= 0.6
                      ? "bg-[#f0932b]/15 text-[#f0932b]"
                      : "bg-white/5 text-white/40"
                  }`}>
                    {Math.round(rate * 100)}% · {formatPrice(commission)}
                  </span>
                </div>
                {service.description && (
                  <p className="text-sm text-white/40 mb-2">{service.description}</p>
                )}
                <p className="text-xs text-white/30 mb-4">{service.duration} minutos</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(service)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#0e2530] text-white/50 hover:bg-[#4d2c2c] transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => toggleActive(service)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition ${
                      service.active
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    {service.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
