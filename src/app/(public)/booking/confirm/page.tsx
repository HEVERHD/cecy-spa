"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Scissors, Star, ArrowUpRight } from "lucide-react"

function ConfirmContent() {
  const searchParams = useSearchParams()
  const [animate, setAnimate] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showReview, setShowReview] = useState(false)

  // Review form state
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)

  const service = searchParams.get("service") || ""
  const date = searchParams.get("date") || ""
  const time = searchParams.get("time") || ""
  const duration = searchParams.get("duration") || ""
  const price = searchParams.get("price") || ""
  const name = searchParams.get("name") || ""

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100)
    setTimeout(() => setShowDetails(true), 600)
    setTimeout(() => setShowReview(true), 1000)
  }, [])

  const formatPrice = (p: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(p))

  const formatDate = (d: string) => {
    if (!d) return ""
    return new Intl.DateTimeFormat("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Bogota",
    }).format(new Date(d + "T12:00:00"))
  }

  const addToCalendarUrl = () => {
    if (!date || !time) return "#"
    const start = `${date.replace(/-/g, "")}T${time.replace(":", "")}00`
    const endDate = new Date(`${date}T${time}:00`)
    endDate.setMinutes(endDate.getMinutes() + Number(duration || 30))
    const end = endDate.toISOString().replace(/[-:]/g, "").split(".")[0]
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Cita - ${service}`
    )}&dates=${start}/${end}&details=${encodeURIComponent(
      `Servicio: ${service}\nDuración: ${duration} min`
    )}`
  }

  async function handleReviewSubmit() {
    if (!rating || !comment.trim()) return
    setReviewSubmitting(true)
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: name || "Cliente", rating, comment }),
      })
      setReviewDone(true)
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #050c10 0%, #080f16 50%, #050c10 100%)" }}
    >
      {/* Background glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#00bcd4]/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Success animation */}
        <div
          className={`flex flex-col items-center mb-8 transition-all duration-700 ${
            animate ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="relative w-24 h-24 mb-6">
            <div className={`absolute inset-0 bg-[#00bcd4]/20 rounded-full ${animate ? "animate-ping" : ""}`} />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#00bcd4] to-[#0097a7] rounded-full flex items-center justify-center shadow-lg shadow-[#00bcd4]/30">
              <Scissors size={36} className="text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white text-center">
            {name ? `${name}, ` : ""}¡Cita Agendada!
          </h1>
          <p className="text-white/50 mt-2 text-center text-sm">
            Te enviaremos un recordatorio 1 hora antes de tu cita
          </p>
        </div>

        {/* Booking details card */}
        <div
          className={`rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-700 delay-300 ${
            showDetails ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ background: "#0d1a22" }}
        >
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#00bcd4] to-[#0097a7]" />

          <div className="p-6">
            {/* Service */}
            {service && (
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-[#00bcd4]/15 rounded-xl flex items-center justify-center border border-[#00bcd4]/20">
                  <Scissors size={20} className="text-[#00bcd4]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/40 mb-0.5">Servicio</p>
                  <p className="font-semibold text-white">{service}</p>
                </div>
                {price && (
                  <p className="text-lg font-black text-[#00bcd4]">{formatPrice(price)}</p>
                )}
              </div>
            )}

            <div className="h-px bg-white/8 my-4" />

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {date && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/8">
                  <p className="text-xs text-white/40 mb-1">Fecha</p>
                  <p className="text-sm font-semibold text-white capitalize">{formatDate(date)}</p>
                </div>
              )}
              {time && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/8">
                  <p className="text-xs text-white/40 mb-1">Hora</p>
                  <p className="text-sm font-semibold text-white">{time}</p>
                  {duration && (
                    <p className="text-xs text-white/30 mt-0.5">{duration} min</p>
                  )}
                </div>
              )}
            </div>

            {/* Reminder channels notice */}
            <div className="bg-[#00bcd4]/8 border border-[#00bcd4]/20 rounded-xl p-4 mb-5">
              <p className="text-sm font-medium text-[#00bcd4] mb-3">Recibirás un recordatorio por</p>
              <div className="flex gap-2">
                {/* SMS */}
                <div className="flex-1 flex flex-col items-center gap-1.5 bg-white/5 rounded-xl py-3 px-2 border border-white/8">
                  <svg className="w-5 h-5 text-[#00bcd4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 15h3" />
                  </svg>
                  <span className="text-xs text-white/60 font-medium">SMS</span>
                </div>
                {/* WhatsApp */}
                <div className="flex-1 flex flex-col items-center gap-1.5 bg-white/5 rounded-xl py-3 px-2 border border-white/8">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#25D366]" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-xs text-white/60 font-medium">WhatsApp</span>
                </div>
                {/* Email */}
                <div className="flex-1 flex flex-col items-center gap-1.5 bg-white/5 rounded-xl py-3 px-2 border border-white/8">
                  <svg className="w-5 h-5 text-[#00bcd4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="text-xs text-white/60 font-medium">Correo</span>
                </div>
              </div>
              <p className="text-xs text-white/30 mt-3 text-center">Según el contacto registrado en tu cuenta</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <a
                href={addToCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agregar al calendario
              </a>

              <Link
                href="/booking"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-black text-sm font-bold hover:shadow-lg hover:shadow-[#00bcd4]/25 transition"
              >
                Agendar otra cita
                <ArrowUpRight size={14} />
              </Link>

              <Link
                href="/"
                className="flex items-center justify-center w-full py-3 text-sm text-white/40 hover:text-white transition"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>

        {/* Review section */}
        <div
          className={`mt-5 rounded-2xl border overflow-hidden transition-all duration-700 delay-700 ${
            showReview ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          } ${reviewDone ? "border-[#00bcd4]/30 bg-[#00bcd4]/5" : "border-white/8 bg-[#111]"}`}
        >
          {reviewDone ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#00bcd4]/15 border border-[#00bcd4]/30 flex items-center justify-center mx-auto mb-3">
                <Star size={20} className="text-[#00bcd4]" fill="currentColor" />
              </div>
              <p className="font-bold text-white mb-1">¡Gracias por tu reseña!</p>
              <p className="text-xs text-white/40">Tu opinión ayuda a mejorar nuestro servicio.</p>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm font-bold text-white mb-1">¿Cómo estuvo tu experiencia?</p>
              <p className="text-xs text-white/35 mb-5">Tu opinión nos ayuda a mejorar</p>

              {/* Stars */}
              <div className="flex gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      size={28}
                      className={`transition-colors ${
                        star <= (hoverRating || rating) ? "text-[#00bcd4]" : "text-white/15"
                      }`}
                      fill={star <= (hoverRating || rating) ? "#00bcd4" : "transparent"}
                    />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos cómo fue tu corte..."
                rows={3}
                className="w-full p-3.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white placeholder-white/25 focus:border-[#00bcd4]/50 focus:outline-none transition text-sm resize-none mb-4"
              />

              <button
                onClick={handleReviewSubmit}
                disabled={!rating || !comment.trim() || reviewSubmitting}
                className="w-full py-3 rounded-xl bg-[#00bcd4] text-black font-bold text-sm hover:bg-[#26c6da] transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {reviewSubmitting ? "Enviando..." : "Enviar reseña"}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          <Scissors size={10} className="inline mr-1" />
          Tu estilo, tu tiempo.
        </p>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050c10]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00bcd4] animate-spin" />
            </div>
            <span className="text-white/40 text-sm">Cargando...</span>
          </div>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  )
}
