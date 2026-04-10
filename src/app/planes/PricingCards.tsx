"use client"

import { useState } from "react"
import { Check, MessageCircle, X } from "lucide-react"

const plans = [
  {
    id: "solo",
    name: "Solo",
    tagline: "Para el profesional independiente",
    priceCOP: 49_000,
    priceUSD: 12,
    period: "mes",
    highlight: false,
    badge: null,
    features: [
      { text: "1 profesional", highlight: false },
      { text: "Citas ilimitadas", highlight: false },
      { text: "Página de reservas online", highlight: false },
      { text: "WhatsApp automático incluido", highlight: true },
      { text: "Confirmación por email", highlight: false },
      { text: "Recordatorio 1h antes", highlight: false },
      { text: "Gestión de servicios y precios", highlight: false },
      { text: "Soporte por WhatsApp", highlight: false },
    ],
    notIncluded: ["Múltiples profesionales", "Galería de portafolio", "Sistema de reseñas", "Estadísticas"],
    cta: "Empezar gratis 14 días",
    whatsappMsg: "Hola! Me interesa el plan Solo de BarberOS. ¿Me puedes dar más información?",
  },
  {
    id: "equipo",
    name: "Equipo",
    tagline: "El favorito de los negocios",
    priceCOP: 119_000,
    priceUSD: 29,
    period: "mes",
    highlight: true,
    badge: "★ Recomendado",
    features: [
      { text: "Hasta 5 profesionales", highlight: false },
      { text: "Citas ilimitadas", highlight: false },
      { text: "Página de reservas online", highlight: false },
      { text: "WhatsApp automático incluido", highlight: true },
      { text: "Confirmación por email", highlight: false },
      { text: "Recordatorios automáticos (1h antes)", highlight: false },
      { text: "Gestión de servicios y precios", highlight: false },
      { text: "Panel completo de administración", highlight: false },
      { text: "Galería / portafolio", highlight: false },
      { text: "Sistema de reseñas", highlight: false },
      { text: "Lista de espera automática", highlight: false },
      { text: "Estadísticas y reportes", highlight: false },
      { text: "Soporte prioritario WhatsApp", highlight: false },
    ],
    notIncluded: ["Profesionales ilimitados", "Dominio personalizado"],
    cta: "Empezar gratis 14 días",
    whatsappMsg: "Hola! Me interesa el plan Equipo de BarberOS. ¿Me puedes dar más información?",
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "Para cadenas y multi-sedes",
    priceCOP: 240_000,
    priceUSD: 59,
    period: "mes",
    highlight: false,
    badge: null,
    features: [
      { text: "Profesionales ilimitados", highlight: false },
      { text: "Citas ilimitadas", highlight: false },
      { text: "Página de reservas online", highlight: false },
      { text: "WhatsApp automático incluido", highlight: true },
      { text: "Confirmación por email", highlight: false },
      { text: "Recordatorios automáticos", highlight: false },
      { text: "Panel completo de administración", highlight: false },
      { text: "Galería / portafolio", highlight: false },
      { text: "Sistema de reseñas", highlight: false },
      { text: "Lista de espera automática", highlight: false },
      { text: "Estadísticas avanzadas", highlight: false },
      { text: "Múltiples sedes", highlight: false },
      { text: "Dominio personalizado", highlight: false },
      { text: "Onboarding personalizado incluido", highlight: false },
      { text: "Soporte WhatsApp directo 7 días", highlight: false },
    ],
    notIncluded: [],
    cta: "Hablar con ventas",
    whatsappMsg: "Hola! Me interesa el plan Studio de BarberOS para mi negocio. ¿Me puedes dar más información?",
  },
]

const WHATSAPP_NUMBER = "573006176641"

