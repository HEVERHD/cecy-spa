import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/shared/providers"
import { PWARegister } from "@/components/shared/pwa-register"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00bcd4",
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cecy-spa.vercel.app"

export const metadata: Metadata = {
  title: "Cecy D'Estética & Spa — Agenda tu cita online",
  description: "Agenda tu cita en segundos, confirmación instantánea por WhatsApp. Sin llamadas, sin esperas.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/logo.png", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cecy D'Estética & Spa",
  },
  openGraph: {
    title: "Cecy D'Estética & Spa — Tu belleza, nuestra pasión.",
    description: "Agenda tu cita en segundos, sin llamadas, sin esperas.",
    url: BASE_URL,
    siteName: "Cecy D'Estética & Spa",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/logo2.png`,
        width: 512,
        height: 512,
        alt: "Cecy D'Estética & Spa — Agenda tu cita online",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Cecy D'Estética & Spa — Tu belleza, nuestra pasión.",
    description: "Agenda tu cita en segundos, sin llamadas, sin esperas.",
    images: [`${BASE_URL}/logo2.png`],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  )
}
