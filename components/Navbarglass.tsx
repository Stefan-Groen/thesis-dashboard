'use client'

import { ChevronRight } from "lucide-react"
import Link from "next/link"

export function Navbarglass() {
  return (
    <div
      className="
        fixed top-6 left-1/2 -translate-x-1/2
        z-50

        w-[900px] h-16
        flex items-center justify-between

        rounded-4xl
        border border-white/10
        bg-white/10
        shadow-[0_6px_40px_rgba(0,0,0,0.4)]
        backdrop-blur-sm

        px-8
      "
    >
      {/* Logo */}
      <Link href="/" className="font-semibold text-lg text-white">
        SignalShark
      </Link>

      {/* Navigation links */}
      <nav className="flex items-center gap-10 text-sm text-white/70">
        <Link href="/features" className="hover:text-white transition-colors">
          Features
        </Link>
        <Link href="/pricing" className="hover:text-white transition-colors">
          Pricing
        </Link>
        <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1 font-semibold text-white/90">
          Dashboard
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </Link>
      </nav>
    </div>
  )
}
