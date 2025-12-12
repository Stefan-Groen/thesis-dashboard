/**
 * SectionCards Component
 *
 * Displays summary statistics as cards:
 * - Total Articles
 * - Threats (clickable → /dashboard/threats)
 * - Opportunities (clickable → /dashboard/opportunities)
 * - Neutral (clickable → /dashboard/neutral)
 *
 * This component receives stats as props (like function parameters in Python)
 *
 * Python equivalent:
 * ```python
 * def section_cards(stats: Stats):
 *     return render_template('cards.html', stats=stats)
 * ```
 */

import Link from "next/link"
import { IconNews, IconCircle, IconCalendarEvent, IconStarFilled, IconClock } from "@tabler/icons-react"
import { OctagonAlert, Lightbulb } from "lucide-react"
import type { Stats } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadialStatCard } from "@/components/radial-stat-card"

// Props interface (like function parameters with type hints)
interface SectionCardsProps {
  stats: Stats
  todayStats: Stats
  view: "total" | "today"
  selectedDate?: string
  displayStats?: Stats
}

export function SectionCards({ stats, todayStats, view, selectedDate, displayStats: providedStats }: SectionCardsProps) {
  const displayStats = providedStats || (view === "today" ? todayStats : stats)

  // Build URL with date filter and classification if applicable
  const buildHref = (classification: 'Threat' | 'Opportunity' | 'Neutral' | 'Pending') => {
    if (selectedDate) {
      // Use classification-specific by-date pages
      const classificationPaths = {
        'Threat': `/dashboard/by-date-threats?date=${selectedDate}`,
        'Opportunity': `/dashboard/by-date-opportunities?date=${selectedDate}`,
        'Neutral': `/dashboard/by-date-neutral?date=${selectedDate}`,
        'Pending': `/dashboard/by-date-pending?date=${selectedDate}`
      }
      return classificationPaths[classification]
    }
    if (view === "today") {
      const today = new Date().toISOString().split('T')[0]
      // Use classification-specific by-date pages for today
      const classificationPaths = {
        'Threat': `/dashboard/by-date-threats?date=${today}`,
        'Opportunity': `/dashboard/by-date-opportunities?date=${today}`,
        'Neutral': `/dashboard/by-date-neutral?date=${today}`,
        'Pending': `/dashboard/by-date-pending?date=${today}`
      }
      return classificationPaths[classification]
    }
    // For "total" view, use the old pages
    const basePaths = {
      'Threat': '/dashboard/threats',
      'Opportunity': '/dashboard/opportunities',
      'Neutral': '/dashboard/neutral',
      'Pending': '/dashboard/backlog'
    }
    return basePaths[classification]
  }

  // Get view label for display in cards
  const getViewLabel = () => {
    if (selectedDate) {
      const date = new Date(selectedDate + 'T00:00:00')
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return view === "today" ? "Today" : "Total"
  }

  const viewLabel = getViewLabel()

  return (
    <>
      {/* Row 1: 4 tiles (2 cols each) - Threats, Opportunities, Neutral, Pending */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Threats - 2 cols wide (spans 1 of 4) */}
          <div>
            <RadialStatCard
              title="Threats"
              value={displayStats.threats}
              total={displayStats.total}
              color="hsl(0, 84%, 60%)"
              icon={<OctagonAlert className="size-5 text-red-600 dark:text-red-400" />}
              href={buildHref('Threat')}
              viewLabel={viewLabel}
            />
          </div>

          {/* Opportunities - 2 cols wide (spans 1 of 4) */}
          <div>
            <RadialStatCard
              title="Opportunities"
              value={displayStats.opportunities}
              total={displayStats.total}
              color="hsl(142, 76%, 36%)"
              icon={<Lightbulb className="size-5 text-green-600 dark:text-green-400" />}
              href={buildHref('Opportunity')}
              viewLabel={viewLabel}
            />
          </div>

          {/* Neutral - 2 cols wide (spans 1 of 4) */}
          <div>
            <RadialStatCard
              title="Neutral"
              value={displayStats.neutral}
              total={displayStats.total}
              color="hsl(221, 83%, 53%)"
              icon={<IconCircle className="size-5 text-blue-600 dark:text-blue-400" />}
              href={buildHref('Neutral')}
              viewLabel={viewLabel}
            />
          </div>

          {/* Pending - 2 cols wide (spans 1 of 4) */}
          <div>
            <RadialStatCard
              title="Pending"
              value={displayStats.unclassified}
              total={displayStats.total}
              color="hsl(0, 0%, 70%)"
              icon={<IconClock className="size-5 text-slate-500 dark:text-slate-400" />}
              href={buildHref('Pending')}
              viewLabel={viewLabel}
            />
        </div>
      </div>
    </>
  )
}
