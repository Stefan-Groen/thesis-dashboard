"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface RadialStatCardProps {
  title: string
  value: number
  total: number
  color: string
  icon?: React.ReactNode
  href: string
  className?: string
  viewLabel?: string
}

export function RadialStatCard({
  title,
  value,
  total,
  color,
  icon,
  href,
  className = "",
  viewLabel
}: RadialStatCardProps) {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'

  return (
    <Link href={href} className={`block ${className}`}>
      <Card className="cursor-pointer transition-all hover:bg-muted/50 pt-4 pb-4">
        <CardHeader className="pb-0 pt-0">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{percentage}% of total</p>
        </CardHeader>
        <CardContent className="pt-0 pb-2 relative pr-6">
          <span className="text-4xl font-bold tabular-nums">
            {value.toLocaleString()}
          </span>
          {viewLabel && (
            <span className="absolute bottom-2 right-6 text-xs text-muted-foreground">
              {viewLabel}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
