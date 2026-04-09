import Link from "next/link"
import { Check, Scissors, ArrowUpRight, MessageCircle, Zap, Shield, Star, X } from "lucide-react"

export const metadata = {
  title: "Planes y Precios — BarberOS",
  description: "Digitaliza tu barbería hoy. Citas online, WhatsApp automático incluido, panel de control completo. Desde $49,000 COP/mes.",
}

const plans = [
  {
    id: "solo",
    name: "Solo",
    tagline: "Para el barbero independiente",
    price: 12,
    priceCOP: 49_000,
    period: "mes",
    highlight: false,
    badge: null,
    color: "border-white/10",
    accentText: "text-white/70",
    features: [
      "1 barbero",
      "Citas ilimitadas",
      "Página de reservas online",
      "✅ WhatsApp automático incluido",
      "Confirmación por email",
      "Recordatorio 1h antes",
      "Gestión de servicios y precios",
      "Panel de citas",
      "Soporte por WhatsApp",
    ],
    notIncluded: [
      "Múltiples barberos",
      "Galería de portafolio",
      "Sistema de reseñas",
      "Estadísticas avanzadas",
    ],
    cta: "Empezar gratis 14 días",
    whatsappMsg: "Hola! Me interesa el plan Solo de BarberOS para mi barbería. ¿Me puedes dar más información?",
  },
  {
    id: "equipo",
    name: "Equipo",
    tagline: "El favorito de las barberías",
    price: 29,
    priceCOP: 119_000,
    period: "mes",
    highlight: true,
    badge: "Más popular",
    color: "border-[#c9a227]/40",
    accentText: "text-[#c9a227]",
    features: [
      "Hasta 5 barberos",
      "Citas ilimitadas",
      "Página de reservas online",
      "✅ WhatsApp automático incluido",
      "Confirmación por email",
      "Recordatorios automáticos (1h antes)",
      "Gestión de servicios y precios",
      "Panel completo de administración",
      "Galería de trabajos (portafolio)",
      "Sistema de reseñas de clientes",
      "Lista de espera automática",
      "Estadísticas y reportes",
      "Soporte prioritario WhatsApp",
    ],
    notIncluded: [
      "Barberos ilimitados",
      "Dominio personalizado",
    ],
    cta: "Empezar gratis 14 días",
    whatsappMsg: "Hola! Me interesa el plan Equipo de BarberOS para mi barbería. ¿Me puedes dar más información?",
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "Para cadenas y multi-sedes",
    price: 59,
    priceCOP: 240_000,
    period: "mes",
    highlight: false,
    badge: null,
    color: "border-white/10",
    accentText: "text-white/70",
    features: [
      "Barberos ilimitados",
      "Citas ilimitadas",
      "Página de reservas online",
      "✅ WhatsApp automático incluido",
      "Confirmación por email",
      "Recordatorios automáticos",
      "Gestión de servicios y precios",
      "Panel completo de administración",
      "Galería de trabajos (portafolio)",
      "Sistema de reseñas de clientes",
      "Lista de espera automática",
      "Estadísticas y reportes avanzados",
      "Múltiples sedes",
      "Dominio personalizado",
      "Onboarding personalizado incluido",
      "Soporte WhatsApp directo 7 días",
    ],
    notIncluded: [],
    cta: "Hablar con ventas",
    whatsappMsg: "Hola! Me interesa el plan Studio de BarberOS para mi negocio. ¿Me puedes dar más información?",
  },
]

const faqs = [
  {
    q: "¿Puedo probar gratis antes de pagar?",
    a: "Sí. Todos los planes incluyen 14 días de prueba gratuita, sin tarjeta de crédito. Configura tu barbería y prueba todas las funciones desde el día 1.",
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
    a: "Tienes 30 días para exportar tu información (clientes, citas, reseñas) después de cancelar. Nunca borramos tu data sin aviso previo.",
  },
  {
    q: "¿Necesito saber de tecnología para configurarlo?",
    a: "No. La configuración toma menos de 10 minutos. Te acompañamos paso a paso por WhatsApp hasta que tu barbería esté lista.",
  },
]

