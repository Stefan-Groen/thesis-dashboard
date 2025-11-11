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
import { IconAlertTriangle, IconSparkles, IconNews, IconCircle, IconCalendarEvent, IconStarFilled, IconClock } from "@tabler/icons-react"
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
}

export function SectionCards({ stats }: SectionCardsProps) {
  // Calculate percentage of each classification
  const threatPercentage = stats.total > 0
    ? ((stats.threats / stats.total) * 100).toFixed(1)
    : '0.0'

  const opportunityPercentage = stats.total > 0
    ? ((stats.opportunities / stats.total) * 100).toFixed(1)
    : '0.0'

  const neutralPercentage = stats.total > 0
    ? ((stats.neutral / stats.total) * 100).toFixed(1)
    : '0.0'

  return (
    <>
      {/* New Grid Layout: 8 columns, 2 rows - Left side (4 cols) for main cards, Right side (4 cols) for radial charts */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-8 @5xl/main:grid-rows-2">

        {/* Row 1 Left: Total Articles Card - 2 cols */}
        <Link href="/dashboard/articles" className="@container/card @5xl/main:col-span-2 @5xl/main:row-span-1">
          <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 mb-2">
                <IconNews className="size-5 text-primary" />
                <Badge variant="outline" className="text-xs">
                  All Time
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold mb-1">Total Articles</CardTitle>
              <CardDescription className="text-xs">All articles in database</CardDescription>
            </div>
            <div className="absolute bottom-2 right-4 opacity-90">
              <span className="text-7xl font-black tabular-nums text-foreground/20">
                {stats.total.toLocaleString()}
              </span>
            </div>
          </Card>
        </Link>

        {/* Row 1 Left: Added Today Card - 2 cols */}
        <Link href="/dashboard/today" className="@container/card @5xl/main:col-span-2 @5xl/main:row-span-1">
          <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 mb-2">
                <IconCalendarEvent className="size-5 text-primary" />
                <Badge variant="outline" className="text-xs">
                  Today
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold mb-1">Added Today</CardTitle>
              <CardDescription className="text-xs">Articles published today</CardDescription>
            </div>
            <div className="absolute bottom-2 right-4 opacity-90">
              <span className="text-7xl font-black tabular-nums text-foreground/20">
                {stats.articlesToday.toLocaleString()}
              </span>
            </div>
          </Card>
        </Link>

        {/* Row 1 Right: Threats Radial Card - 2 cols */}
        <div className="@5xl/main:col-span-2 @5xl/main:row-span-1">
          <RadialStatCard
            title="Threats"
            value={stats.threats}
            total={stats.total}
            color="hsl(0, 84%, 60%)"
            icon={<IconAlertTriangle className="size-5 text-red-600 dark:text-red-400" />}
            href="/dashboard/threats"
          />
        </div>

        {/* Row 1 Right: Opportunities Radial Card - 2 cols */}
        <div className="@5xl/main:col-span-2 @5xl/main:row-span-1">
          <RadialStatCard
            title="Opportunities"
            value={stats.opportunities}
            total={stats.total}
            color="hsl(142, 76%, 36%)"
            icon={<IconSparkles className="size-5 text-green-600 dark:text-green-400" />}
            href="/dashboard/opportunities"
          />
        </div>

        {/* Row 2 Left: Starred Articles Card - 4 cols wide */}
        <Link href="/dashboard/starred" className="@container/card @5xl/main:col-span-4 @5xl/main:row-span-1">
          <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 mb-2">
                <IconStarFilled className="size-5 text-yellow-600 dark:text-yellow-400" />
                <Badge variant="outline" className="text-xs text-yellow-600 dark:text-yellow-400">
                  Favorites
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold mb-1">Starred Articles</CardTitle>
              <CardDescription className="text-xs">Your starred articles</CardDescription>
            </div>
            <div className="absolute bottom-2 right-4 opacity-90">
              <span className="text-7xl font-black tabular-nums text-foreground/20">
                {stats.starred.toLocaleString()}
              </span>
            </div>
          </Card>
        </Link>

        {/* Row 2 Right: Neutral Radial Card - 2 cols */}
        <div className="@5xl/main:col-span-2 @5xl/main:row-span-1">
          <RadialStatCard
            title="Neutral"
            value={stats.neutral}
            total={stats.total}
            color="hsl(221, 83%, 53%)"
            icon={<IconCircle className="size-5 text-blue-600 dark:text-blue-400" />}
            href="/dashboard/neutral"
          />
        </div>

        {/* Row 2 Right: Articles Pending Classification Card - 2 cols */}
        <div className="@5xl/main:col-span-2 @5xl/main:row-span-1">
          <RadialStatCard
            title="Pending"
            value={stats.unclassified}
            total={stats.total}
            color="hsl(0, 0%, 70%)"
            icon={<IconClock className="size-5 text-slate-500 dark:text-slate-400" />}
            href="/dashboard/backlog"
          />
        </div>
      </div>
    </>
  )
}
