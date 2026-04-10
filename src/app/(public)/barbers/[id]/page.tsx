import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Scissors, Star, ArrowUpRight, Calendar } from "lucide-react"

async function getBarber(id: string) {
  return prisma.user.findFirst({
    where: {
      id,
      OR: [{ role: "BARBER" }, { role: "ADMIN" }],
      barberSettings: { isNot: null },
    },
    include: {
      barberSettings: true,
      barberAppointments: {
        where: { status: "COMPLETED" },
        select: { id: true },
      },
    },
  })
}

async function getGallery() {
  return prisma.galleryItem.findMany({
    where: { active: true },
    orderBy: { orderIndex: "asc" },
    take: 6,
  })
}

async function getBarberReviews() {
  return prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  })
}

export default async function BarberProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const [barber, gallery, reviews] = await Promise.all([
    getBarber(params.id),
    getGallery(),
    getBarberReviews(),
  ])

  if (!barber) notFound()

  const totalCuts = barber.barberAppointments.length
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0"

  const initials = (barber.name || "B")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(135deg, #050c10 0%, #080f16 50%, #050c10 100%)" }}
    >
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#00bcd4]/8 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Inicio
          </Link>
          <Link
            href={`/booking?barberId=${barber.id}`}
            className="flex items-center gap-2 bg-[#00bcd4] text-black text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#26c6da] transition"
          >
            Agendar
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 mb-14">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-br from-[#00bcd4] to-[#0097a7] rounded-full blur-md opacity-40" />
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#00bcd4]/40 bg-[#0d1a22]">
              {barber.avatarUrl || barber.image ? (
                <Image
                  src={barber.avatarUrl || barber.image || ""}
                  alt={barber.name || "Barbero"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl font-black text-[#00bcd4]">{initials}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-[#00bcd4] tracking-[0.25em] uppercase mb-2">Barbero profesional</p>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{barber.name}</h1>
            {barber.specialty && (
              <p className="text-white/50 text-base">{barber.specialty}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-14">
          {[
            { value: totalCuts > 0 ? `${totalCuts}+` : "—", label: "Cortes realizados" },
            { value: avgRating, label: "Calificación" },
            { value: `${barber.barberSettings?.slotDuration ?? 30}min`, label: "Por servicio" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#111] border border-white/8 rounded-2xl p-6 text-center hover:border-[#00bcd4]/20 transition"
            >
              <p className="text-3xl font-black text-[#00bcd4] mb-1">{stat.value}</p>
              <p className="text-xs text-white/35 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#1a1400] to-[#0d0b00] border border-[#00bcd4]/30 rounded-2xl p-7 mb-14 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <p className="font-bold text-white text-lg mb-1">Agenda con {barber.name?.split(" ")[0]}</p>
            <p className="text-sm text-white/40">Elige fecha y hora en segundos, sin llamadas.</p>
          </div>
          <Link
            href={`/booking?barberId=${barber.id}`}
            className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-black font-bold px-7 py-3.5 rounded-xl hover:shadow-lg hover:shadow-[#00bcd4]/25 transition-all text-sm"
          >
            <Calendar size={15} />
            Reservar cita
          </Link>
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="mb-14">
            <p className="text-xs font-bold text-[#00bcd4] tracking-[0.25em] uppercase mb-4">Portafolio</p>
            <h2 className="text-2xl font-black mb-8">Trabajos recientes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-[#111] border border-white/5 hover:border-white/15 transition"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title || "Trabajo"}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white font-bold text-sm">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#00bcd4] tracking-[0.25em] uppercase mb-4">Reseñas</p>
            <h2 className="text-2xl font-black mb-8">Lo que dicen los clientes</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[#111] border border-white/8 rounded-2xl p-6 hover:border-[#00bcd4]/15 transition"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={14} className="text-[#00bcd4]" fill="#00bcd4" />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00bcd4]/15 border border-[#00bcd4]/25 flex items-center justify-center">
                      <span className="text-[10px] font-black text-[#00bcd4]">
                        {review.clientName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">{review.clientName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-2 bg-[#00bcd4]/10 border border-[#00bcd4]/20 rounded-full px-5 py-2.5 mb-6">
            <Scissors size={14} className="text-[#00bcd4]" />
            <span className="text-xs font-bold text-[#00bcd4] tracking-wide">Tu estilo, tu tiempo</span>
          </div>
          <p className="text-white/30 text-sm">
            <Link href="/" className="hover:text-white transition">Volver al inicio</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
