import Link from "next/link"
import { Check, Scissors, ArrowUpRight, MessageCircle, Zap, X } from "lucide-react"
import PricingCards from "./PricingCards"

export const metadata = {
  title: "Planes y Precios — BarberOS",
  description: "Digitaliza tu negocio hoy. Citas online, WhatsApp automático incluido, panel de control completo. Desde $49,000 COP/mes.",
}

const WHATSAPP_NUMBER = "573006176641"

const businessTypes = [
  {
    emoji: "✂️",
    title: "Barberías",
    tagline: "Cortes que marcan estilo",
    gradient: "from-[#1a0f00] to-[#0f0800]",
    border: "border-[#c9a227]/20",
    accent: "text-[#c9a227]",
  },
  {
    emoji: "🧖‍♀️",
    title: "Spas & Masajes",
    tagline: "Relax y bienestar total",
    gradient: "from-[#001a14] to-[#000f0b]",
    border: "border-emerald-500/20",
    accent: "text-emerald-400",
  },
  {
    emoji: "💇‍♀️",
    title: "Salones de belleza",
    tagline: "Transforma cada look",
    gradient: "from-[#1a001a] to-[#0f000f]",
    border: "border-purple-500/20",
    accent: "text-purple-400",
  },
  {
    emoji: "💆‍♀️",
    title: "Centros de estética",
    tagline: "Tu mejor versión",
    gradient: "from-[#001020] to-[#000a14]",
    border: "border-sky-500/20",
    accent: "text-sky-400",
  },
  {
    emoji: "💅",
    title: "Salones de uñas",
    tagline: "Creatividad en cada detalle",
    gradient: "from-[#1a0010] to-[#0f000a]",
    border: "border-pink-500/20",
    accent: "text-pink-400",
  },
]

const faqs = [
  {
    q: "¿Puedo probar gratis antes de pagar?",
    a: "Sí. Todos los planes incluyen 14 días de prueba gratuita, sin tarjeta de crédito. Configura tu negocio y prueba todas las funciones desde el día 1.",
  },
  {
    q: "¿Mis clientes necesitan descargar una app?",
    a: "No. Tus clientes agendan desde el navegador con solo su nombre, teléfono y email. Sin apps, sin contraseñas, sin fricción.",
  },
  {
    q: "¿El WhatsApp automático tiene costo adicional?",
    a: "No. El WhatsApp automático está incluido en todos los planes desde el más económico. Sin add-ons, sin cobros ocultos.",
  },
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí. Puedes subir o bajar de plan cuando quieras. El cambio aplica desde el siguiente ciclo de facturación.",
  },
  {
    q: "¿Qué pasa con mi información si cancelo?",
    a: "Tienes 30 días para exportar toda tu información (clientes, citas, reseñas). Nunca borramos tu data sin aviso previo.",
  },
  {
    q: "¿Necesito saber de tecnología para configurarlo?",
    a: "No. La configuración toma menos de 10 minutos. Te acompañamos paso a paso por WhatsApp hasta que tu negocio esté listo.",
  },
]

