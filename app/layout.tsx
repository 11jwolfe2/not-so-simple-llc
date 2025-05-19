import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import type { Metadata } from 'next';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.not-so-simple.com'),
  title: "Not So Simple, LLC",
  description: "We help startups and enterprises build software that scales — from architecture to implementation.",
  icons: {
    icon: [
      { url: '/favicon.ico', rel: 'shortcut icon' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    title: 'Not So Simple, LLC',
  },
  openGraph: {
    title: 'Not So Simple, LLC',
    description: 'We help startups and enterprises build software that scales — from architecture to implementation.',
    url: 'https://www.not-so-simple.com',
    siteName: 'Not So Simple, LLC',
    images: [
      {
        url: '/not-so-simple-og-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'Not So Simple, LLC Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Not So Simple, LLC',
    description: 'Software consulting, strategy, and scalable systems from Not So Simple, LLC.',
    images: ['/notsosimple_logo_fixed_white_bg.png'],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0A0A] text-white antialiased`}>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}
