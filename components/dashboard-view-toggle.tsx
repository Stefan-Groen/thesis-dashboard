"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface DashboardViewToggleProps {
  onViewChange: (view: "total" | "today", date?: string) => void
  defaultView?: "total" | "today"
}

export function DashboardViewToggle({ onViewChange, defaultView = "today" }: DashboardViewToggleProps) {
  const [activeView, setActiveView] = useState<"total" | "today">(defaultView)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleToggle = (view: "total" | "today") => {
    setActiveView(view)
    setSelectedDate("")
    onViewChange(view)
  }

  const handleYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    setSelectedDate(yesterdayStr)
    setActiveView("today")
    setDropdownOpen(false)
    onViewChange("today", yesterdayStr)
  }

  const handleDateSelect = (date: string) => {
    if (!date) return
    setSelectedDate(date)
    setActiveView("today")
    setDropdownOpen(false)
    onViewChange("today", date)
  }

  const getDisplayLabel = () => {
    if (selectedDate) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (selectedDate === yesterdayStr) {
        return "Yesterday"
      }
      const date = new Date(selectedDate + 'T00:00:00')
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return "Today"
  }

  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit">
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={activeView === "today" ? "default" : "ghost"}
            size="sm"
            className={`px-4 ${activeView === "today" ? "" : "hover:bg-transparent"}`}
          >
            {getDisplayLabel()}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => { handleToggle("today"); setDropdownOpen(false); }}>
            Today
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleYesterday}>
            Yesterday
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-2">
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Select a date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
              className="mt-1"
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant={activeView === "total" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToggle("total")}
        className={`px-4 ${activeView === "total" ? "" : "hover:bg-transparent"}`}
      >
        Total
      </Button>
    </div>
  )
}
