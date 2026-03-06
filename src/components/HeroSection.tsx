"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import LiveQueueBadge from "@/components/LiveQueueBadge"

const FULL_TEXT = "que tú."

export default function HeroSection() {
  const [displayed, setDisplayed] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [started, setStarted] = useState(false)

  // Start typewriter after entrance animations finish (~1.8s)
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 1800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!started) return

    // Pause before deleting
    if (!isDeleting && displayed === FULL_TEXT) {
      const t = setTimeout(() => setIsDeleting(true), 2400)
      return () => clearTimeout(t)
    }
    // Pause before retyping
    if (isDeleting && displayed === "") {
      const t = setTimeout(() => setIsDeleting(false), 550)
      return () => clearTimeout(t)
    }

    const speed = isDeleting ? 65 : 105
    const t = setTimeout(() => {
      setDisplayed(
        isDeleting
          ? displayed.slice(0, -1)
          : FULL_TEXT.slice(0, displayed.length + 1)
      )
    }, speed)
    return () => clearTimeout(t)
  }, [displayed, isDeleting, started])

  return (
    <>
      <style>{`
        @keyframes fs-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(0.4deg); }
          66%       { transform: translateY(-6px) rotate(-0.3deg); }
        }
        @keyframes fs-glow-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.75; transform: scale(1.18); }
        }
        @keyframes fs-scan {
          0%   { transform: translateY(-2px); opacity: 0; }
          4%   { opacity: 1; }
          96%  { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes fs-orb1 {
          0%, 100% { transform: translate(0px, 0px); }
          50%       { transform: translate(-25px, 18px); }
        }
        @keyframes fs-orb2 {
          0%, 100% { transform: translate(0px, 0px); }
          50%       { transform: translate(18px, -22px); }
        }
        @keyframes fs-dot-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes fs-ring-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fs-ring-ccw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes fs-reveal {
          from { opacity: 0; transform: translateY(52px) skewY(2.5deg); filter: blur(10px); }
          to   { opacity: 1; transform: translateY(0) skewY(0deg); filter: blur(0px); }
        }
        @keyframes fs-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fs-slide-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fs-badge-in {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fs-gradient-shift {
          0%, 100% { background-position: 0% center; }
          50%       { background-position: 100% center; }
        }
        @keyframes fs-cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes fs-hud-appear {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fs-line-grow {
          from { width: 0; opacity: 0; }
          to   { width: 100%; opacity: 1; }
        }

        .fs-float    { animation: fs-float 5.5s ease-in-out infinite; }
        .fs-glow     { animation: fs-glow-pulse 3s ease-in-out infinite; }
        .fs-scan     { animation: fs-scan 12s linear infinite; }
        .fs-orb-1    { animation: fs-orb1 15s ease-in-out infinite; }
        .fs-orb-2    { animation: fs-orb2 11s ease-in-out infinite; }
        .fs-dot      { animation: fs-dot-blink 1.6s ease-in-out infinite; }
        .fs-ring-cw  { animation: fs-ring-cw 22s linear infinite; }
        .fs-ring-ccw { animation: fs-ring-ccw 16s linear infinite; }
        .fs-cursor   { animation: fs-cursor-blink 0.9s step-end infinite; }

        .fs-badge   { animation: fs-badge-in 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .fs-t1      { animation: fs-reveal 1s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .fs-t2      { animation: fs-reveal 1s cubic-bezier(0.16,1,0.3,1) 0.45s both; }
        .fs-t3      { animation: fs-reveal 1s cubic-bezier(0.16,1,0.3,1) 0.65s both; }
        .fs-sub     { animation: fs-fade 1s ease 0.95s both; }
        .fs-cta     { animation: fs-slide-up 0.85s cubic-bezier(0.16,1,0.3,1) 1.15s both; }
        .fs-queue   { animation: fs-fade 0.8s ease 1.45s both; }
        .fs-stats   { animation: fs-slide-up 0.8s cubic-bezier(0.16,1,0.3,1) 1.75s both; }
        .fs-logo-in { animation: fs-fade 0.9s ease 0.05s both; }
        .fs-hud     { animation: fs-hud-appear 1s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .fs-divline { animation: fs-line-grow 1s ease 0.75s both; }

        .fs-accent {
          background: linear-gradient(90deg, #e84118 0%, #f05428 35%, #ff7a50 65%, #e84118 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fs-gradient-shift 3.5s ease-in-out infinite;
        }
        .fs-dot-grid {
          background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}</style>

      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">

        {/* ── Background ── */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div className="absolute inset-0 fs-dot-grid pointer-events-none" />
        <div className="fs-orb-1 absolute -top-[15%] -left-[5%]  w-[700px] h-[700px] rounded-full bg-[#e84118]/6 blur-[140px] pointer-events-none" />
        <div className="fs-orb-2 absolute  top-[5%]  right-[-10%] w-[550px] h-[550px] rounded-full bg-[#e84118]/4 blur-[110px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[20%]          w-[350px] h-[350px] rounded-full bg-[#e84118]/3 blur-[90px]  pointer-events-none" />

        {/* Scan line */}
        <div className="fs-scan absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e84118]/25 to-transparent pointer-events-none z-10" />

        {/* Top / bottom fades */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-10" />

        {/* ── Content ── */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 py-10 md:py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-center">

            {/* ─── HUD Logo — top on mobile, right on desktop ─── */}
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <div
                className="fs-logo-in fs-hud relative flex items-center justify-center mx-auto w-[240px] h-[240px] lg:w-[400px] lg:h-[400px]"
              >

                {/* Same HUD scaled via percentage-based insets */}

                {/* Corner brackets */}
                <div className="absolute top-0 left-0   w-7 h-7 lg:w-10 lg:h-10 border-t-2 border-l-2 border-[#e84118]/45" />
                <div className="absolute top-0 right-0  w-7 h-7 lg:w-10 lg:h-10 border-t-2 border-r-2 border-[#e84118]/45" />
                <div className="absolute bottom-0 left-0  w-7 h-7 lg:w-10 lg:h-10 border-b-2 border-l-2 border-[#e84118]/45" />
                <div className="absolute bottom-0 right-0 w-7 h-7 lg:w-10 lg:h-10 border-b-2 border-r-2 border-[#e84118]/45" />

                {/* HUD labels */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] lg:text-[10px] tracking-[0.3em] font-bold text-[#e84118]/35 uppercase whitespace-nowrap">
                  Frailin Studio
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] lg:text-[10px] tracking-[0.25em] font-bold text-white/20 uppercase whitespace-nowrap">
                  Vista Hermosa · CTG
                </div>

                {/* Side tick marks */}
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                  {[5, 3, 10, 3, 5].map((w, i) => (
                    <div key={i} className="h-px bg-[#e84118]/30" style={{ width: w }} />
                  ))}
                </div>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-end">
                  {[5, 3, 10, 3, 5].map((w, i) => (
                    <div key={i} className="h-px bg-[#e84118]/30" style={{ width: w }} />
                  ))}
                </div>

                {/* Spinning rings (% inset so they scale with parent) */}
                <div
                  className="fs-ring-cw absolute rounded-full border border-[#e84118]/12 border-dashed"
                  style={{ inset: "5%" }}
                />
                <div
                  className="fs-ring-ccw absolute rounded-full border border-[#e84118]/18"
                  style={{ inset: "13%" }}
                />

                {/* Radial glow */}
                <div
                  className="fs-glow absolute rounded-full pointer-events-none"
                  style={{
                    inset: "20%",
                    background: "radial-gradient(circle, rgba(232,65,24,0.28) 0%, transparent 70%)",
                  }}
                />

                {/* Logo — floating */}
                <div className="fs-float relative z-10" style={{ width: "46%", height: "46%" }}>
                  <Image
                    src="/logo2.png"
                    alt="Frailin Studio"
                    fill
                    className="object-contain drop-shadow-2xl"
                    style={{ filter: "drop-shadow(0 0 18px rgba(232,65,24,0.4))" }}
                  />
                </div>

                {/* Brand line inside HUD */}
                <div className="absolute bottom-9 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                  <div className="h-px w-16 lg:w-24 mx-auto mb-1.5 bg-gradient-to-r from-transparent via-[#e84118]/40 to-transparent" />
                  <p className="text-[9px] lg:text-[11px] tracking-[0.35em] font-black uppercase">
                    <span className="text-[#e84118]">Frailin</span>
                    <span className="text-white/45"> Studio</span>
                  </p>
                </div>
              </div>

            </div>

            {/* ─── Text — bottom on mobile, left on desktop ─── */}
            <div className="order-2 lg:order-1">

              {/* Location badge */}
              <div className="fs-badge inline-flex items-center gap-2.5 border border-[#e84118]/25 bg-[#e84118]/8 text-[#e84118] text-[11px] font-bold px-4 py-2 rounded-full mb-6 lg:mb-8 tracking-[0.2em] uppercase">
                <span className="fs-dot inline-block w-1.5 h-1.5 rounded-full bg-[#e84118]" />
                Vista Hermosa &nbsp;·&nbsp; Cartagena
              </div>

              {/* Headline — staggered lines */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-black leading-[0.88] tracking-tight mb-6 lg:mb-8">
                <span className="fs-t1 block">Tu look</span>
                <span className="fs-t2 block">habla antes</span>
                {/* Typewriter line */}
                <span className="fs-t3 block min-h-[1em]">
                  <span className="fs-accent">{displayed}</span>
                  <span className="fs-cursor inline-block w-[3px] h-[0.7em] bg-[#e84118] align-middle rounded-sm ml-0.5" />
                </span>
              </h1>

              {/* Thin red divider */}
              <div className="fs-divline h-px bg-gradient-to-r from-[#e84118]/50 via-[#e84118]/20 to-transparent mb-6 lg:mb-8" />

              {/* Subtext */}
              <p className="fs-sub text-base md:text-lg text-white/35 mb-8 lg:mb-10 max-w-sm leading-relaxed font-light">
                Barbería de confianza en Vista Hermosa. Agenda tu cita en segundos, sin llamadas, sin esperas.
              </p>

              {/* CTAs */}
              <div className="fs-cta flex flex-col sm:flex-row gap-3 mb-10 lg:mb-12">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e84118] to-[#c0392b] text-white font-bold px-8 py-4 rounded-2xl text-base hover:shadow-2xl hover:shadow-[#e84118]/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Agendar mi cita
                  <ArrowUpRight size={18} />
                </Link>
                <a
                  href="#servicios"
                  className="inline-flex items-center justify-center gap-2 border border-white/10 text-white/50 font-medium px-8 py-4 rounded-2xl text-base hover:bg-white/5 hover:text-white hover:border-[#e84118]/30 transition-all"
                >
                  Ver servicios
                </a>
              </div>

              {/* Live queue badge */}
              <div className="fs-queue mb-10 lg:mb-12">
                <LiveQueueBadge />
              </div>

              {/* Stats */}
              <div className="fs-stats flex gap-8 md:gap-14 pt-6 border-t border-white/5">
                {[
                  { value: "5+",  label: "Años de experiencia" },
                  { value: "1K+", label: "Clientes atendidos" },
                  { value: "4.9", label: "Calificación promedio" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-black text-white">{stat.value}</p>
                    <p className="text-[11px] text-white/25 mt-1 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
