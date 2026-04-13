"use client"

import { useEffect, useState } from "react"
import { Bell, BellOff, BellRing } from "lucide-react"

type State = "unsupported" | "denied" | "subscribed" | "unsubscribed" | "loading"

async function getSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null
  const reg = await navigator.serviceWorker.ready
  return reg.pushManager.getSubscription()
}

async function subscribe(): Promise<boolean> {
  const reg = await navigator.serviceWorker.ready
  const permission = await Notification.requestPermission()
  if (permission !== "granted") return false

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  })

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON()),
  })

  return res.ok
}

async function unsubscribe(): Promise<boolean> {
  const sub = await getSubscription()
  if (!sub) return true

  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  })

  return sub.unsubscribe()
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const arr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i)
  return arr.buffer
}

export function PushSubscribeButton() {
  const [state, setState] = useState<State>("loading")

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported")
      return
    }
    if (Notification.permission === "denied") {
      setState("denied")
      return
    }
    getSubscription().then((sub) => setState(sub ? "subscribed" : "unsubscribed"))
  }, [])

  async function toggle() {
    setState("loading")
    try {
      if (state === "subscribed") {
        await unsubscribe()
        setState("unsubscribed")
      } else {
        const ok = await subscribe()
        setState(ok ? "subscribed" : Notification.permission === "denied" ? "denied" : "unsubscribed")
      }
    } catch {
      setState("unsubscribed")
    }
  }

  if (state === "unsupported") return null

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${state === "subscribed" ? "bg-cyan-500/20" : "bg-white/5"}`}>
          {state === "subscribed" ? (
            <BellRing className="w-4 h-4 text-cyan-400" />
          ) : state === "denied" ? (
            <BellOff className="w-4 h-4 text-red-400" />
          ) : (
            <Bell className="w-4 h-4 text-white/40" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Notificaciones push</p>
          <p className="text-xs text-white/40">
            {state === "subscribed" && "Activas — recibirás alertas de nuevas citas"}
            {state === "unsubscribed" && "Desactivadas en este dispositivo"}
            {state === "denied" && "Bloqueadas — actívalas en ajustes del navegador"}
            {state === "loading" && "Verificando..."}
          </p>
        </div>
      </div>

      {state !== "denied" && (
        <button
          onClick={toggle}
          disabled={state === "loading"}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-40 ${
            state === "subscribed"
              ? "bg-white/10 text-white/60 hover:bg-white/15"
              : "bg-cyan-500 text-black hover:bg-cyan-400"
          }`}
        >
          {state === "loading" ? "..." : state === "subscribed" ? "Desactivar" : "Activar"}
        </button>
      )}
    </div>
  )
}
