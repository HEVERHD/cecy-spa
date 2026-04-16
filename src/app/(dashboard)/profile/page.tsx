"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useToast } from "@/components/ui/toast"
import { LogOut } from "lucide-react"

type ProfileStats = {
  totalAppointments: number
  completedToday: number
  monthRevenue: number
  totalClients: number
  avgPerDay: number
  topService: string
  completionRate: string
  quincena: {
    label: string
    earnings: number
    count: number
    prevEarnings: number
    prevCount: number
    prevLabel: string
  }
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const bookingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/booking`
    : ""

  useEffect(() => {
    fetch("/api/profile/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
    fetch("/api/users/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.avatarUrl) setAvatarUrl(data.avatarUrl) })
  }, [])

  const copyLink = async () => {
    await navigator.clipboard.writeText(bookingUrl)
    toast("Link copiado al portapapeles")
  }

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Cecy Spa - Agenda tu cita",
        text: "Agenda tu cita en Cecy Spa",
        url: bookingUrl,
      })
    } else {
      copyLink()
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Mi Perfil</h1>

      {/* Profile card */}
      <div className="bg-[#0a1520] rounded-2xl border border-[#0e2530] overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-r from-[#00bcd4] to-[#f0932b]" />
        <div className="flex flex-col items-center text-center px-6 pb-6">
          <div className="-mt-14 mb-3">
            {(avatarUrl || session?.user?.image) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl || session!.user!.image!}
                alt={session?.user?.name || ""}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full border-[3px] border-[#0a1520] object-cover bg-[#0a1520]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-[3px] border-[#0a1520] bg-[#00bcd4] flex items-center justify-center text-3xl font-bold text-white">
                {(session?.user?.name || "A")[0].toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{session?.user?.name || "Admin"}</h2>
          <p className="text-sm text-white/40 mt-0.5">{session?.user?.email}</p>
          <span className="inline-block mt-2 text-[10px] px-3 py-1 rounded-full bg-[#00bcd4]/20 text-[#00bcd4] font-medium">
            Profesional Admin
          </span>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530] animate-pulse">
              <div className="h-3 w-16 bg-[#0e2530] rounded mb-2" />
              <div className="h-7 w-20 bg-[#0e2530] rounded" />
            </div>
          ))}
        </div>
      ) : stats && (
        <>
          {/* Quincena highlight card */}
          {stats.quincena && (
            <div className="bg-gradient-to-br from-[#00bcd4]/15 to-[#080f16] border border-[#00bcd4]/30 rounded-2xl p-5 mb-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-white/50 mb-0.5">Quincena {stats.quincena.label}</p>
                  <p className="text-3xl font-bold text-[#00bcd4]">{formatCurrency(stats.quincena.earnings)}</p>
                  <p className="text-xs text-white/40 mt-1">{stats.quincena.count} citas completadas</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/30 mb-0.5">{stats.quincena.prevLabel}</p>
                  <p className="text-lg font-semibold text-white/50">{formatCurrency(stats.quincena.prevEarnings)}</p>
                  <p className="text-[10px] text-white/30">{stats.quincena.prevCount} citas</p>
                </div>
              </div>
              <div className="h-px bg-[#00bcd4]/20 my-3" />
              <p className="text-[10px] text-white/30">Tu ganancia = precio × % asignado por servicio</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530]">
              <p className="text-xs text-white/40">Citas totales</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalAppointments}</p>
            </div>
            <div className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530]">
              <p className="text-xs text-white/40">Ganancias del mes</p>
              <p className="text-2xl font-bold text-[#00bcd4] mt-1">{formatCurrency(stats.monthRevenue)}</p>
            </div>
            <div className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530]">
              <p className="text-xs text-white/40">Total clientes</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalClients}</p>
            </div>
            <div className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530]">
              <p className="text-xs text-white/40">Tasa completadas</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.completionRate}%</p>
            </div>
            <div className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530]">
              <p className="text-xs text-white/40">Completadas hoy</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.completedToday}</p>
            </div>
            <div className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530]">
              <p className="text-xs text-white/40">Promedio diario</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.avgPerDay}</p>
            </div>
            <div className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530] col-span-2">
              <p className="text-xs text-white/40">Servicio mas popular</p>
              <p className="text-2xl font-bold text-[#f0932b] mt-1">{stats.topService}</p>
            </div>
          </div>
        </>
      )}

      {/* Invitation link */}
      <div className="bg-[#0a1520] rounded-xl p-6 border border-[#0e2530] mb-6">
        <h3 className="font-semibold text-white mb-2">Link de reservas</h3>
        <p className="text-sm text-white/40 mb-4">
          Comparte este link con tus clientes para que reserven citas
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-[#080f16] border border-[#0e2530] rounded-xl px-4 py-3 text-sm text-white/60 truncate">
            {bookingUrl}
          </div>
          <button
            onClick={copyLink}
            className="px-4 py-3 bg-[#00bcd4] text-white rounded-xl text-sm font-medium hover:bg-[#c0392b] transition flex-shrink-0"
          >
            Copiar
          </button>
        </div>
        <button
          onClick={shareLink}
          className="mt-3 w-full py-3 border border-[#0e2530] rounded-xl text-sm text-white/60 hover:text-white hover:bg-[#080f16] transition flex items-center justify-center gap-2"
        >
          <span suppressHydrationWarning>📤</span>
          Compartir link
        </button>
      </div>

      {/* Quick actions */}
      <div className="bg-[#0a1520] rounded-xl p-6 border border-[#0e2530] mb-6">
        <h3 className="font-semibold text-white mb-4">Accesos rapidos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <a
            href="/appointments"
            className="flex flex-col items-center gap-2 p-4 bg-[#080f16] border border-[#0e2530] rounded-xl hover:border-[#00bcd4]/50 transition"
          >
            <span className="text-2xl" suppressHydrationWarning>📅</span>
            <span className="text-xs text-white/60">Ver citas</span>
          </a>
          {role === "ADMIN" && (
            <a
              href="/clients"
              className="flex flex-col items-center gap-2 p-4 bg-[#080f16] border border-[#0e2530] rounded-xl hover:border-[#00bcd4]/50 transition"
            >
              <span className="text-2xl" suppressHydrationWarning>👥</span>
              <span className="text-xs text-white/60">Clientes</span>
            </a>
          )}
          {role === "ADMIN" && (
            <a
              href="/services"
              className="flex flex-col items-center gap-2 p-4 bg-[#080f16] border border-[#0e2530] rounded-xl hover:border-[#00bcd4]/50 transition"
            >
              <span className="text-2xl" suppressHydrationWarning>✂️</span>
              <span className="text-xs text-white/60">Servicios</span>
            </a>
          )}
          {role === "ADMIN" && (
            <a
              href="/users"
              className="flex flex-col items-center gap-2 p-4 bg-[#080f16] border border-[#0e2530] rounded-xl hover:border-[#00bcd4]/50 transition"
            >
              <span className="text-2xl" suppressHydrationWarning>🔑</span>
              <span className="text-xs text-white/60">Usuarios</span>
            </a>
          )}
          {role === "ADMIN" && (
            <a
              href="/blocked-slots"
              className="flex flex-col items-center gap-2 p-4 bg-[#080f16] border border-[#0e2530] rounded-xl hover:border-[#00bcd4]/50 transition"
            >
              <span className="text-2xl" suppressHydrationWarning>🚫</span>
              <span className="text-xs text-white/60">Bloqueos</span>
            </a>
          )}
          <a
            href="/settings"
            className="flex flex-col items-center gap-2 p-4 bg-[#080f16] border border-[#0e2530] rounded-xl hover:border-[#00bcd4]/50 transition"
          >
            <span className="text-2xl" suppressHydrationWarning>⚙️</span>
            <span className="text-xs text-white/60">Configuracion</span>
          </a>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center justify-center gap-3 py-4 bg-[#0a1520] border border-[#0e2530] rounded-xl text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition font-medium"
      >
        <LogOut size={18} />
        Cerrar Sesión
      </button>
    </div>
  )
}
