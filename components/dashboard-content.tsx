"use client"

import { useState } from "react"
import { SectionCards } from "@/components/section-cards"
import { DashboardViewToggle } from "@/components/dashboard-view-toggle"
import type { Stats } from "@/lib/types"

interface DashboardContentProps {
  stats: Stats
  todayStats: Stats
}

export function DashboardContent({ stats, todayStats }: DashboardContentProps) {
  const [view, setView] = useState<"total" | "today">("total")

  return (
    <>
      {/* Toggle above cards */}
      <div className="px-4 lg:px-6 pb-2">
        <DashboardViewToggle onViewChange={setView} defaultView="total" />
      </div>

      {/* Section Cards */}
      <SectionCards stats={stats} todayStats={todayStats} view={view} />
    </>
  )
}
