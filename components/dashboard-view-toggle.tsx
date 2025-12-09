"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface DashboardViewToggleProps {
  onViewChange: (view: "total" | "today") => void
  defaultView?: "total" | "today"
}

export function DashboardViewToggle({ onViewChange, defaultView = "total" }: DashboardViewToggleProps) {
  const [activeView, setActiveView] = useState<"total" | "today">(defaultView)

  const handleToggle = (view: "total" | "today") => {
    setActiveView(view)
    onViewChange(view)
  }

  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit">
      <Button
        variant={activeView === "total" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToggle("total")}
        className={`px-4 ${activeView === "total" ? "" : "hover:bg-transparent"}`}
      >
        Total
      </Button>
      <Button
        variant={activeView === "today" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToggle("today")}
        className={`px-4 ${activeView === "today" ? "" : "hover:bg-transparent"}`}
      >
        Today
      </Button>
    </div>
  )
}
