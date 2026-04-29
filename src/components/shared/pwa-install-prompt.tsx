"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

const STORAGE_KEY = "pwa-install-dismissed-at"
const COOLDOWN_DAYS = 7

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Don't show if dismissed recently
    try {
      const ts = localStorage.getItem(STORAGE_KEY)
      if (ts) {
        const days = (Date.now() - parseInt(ts)) / 86400000
        if (days < COOLDOWN_DAYS) return
      }
    } catch {}

    // Already running as installed PWA — don't show
    if (window.matchMedia("(display-mode: standalone)").matches) return

    // iOS Safari detection
    const ua = navigator.userAgent
    const isIOSDevice = /iphone|ipad|ipod/i.test(ua)
    const isStandalone =
      "standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true

    if (isIOSDevice && !isStandalone) {
      setIsIOS(true)
      const t = setTimeout(() => setShow(true), 4000)
      return () => clearTimeout(t)
    }

    // Android / Chrome — wait for native install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      const t = setTimeout(() => setShow(true), 4000)
      return () => clearTimeout(t)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())) } catch {}
    setShow(false)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "dismissed") {
      try { localStorage.setItem(STORAGE_KEY, String(Date.now())) } catch {}
    }
    setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-[#111] border border-white/12 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/12 transition text-white/50 hover:text-white"
        >
          <X size={14} />
        </button>

        {/* App identity */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-white/10">
            <Image
              src="/logo.png"
              alt="Cecy Spa"
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <p className="font-black text-white text-base leading-tight">
              Cecy D&apos;Estética &amp; Spa
            </p>
            <p className="text-xs text-[#00bcd4] mt-0.5 font-semibold">
              Instala la app gratis
            </p>
          </div>
        </div>

        <p className="text-sm text-white/55 mb-5 leading-relaxed">
          Accede rápido desde tu pantalla de inicio y agenda citas sin abrir el navegador.
        </p>

        {isIOS ? (
          <>
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <span className="text-xl leading-none">⬆️</span>
                <p className="text-sm text-white/70">
                  Toca <strong className="text-white">Compartir</strong> en Safari
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <span className="text-xl leading-none">➕</span>
                <p className="text-sm text-white/70">
                  Elige <strong className="text-white">&quot;En pantalla de inicio&quot;</strong>
                </p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="w-full py-3 rounded-xl bg-[#00bcd4] text-white font-bold text-sm hover:bg-[#0097a7] transition"
            >
              Entendido
            </button>
          </>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={dismiss}
              className="flex-1 py-3 rounded-xl border border-white/12 text-white/50 hover:text-white hover:border-white/20 transition text-sm font-medium"
            >
              Ahora no
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-3 rounded-xl bg-[#00bcd4] text-white font-bold text-sm hover:bg-[#0097a7] transition"
            >
              Instalar app
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
