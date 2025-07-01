import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cosmic Tasks - Personal Task Tracker",
  description: "A space-themed personal productivity app for task management and daily focus tracking",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen relative overflow-hidden">
          <div className="star-field absolute inset-0 z-0" />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  )
}
