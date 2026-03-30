import type { Metadata } from "next"
import { Architects_Daughter, Courier_Prime } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const fontSans = Architects_Daughter({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
})

const fontMono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

const siteDescription =
  "Shoptik is a high-performance distributed e-commerce platform powered by gRPC, BullMQ, WebSockets, NestJS, and Go microservices."

export const metadata: Metadata = {
  title: {
    default: "Shoptik - Distributed Commerce Platform",
    template: "%s | Shoptik",
  },
  description: siteDescription,
  keywords: [
    "e-commerce",
    "distributed systems",
    "gRPC",
    "BullMQ",
    "NestJS",
    "Next.js",
    "microservices",
    "real-time",
  ],
  authors: [{ name: "Shoptik Team" }],
  openGraph: {
    title: "Shoptik - Distributed Commerce Platform",
    description: siteDescription,
    type: "website",
    url: "https://shoptik.dev",
    siteName: "Shoptik",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shoptik - Distributed Commerce Platform",
    description: siteDescription,
  },
  metadataBase: new URL("https://shoptik.dev"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(fontSans.variable, fontMono.variable)}
    >
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