export default function PricingCards() {
  const [currency, setCurrency] = useState<"COP" | "USD">("COP")

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-center mb-14">
        <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-1">
          {/* Sliding pill */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-[#00bcd4] to-[#0097a7] transition-all duration-300 ease-in-out"
            style={{ left: currency === "COP" ? "4px" : "calc(50%)" }}
          />
          <button
            onClick={() => setCurrency("COP")}
            className={`relative z-10 px-6 sm:px-8 py-2.5 rounded-full text-sm font-black transition-colors duration-200 ${
              currency === "COP" ? "text-black" : "text-white/40 hover:text-white/70"
            }`}
          >
            COP $
          </button>
          <button
            onClick={() => setCurrency("USD")}
            className={`relative z-10 px-6 sm:px-8 py-2.5 rounded-full text-sm font-black transition-colors duration-200 ${
              currency === "USD" ? "text-black" : "text-white/40 hover:text-white/70"
            }`}
          >
            USD $
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
              plan.highlight
                ? "border border-[#00bcd4]/50 bg-gradient-to-b from-[#0d1a22] to-[#0a1220] shadow-2xl shadow-[#00bcd4]/15 scale-[1.02]"
                : "border border-white/8 bg-[#0b0f1a] hover:border-white/15"
            }`}
          >
            {/* Gold bar top */}
            {plan.highlight && (
              <div className="h-[3px] bg-gradient-to-r from-[#00bcd4] to-[#0097a7]" />
            )}

            {/* Recommended badge */}
            {plan.badge && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px">
                <span className="block bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-black text-[11px] font-black px-5 py-1.5 rounded-b-xl tracking-wide">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className={`p-7 ${plan.highlight ? "pt-10" : ""}`}>
              {/* Plan name */}
              <p className={`text-xs font-black tracking-[0.25em] uppercase mb-1 ${plan.highlight ? "text-[#00bcd4]" : "text-white/40"}`}>
                {plan.name}
              </p>
              <p className="text-white/35 text-sm mb-7 leading-snug">{plan.tagline}</p>

              {/* Price */}
              <div className="mb-8 min-h-[80px] flex flex-col justify-center">
                {currency === "COP" ? (
                  <div>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-white/30 text-lg font-bold self-start mt-2">$</span>
                      <span className={`text-5xl font-black tabular-nums leading-none ${plan.highlight ? "text-[#00bcd4]" : "text-white"}`}>
                        {plan.priceCOP.toLocaleString("es-CO")}
                      </span>
                    </div>
                    <p className="text-white/30 text-sm">COP / {plan.period}</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-white/30 text-lg font-bold self-start mt-2">$</span>
                      <span className={`text-5xl font-black tabular-nums leading-none ${plan.highlight ? "text-[#00bcd4]" : "text-white"}`}>
                        {plan.priceUSD}
                      </span>
                    </div>
                    <p className="text-white/30 text-sm">USD / {plan.period}</p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(plan.whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-black text-sm transition-all mb-8 ${
                  plan.highlight
                    ? "bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-black hover:shadow-lg hover:shadow-[#00bcd4]/30 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-white/6 border border-white/10 text-white hover:bg-white/10 active:scale-[0.98]"
                }`}
              >
                <MessageCircle size={15} />
                {plan.cta}
              </a>

              <div className="h-px bg-white/6 mb-6" />

              {/* Features */}
              <div className="space-y-2.5">
                {plan.features.map((f) => (
                  <div key={f.text} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      f.highlight
                        ? "bg-[#00bcd4]/20 border border-[#00bcd4]/50"
                        : "bg-[#00bcd4]/10 border border-[#00bcd4]/25"
                    }`}>
                      <Check size={11} className="text-[#00bcd4]" strokeWidth={3} />
                    </div>
                    <span className={`text-sm leading-snug ${f.highlight ? "text-[#00bcd4] font-semibold" : "text-white/65"}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-start gap-3 opacity-25">
                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X size={10} className="text-white/50" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-white/40 leading-snug line-through decoration-white/20">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-white/20 mt-8">
        {currency === "COP"
          ? "Precios en pesos colombianos. Facturación mensual. Cancela cuando quieras."
          : "Precios en dólares USD. Facturación mensual. Cancela cuando quieras."}
      </p>
    </div>
  )
}
