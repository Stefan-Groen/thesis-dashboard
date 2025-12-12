"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultCollapsed?: boolean
}

export function CollapsibleSection({ title, children, defaultCollapsed = false }: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <>
      {/* Section Title with Chevron */}
      <div className="px-4 lg:px-6 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label={isCollapsed ? "Expand section" : "Collapse section"}
          >
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Section Content */}
      {!isCollapsed && children}
    </>
  )
}
