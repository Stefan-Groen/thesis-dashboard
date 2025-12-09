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
}

export function SectionCards({ stats, todayStats, view }: SectionCardsProps) {
  const displayStats = view === "today" ? todayStats : stats

  return (
    <>
      {/* Row 1: 4 tiles (2 cols each) - Threats, Opportunities, Neutral, Pending */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Threats - 2 cols wide (spans 1 of 4) */}
          <div>
            <RadialStatCard
              title="Threats"
              value={displayStats.threats}
              total={displayStats.total}
              color="hsl(0, 84%, 60%)"
              icon={<OctagonAlert className="size-5 text-red-600 dark:text-red-400" />}
              href="/dashboard/threats"
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
              href="/dashboard/opportunities"
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
              href="/dashboard/neutral"
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
              href="/dashboard/backlog"
            />
          </div>
        </div>
      </div>
    </>
  )
}
