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
  themeColor: "#e84118",
}

const BASE_URL = "https://frailinstudio.com"

export const metadata: Metadata = {
  title: "Frailin Studio — Barbería en Vista Hermosa, Cartagena",
  description: "Barbería de confianza en Vista Hermosa, Cartagena. Agenda tu cita en segundos, confirmación instantánea por WhatsApp.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Frailin Studio",
  },
  openGraph: {
    title: "Frailin Studio — Tu look habla antes que tú.",
    description: "Barbería en Vista Hermosa, Cartagena. Agenda tu cita en segundos, sin llamadas, sin esperas.",
    url: BASE_URL,
    siteName: "Frailin Studio",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/logo2.png`,
        width: 512,
        height: 512,
        alt: "Frailin Studio — Barbería en Vista Hermosa, Cartagena",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Frailin Studio — Tu look habla antes que tú.",
    description: "Barbería en Vista Hermosa, Cartagena. Agenda tu cita en segundos.",
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