export default function PlanesPage() {
  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #060c17 0%, #0a0f1e 50%, #060c17 100%)" }}
    >
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#c9a227]/5 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-purple-900/8 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Inicio
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c9a227] to-[#a88520] flex items-center justify-center shadow-lg shadow-[#c9a227]/20">
              <Scissors size={15} className="text-black" />
            </div>
            <span className="font-black text-base text-white tracking-tight">BarberOS</span>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola! Me interesa conocer más sobre BarberOS para mi negocio.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-[#c9a227] to-[#a88520] text-black text-sm font-black px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-[#c9a227]/25 transition-all"
          >
            <MessageCircle size={14} />
            Hablar con ventas
          </a>
        </div>
      </nav>

      <div className="relative z-10">

        {/* ── Hero ── */}
        <section className="text-center pt-20 pb-8 px-6">
          <div className="inline-flex items-center gap-2 bg-[#c9a227]/10 border border-[#c9a227]/25 rounded-full px-5 py-2 mb-10">
            <Zap size={13} className="text-[#c9a227]" />
            <span className="text-xs font-bold text-[#c9a227] tracking-wide">WhatsApp automático incluido · Sin cobros ocultos</span>
          </div>

          <h1 className="text-5xl md:text-[5.5rem] font-black leading-[0.92] tracking-tight mb-7">
            La plataforma que<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] via-[#d4ae3f] to-[#c9a227]">
              tu negocio merece
            </span>
          </h1>

          <p className="text-white/40 text-lg max-w-lg mx-auto leading-relaxed mb-12">
            Citas online, recordatorios por WhatsApp y email,
            panel de control y más. Todo desde{" "}
            <span className="text-white/70 font-bold">$49,000 COP/mes</span>.
          </p>

          {/* Stats */}
          <div className="inline-grid grid-cols-3 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8 mb-6">
            {[
              { value: "14 días", label: "Gratis" },
              { value: "10 min", label: "Configuración" },
              { value: "0%", label: "Comisión por cita" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0f1e] px-8 py-5 text-center">
                <p className="text-xl font-black text-[#c9a227]">{s.value}</p>
                <p className="text-xs text-white/30 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tipos de negocio ── */}
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-xs font-bold text-white/25 uppercase tracking-[0.25em] mb-6">
              Diseñado para
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {businessTypes.map((b) => (
                <div
                  key={b.title}
                  className={`bg-gradient-to-br ${b.gradient} border ${b.border} rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:scale-[1.03] transition-transform duration-200 cursor-default`}
                >
                  <span className="text-3xl">{b.emoji}</span>
                  <div>
                    <p className={`text-sm font-black ${b.accent}`}>{b.title}</p>
                    <p className="text-[11px] text-white/30 leading-snug mt-0.5">{b.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="px-6 pb-24 border-t border-white/5 pt-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-4">
              <p className="text-xs font-bold text-[#c9a227] tracking-[0.25em] uppercase mb-4">Planes</p>
              <h2 className="text-4xl md:text-5xl font-black mb-3">Simple y transparente</h2>
              <p className="text-white/35 text-sm max-w-sm mx-auto">Sin letra pequeña. El precio que ves es el que pagas.</p>
            </div>

            <PricingCards />
          </div>
        </section>

        {/* ── Comparison ── */}
        <section className="border-t border-white/5 py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <p className="text-xs font-bold text-[#c9a227] tracking-[0.25em] uppercase mb-4">Comparación</p>
              <h2 className="text-4xl font-black mb-4">La diferencia es clara</h2>
              <p className="text-white/35 text-sm max-w-sm mx-auto">
                Otras plataformas cobran el WhatsApp como add-on. En BarberOS va incluido desde el plan más básico.
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 overflow-hidden">
              <div className="grid grid-cols-3 bg-[#0b0f1a] border-b border-white/8">
                <div className="p-5">
                  <p className="text-xs font-bold text-white/25 uppercase tracking-wider">Función</p>
                </div>
                <div className="p-5 text-center border-l border-white/8">
                  <div className="inline-flex items-center gap-1.5 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-lg px-3 py-1.5">
                    <Scissors size={11} className="text-[#c9a227]" />
                    <span className="text-xs font-black text-[#c9a227]">BarberOS</span>
                  </div>
                </div>
                <div className="p-5 text-center border-l border-white/8">
                  <p className="text-xs font-bold text-white/25 uppercase tracking-wider">Competencia</p>
                </div>
              </div>

              {[
                { feature: "Citas online ilimitadas",      us: true,              them: true },
                { feature: "WhatsApp automático",          us: "Incluido ✓",      them: "Add-on de pago" },
                { feature: "Confirmación por email",       us: true,              them: true },
                { feature: "Recordatorio 1h antes",        us: true,              them: "Solo por email" },
                { feature: "Panel de administración",      us: true,              them: true },
                { feature: "Galería / portafolio",         us: true,              them: false },
                { feature: "Sistema de reseñas",           us: true,              them: false },
                { feature: "Lista de espera",              us: true,              them: false },
                { feature: "Soporte por WhatsApp",         us: true,              them: "Solo email" },
                { feature: "Precio plan base / mes",       us: "$49,000 COP",     them: "~$80,000+ COP" },
              ].map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 border-b border-white/5 last:border-0 ${i % 2 === 0 ? "bg-white/[0.015]" : ""}`}
                >
                  <div className="p-4 flex items-center">
                    <span className="text-sm text-white/55">{row.feature}</span>
                  </div>
                  <div className="p-4 border-l border-white/5 flex items-center justify-center">
                    {row.us === true ? (
                      <div className="w-6 h-6 rounded-full bg-[#c9a227]/15 border border-[#c9a227]/30 flex items-center justify-center">
                        <Check size={12} className="text-[#c9a227]" strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-[#c9a227] text-center">{row.us}</span>
                    )}
                  </div>
                  <div className="p-4 border-l border-white/5 flex items-center justify-center">
                    {row.them === true ? (
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Check size={12} className="text-white/35" strokeWidth={3} />
                      </div>
                    ) : row.them === false ? (
                      <div className="w-6 h-6 rounded-full bg-red-900/20 border border-red-500/15 flex items-center justify-center">
                        <X size={11} className="text-red-400/50" strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-xs text-white/30 text-center leading-tight">{row.them}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola! Quiero empezar mi prueba gratis de BarberOS.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c9a227] to-[#a88520] text-black font-black px-8 py-4 rounded-2xl text-sm hover:shadow-xl hover:shadow-[#c9a227]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle size={16} />
                Empezar gratis — 14 días sin tarjeta
              </a>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="border-t border-white/5 py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14 text-center">
              <p className="text-xs font-bold text-[#c9a227] tracking-[0.25em] uppercase mb-4">La plataforma completa</p>
              <h2 className="text-4xl md:text-5xl font-black">Todo lo que necesita tu negocio</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: "📱", title: "Citas online 24/7",            desc: "Tus clientes agendan desde el celular en menos de 1 minuto, sin llamadas." },
                { icon: "💬", title: "WhatsApp automático incluido",  desc: "Confirmaciones y recordatorios por WhatsApp incluidos en todos los planes." },
                { icon: "📧", title: "Email de confirmación",         desc: "Email profesional con todos los detalles de la cita al instante de agendar." },
                { icon: "⭐", title: "Sistema de reseñas",            desc: "Tus clientes dejan reseñas que aparecen en tu página pública. Más confianza." },
                { icon: "🖼️", title: "Galería / portafolio",          desc: "Sube fotos de tus mejores trabajos. Tu portafolio visible para todos." },
                { icon: "📊", title: "Panel de administración",       desc: "Gestiona citas, clientes, servicios y horarios desde un solo lugar." },
                { icon: "🕐", title: "Horarios personalizados",       desc: "Define tu horario de atención, bloquea festivos o vacaciones con un clic." },
                { icon: "👥", title: "Múltiples profesionales",       desc: "Cada profesional tiene su propio calendario y página de perfil." },
                { icon: "🚀", title: "Lista de espera automática",    desc: "Cupo lleno = lista de espera automática. Te llena los huecos solos." },
              ].map((item) => (
                <div key={item.title} className="bg-[#0b0f1a] border border-white/6 rounded-2xl p-6 hover:border-[#c9a227]/15 transition-all duration-300 group">
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{item.icon}</div>
                  <h3 className="font-bold text-white mb-2 text-sm">{item.title}</h3>
                  <p className="text-xs text-white/35 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-t border-white/5 py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-14 text-center">
              <p className="text-xs font-bold text-[#c9a227] tracking-[0.25em] uppercase mb-4">FAQ</p>
              <h2 className="text-4xl font-black">Preguntas frecuentes</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-[#0b0f1a] border border-white/6 rounded-2xl p-6 hover:border-[#c9a227]/15 transition-all">
                  <p className="font-bold text-white mb-3 text-sm">{faq.q}</p>
                  <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative py-32 px-6 overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#060c17] to-[#060c17]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#c9a227]/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#c9a227] to-[#a88520] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-[#c9a227]/25 rotate-3">
              <Scissors size={32} className="text-black -rotate-3" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              Empieza hoy,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] to-[#d4ae3f]">
                sin compromisos
              </span>
            </h2>
            <p className="text-white/35 text-base mb-12 leading-relaxed max-w-md mx-auto">
              14 días gratis, sin tarjeta de crédito. Te ayudamos a configurarlo todo por WhatsApp en menos de 10 minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola! Quiero empezar mi prueba gratis de BarberOS. ¿Cómo empezamos?")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#c9a227] to-[#a88520] text-black font-black px-10 py-5 rounded-2xl text-base hover:shadow-2xl hover:shadow-[#c9a227]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle size={20} />
                Empezar gratis — WhatsApp
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-bold px-8 py-5 rounded-2xl text-base hover:bg-white/10 transition-all"
              >
                Ver demo en vivo
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/8 py-8 px-6 bg-[#080808]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#c9a227] to-[#a88520] flex items-center justify-center">
                <Scissors size={13} className="text-black" />
              </div>
              <span className="font-black text-sm text-white">BarberOS</span>
            </div>
            <p className="text-xs text-white/20">La plataforma de citas para negocios de belleza modernos.</p>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xs text-white/30 hover:text-white transition">Demo</Link>
              <Link href="/booking" className="text-xs text-white/30 hover:text-white transition">Reservar</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}