const WHATSAPP_NUMBER = "573006176641"

export default function PlanesPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(135deg, #060c17 0%, #0a0f1e 50%, #060c17 100%)" }}
    >
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#c9a227]/6 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Inicio
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#c9a227]/15 border border-[#c9a227]/30 flex items-center justify-center">
              <Scissors size={13} className="text-[#c9a227]" />
            </div>
            <span className="font-black text-sm text-white">BarberOS</span>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola! Me interesa conocer más sobre BarberOS para mi negocio.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#c9a227] text-black text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#d4ae3f] transition"
          >
            Hablar con ventas
            <ArrowUpRight size={13} />
          </a>
        </div>
      </nav>

      <div className="relative z-10">

        {/* ── Hero ── */}
        <section className="text-center pt-24 pb-16 px-6">
          <div className="inline-flex items-center gap-2 bg-[#c9a227]/10 border border-[#c9a227]/25 rounded-full px-4 py-2 mb-8">
            <Zap size={13} className="text-[#c9a227]" />
            <span className="text-xs font-bold text-[#c9a227] tracking-wide">Todo incluido · Sin cobros ocultos</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Digitaliza tu<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] to-[#d4ae3f]">
              barbería hoy
            </span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
            Citas online, WhatsApp automático incluido en todos los planes,
            confirmación por email y panel completo. Desde <strong className="text-white/70">$49,000 COP/mes</strong>.
          </p>
        </section>

        {/* ── Trust badges ── */}
        <div className="max-w-4xl mx-auto px-6 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: MessageCircle, label: "WhatsApp incluido en todos los planes" },
              { icon: Zap, label: "Configuración en 10 minutos" },
              { icon: Shield, label: "14 días gratis sin tarjeta" },
              { icon: Star, label: "Sin comisiones por cita" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/3 border border-white/6 rounded-xl px-4 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#c9a227]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-[#c9a227]" />
                </div>
                <p className="text-xs font-semibold text-white/60 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pricing cards ── */}
        <section className="max-w-6xl mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border ${plan.color} ${
                  plan.highlight
                    ? "bg-gradient-to-b from-[#0f1a2e] to-[#0a1220] shadow-2xl shadow-[#c9a227]/10"
                    : "bg-[#0b0f1a]"
                } overflow-hidden`}
              >
                {plan.highlight && (
                  <div className="h-[3px] bg-gradient-to-r from-[#c9a227] to-[#a88520]" />
                )}

                {plan.badge && (
                  <div className="absolute top-5 right-5">
                    <span className="bg-[#c9a227] text-black text-[10px] font-black px-3 py-1 rounded-full tracking-wide uppercase">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-7">
                  <p className={`text-xs font-bold tracking-[0.2em] uppercase mb-2 ${plan.accentText}`}>
                    {plan.name}
                  </p>
                  <p className="text-white/40 text-sm mb-6">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-end gap-1.5 mb-1.5">
                      <span className="text-white/30 text-xl font-bold self-start mt-2">$</span>
                      <span className={`text-5xl font-black ${plan.highlight ? "text-[#c9a227]" : "text-white"}`}>
                        {plan.price}
                      </span>
                      <span className="text-white/30 text-sm mb-1.5">USD/{plan.period}</span>
                    </div>
                    <p className="text-white/35 text-sm font-semibold">
                      ${plan.priceCOP.toLocaleString("es-CO")} COP/{plan.period}
                    </p>
                  </div>

                  {/* CTA */}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(plan.whatsappMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all mb-8 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-[#c9a227] to-[#a88520] text-black hover:shadow-lg hover:shadow-[#c9a227]/25 hover:scale-[1.02]"
                        : "bg-white/6 border border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <MessageCircle size={15} />
                    {plan.cta}
                  </a>

                  <div className="h-px bg-white/6 mb-6" />

                  <div className="space-y-3">
                    {plan.features.map((f) => {
                      const isHighlight = f.startsWith("✅ ")
                      const label = f.replace("✅ ", "")
                      return (
                        <div key={f} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isHighlight
                              ? "bg-[#c9a227]/25 border border-[#c9a227]/50"
                              : "bg-[#c9a227]/15 border border-[#c9a227]/30"
                          }`}>
                            <Check size={11} className="text-[#c9a227]" strokeWidth={3} />
                          </div>
                          <span className={`text-sm leading-snug ${isHighlight ? "text-[#c9a227] font-semibold" : "text-white/70"}`}>
                            {label}
                          </span>
                        </div>
                      )
                    })}
                    {plan.notIncluded.map((f) => (
                      <div key={f} className="flex items-start gap-3 opacity-30">
                        <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] text-white/40 font-bold leading-none">—</span>
                        </div>
                        <span className="text-sm text-white/40 leading-snug line-through decoration-white/20">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-white/25 mt-8">
            Precios en USD · COP referencial (TRM ~$4,100). Facturación mensual. Cancela cuando quieras.
          </p>
        </section>

        {/* ── Comparison table ── */}
        <section className="border-t border-white/5 py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <p className="text-xs font-bold text-[#c9a227] tracking-[0.25em] uppercase mb-4">¿Por qué BarberOS?</p>
              <h2 className="text-4xl font-black mb-4">La diferencia es clara</h2>
              <p className="text-white/40 text-sm max-w-md mx-auto">
                Otras plataformas cobran add-ons por funciones esenciales. Nosotros las incluimos todas desde el plan más básico.
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-[#0b0f1a] border-b border-white/8">
                <div className="p-5 col-span-1">
                  <p className="text-xs font-bold text-white/30 uppercase tracking-wider">Función</p>
                </div>
                <div className="p-5 text-center border-l border-white/8">
                  <div className="inline-flex items-center gap-1.5 bg-[#c9a227]/10 border border-[#c9a227]/25 rounded-lg px-3 py-1.5">
                    <Scissors size={12} className="text-[#c9a227]" />
                    <span className="text-xs font-black text-[#c9a227]">BarberOS</span>
                  </div>
                </div>
                <div className="p-5 text-center border-l border-white/8">
                  <p className="text-xs font-bold text-white/30 uppercase tracking-wider">Competencia</p>
                </div>
              </div>

              {[
                { feature: "Citas online ilimitadas", us: true, them: true },
                { feature: "WhatsApp automático", us: "Incluido ✓", them: "Add-on de pago" },
                { feature: "Confirmación por email", us: true, them: true },
                { feature: "Recordatorio 1h antes", us: true, them: "Solo por email" },
                { feature: "Panel de administración", us: true, them: true },
                { feature: "Galería de portafolio", us: true, them: false },
                { feature: "Sistema de reseñas", us: true, them: false },
                { feature: "Lista de espera", us: true, them: false },
                { feature: "Soporte por WhatsApp", us: true, them: "Solo email" },
                { feature: "Precio plan base", us: "$49,000 COP/mes", them: "~$80,000+ COP/mes" },
              ].map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 border-b border-white/5 last:border-0 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                >
                  <div className="p-4 flex items-center">
                    <span className="text-sm text-white/60">{row.feature}</span>
                  </div>
                  <div className="p-4 border-l border-white/5 flex items-center justify-center">
                    {row.us === true ? (
                      <div className="w-6 h-6 rounded-full bg-[#c9a227]/15 border border-[#c9a227]/30 flex items-center justify-center">
                        <Check size={12} className="text-[#c9a227]" strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-[#c9a227]">{row.us}</span>
                    )}
                  </div>
                  <div className="p-4 border-l border-white/5 flex items-center justify-center">
                    {row.them === true ? (
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Check size={12} className="text-white/40" strokeWidth={3} />
                      </div>
                    ) : row.them === false ? (
                      <div className="w-6 h-6 rounded-full bg-red-900/20 border border-red-500/20 flex items-center justify-center">
                        <X size={11} className="text-red-400/60" strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-xs text-white/35 text-center">{row.them}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola! Quiero empezar mi prueba gratis de BarberOS.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c9a227] to-[#a88520] text-black font-black px-8 py-4 rounded-xl text-sm hover:shadow-xl hover:shadow-[#c9a227]/25 transition-all hover:scale-[1.02]"
              >
                <MessageCircle size={16} />
                Empezar gratis — 14 días sin tarjeta
              </a>
            </div>
          </div>
        </section>

        {/* ── What's included ── */}
        <section className="border-t border-white/5 py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-14 text-center">
              <p className="text-xs font-bold text-[#c9a227] tracking-[0.25em] uppercase mb-4">La plataforma completa</p>
              <h2 className="text-4xl md:text-5xl font-black">Todo lo que necesita tu barbería</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: "📱", title: "Citas online 24/7", desc: "Tus clientes agendan desde el celular en menos de 1 minuto, sin llamadas, sin mensajes manuales." },
                { icon: "💬", title: "WhatsApp automático incluido", desc: "Confirmaciones y recordatorios por WhatsApp incluidos desde el plan más básico. Sin costos extra." },
                { icon: "📧", title: "Email de confirmación", desc: "Email profesional con todos los detalles de la cita al instante de agendar." },
                { icon: "⭐", title: "Sistema de reseñas", desc: "Al terminar la cita, tus clientes dejan reseñas que aparecen en tu página pública." },
                { icon: "🖼️", title: "Galería de trabajos", desc: "Sube fotos de tus mejores cortes. Tu portafolio visible para todos los clientes potenciales." },
                { icon: "📊", title: "Panel de administración", desc: "Gestiona citas, clientes, servicios y horarios desde un solo lugar, sin complicaciones." },
                { icon: "🕐", title: "Horarios personalizados", desc: "Define tu horario de atención, bloquea festivos o vacaciones con un clic." },
                { icon: "👥", title: "Múltiples barberos", desc: "Cada barbero tiene su propio calendario y página de perfil pública." },
                { icon: "🚀", title: "Lista de espera", desc: "Si un horario está lleno, los clientes entran automáticamente a lista de espera." },
              ].map((item) => (
                <div key={item.title} className="bg-[#0b0f1a] border border-white/6 rounded-2xl p-6 hover:border-[#c9a227]/15 transition-all duration-300">
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
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
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-[#0b0f1a] border border-white/6 rounded-2xl p-6 hover:border-[#c9a227]/12 transition-all">
                  <p className="font-bold text-white mb-3">{faq.q}</p>
                  <p className="text-sm text-white/45 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative py-32 px-6 overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#060c17] to-[#060c17]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#c9a227]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a227] to-[#a88520] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#c9a227]/20">
              <Scissors size={28} className="text-black" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              ¿Listo para<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] to-[#d4ae3f]">
                modernizar tu barbería?
              </span>
            </h2>
            <p className="text-white/35 text-base mb-10 leading-relaxed">
              14 días gratis, sin tarjeta de crédito. Configuración en menos de 10 minutos.
              Te ayudamos a configurarlo por WhatsApp.
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

        {/* ── Footer ── */}
        <footer className="border-t border-white/8 py-8 px-6 bg-[#080808]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#c9a227]/15 border border-[#c9a227]/30 flex items-center justify-center">
                <Scissors size={13} className="text-[#c9a227]" />
              </div>
              <span className="font-black text-sm text-white">BarberOS</span>
            </div>
            <p className="text-xs text-white/25">La plataforma de citas para barberías modernas.</p>
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
