import "./globals.css"
import type React from "react"
import { Inter, Instrument_Serif } from "next/font/google"
import type { Metadata } from "next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.not-so-simple.com"),
  title: "Not So Simple, LLC",
  description:
    "Software consulting from Jack Wolfe III — architecture and full-stack engineering for teams building systems that have to hold up.",
  icons: {
    icon: [
      { url: "/favicon.ico", rel: "shortcut icon" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: { title: "Not So Simple, LLC" },
  openGraph: {
    title: "Not So Simple, LLC",
    description:
      "Software consulting from Jack Wolfe III — architecture and full-stack engineering for teams building systems that have to hold up.",
    url: "https://www.not-so-simple.com",
    siteName: "Not So Simple, LLC",
    images: [
      { url: "/og-1200x630.png", width: 1200, height: 630, alt: "Not So Simple, LLC" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Not So Simple, LLC",
    description: "Software consulting — architecture and full-stack engineering.",
    images: ["/og-1200x630.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
