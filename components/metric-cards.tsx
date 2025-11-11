/**
 * MetricCards Component
 *
 * Displays three metric cards:
 * - Backlog (clickable → /dashboard/backlog)
 * - Service Level (percentage)
 * - Own Articles (clickable → /dashboard/user_uploaded)
 */

import Link from "next/link"
import { IconClock, IconGauge, IconUser } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Metrics {
  backlog: number
  serviceLevel: number
  ownArticles: number
}

interface MetricCardsProps {
  metrics: Metrics
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {/* Backlog Card - Clickable */}
      <Link href="/dashboard/backlog" className="block">
        <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <IconClock className="size-8 text-orange-600" />
              <Badge variant="outline" className="text-lg px-3 py-1">
                {metrics.backlog}
              </Badge>
            </div>
            <CardTitle className="text-xl mt-2">Backlog</CardTitle>
            <CardDescription>
              Articles still needed to be classified
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      {/* Own Articles Card - Clickable */}
      <Link href="/dashboard/user_uploaded" className="block">
        <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <IconUser className="size-8 text-purple-600" />
              <Badge variant="outline" className="text-lg px-3 py-1">
                {metrics.ownArticles}
              </Badge>
            </div>
            <CardTitle className="text-xl mt-2">Own Articles</CardTitle>
            <CardDescription>
              Articles added by you
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      {/* Service Level Card - Not Clickable */}
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <IconGauge className="size-8 text-blue-600" />
            <Badge variant="outline" className="text-lg px-3 py-1">
              {metrics.serviceLevel.toFixed(1)}%
            </Badge>
          </div>
          <CardTitle className="text-xl mt-2">Service Level</CardTitle>
          <CardDescription>
            Articles classified within 6 hours
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
