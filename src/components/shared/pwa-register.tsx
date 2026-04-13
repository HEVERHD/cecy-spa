"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      // Wait for the SW to be active
      await navigator.serviceWorker.ready

      // If the user previously subscribed, re-sync the subscription with the server
      // (Android Chrome FCM endpoints can change after browser updates)
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return

      // Re-send the subscription to keep it fresh on the server
      const json = sub.toJSON()
      if (!json.endpoint || !json.keys) return

      fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      }).catch(() => {})
    }).catch(() => {})
  }, [])

  return null
}
