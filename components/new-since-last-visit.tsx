/**
 * New Since Last Visit Component
 *
 * Displays the number of new articles by classification since the user's last dashboard visit
 * Uses horizontal status bars to visualize the distribution
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconClock } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

interface NewSinceLastVisitProps {
  threats: number
  opportunities: number
  neutral: number
  unclassified: number
}

export function NewSinceLastVisit({
  threats,
  opportunities,
  neutral,
  unclassified
}: NewSinceLastVisitProps) {
  const total = threats + opportunities + neutral + unclassified

  // Calculate percentages for bar widths
  const threatsPercent = total > 0 ? (threats / total) * 100 : 0
  const opportunitiesPercent = total > 0 ? (opportunities / total) * 100 : 0
  const neutralPercent = total > 0 ? (neutral / total) * 100 : 0
  const unclassifiedPercent = total > 0 ? (unclassified / total) * 100 : 0

  const items = [
    {
      label: "Threats",
      count: threats,
      percent: threatsPercent,
      color: "bg-red-500",
      lightColor: "bg-red-100 dark:bg-red-950"
    },
    {
      label: "Opportunities",
      count: opportunities,
      percent: opportunitiesPercent,
      color: "bg-green-500",
      lightColor: "bg-green-100 dark:bg-green-950"
    },
    {
      label: "Neutral",
      count: neutral,
      percent: neutralPercent,
      color: "bg-blue-500",
      lightColor: "bg-blue-100 dark:bg-blue-950"
    },
    {
      label: "Pending",
      count: unclassified,
      percent: unclassifiedPercent,
      color: "bg-gray-500",
      lightColor: "bg-gray-100 dark:bg-gray-800"
    }
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconClock className="size-5 text-primary" />
          <CardTitle>New Since Last Visit</CardTitle>
        </div>
        <CardDescription>
          {total > 0 ? `${total} new article${total !== 1 ? 's' : ''} since your last visit` : 'No new articles'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="font-medium text-sm min-w-[100px]">{item.label}</span>
            <div className={`flex-1 h-3 rounded-full overflow-hidden ${item.lightColor}`}>
              <div
                className={`h-full ${item.color} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <Badge variant="secondary" className="tabular-nums min-w-[45px] justify-center">
              {item.count}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
