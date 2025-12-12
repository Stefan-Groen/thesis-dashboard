"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database } from "lucide-react"

interface TotalInDatabaseProps {
  threats: number
  opportunities: number
  neutral: number
  unclassified: number
  organizationCreatedAt: Date
}

export function TotalInDatabase({ threats, opportunities, neutral, unclassified, organizationCreatedAt }: TotalInDatabaseProps) {
  const items = [
    { label: "Threats", count: threats, color: "#ED674C" },
    { label: "Opport.", count: opportunities, color: "#5AE57F" },
    { label: "Neutral", count: neutral, color: "#4E79E4" },
    { label: "Pending", count: unclassified, color: "#88B6E7" },
  ]

  const total = threats + opportunities + neutral + unclassified

  // Calculate days active
  const now = new Date()
  const createdAt = new Date(organizationCreatedAt)
  const daysActive = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)))

  // Calculate average articles per day
  const avgPerDay = total > 0 ? (total / daysActive).toFixed(1) : "0.0"

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Database className="size-5 text-primary" />
          <CardTitle>Total in Database</CardTitle>
        </div>
        <CardDescription>Total classified articles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <Badge
              variant="secondary"
              className="h-6 min-w-[3rem] justify-center tabular-nums text-sm font-semibold"
            >
              {item.count.toLocaleString()}
            </Badge>
          </div>
        ))}

        {/* Divider and Total */}
        <div className="pt-2 mt-1 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Total</span>
            <Badge
              variant="default"
              className="h-6 min-w-[3rem] justify-center tabular-nums text-sm font-bold"
            >
              {total.toLocaleString()}
            </Badge>
          </div>
        </div>

        {/* Statistics */}
        <div className="pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Days Active</span>
            <span className="text-sm font-semibold tabular-nums">{daysActive}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Avg. per Day</span>
            <span className="text-sm font-semibold tabular-nums">{avgPerDay}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
