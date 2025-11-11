"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"

interface RadialStatCardProps {
  title: string
  value: number
  total: number
  color: string
  icon?: React.ReactNode
  href: string
  className?: string
}

export function RadialStatCard({
  title,
  value,
  total,
  color,
  icon,
  href,
  className = ""
}: RadialStatCardProps) {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'

  // Generate stable ID based on title
  const chartId = useMemo(() => `chart-${title.toLowerCase().replace(/\s+/g, '-')}`, [title])

  // Simple chart data - just the value for display
  const chartData = [{
    value: 100 // Full semicircle
  }]

  const chartConfig = {
    value: {
      label: title,
      color: color,
    },
  } satisfies ChartConfig

  return (
    <Link href={href} className={`block h-full ${className}`}>
      <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full flex flex-col">
        <CardHeader className="items-center pb-2">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <CardDescription className="text-xs">{percentage}% of total</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end justify-center pb-0 pt-2">
          <ChartContainer
            config={chartConfig}
            className="mx-auto w-full max-w-[200px] h-[140px]"
            id={chartId}
          >
            <RadialBarChart
              data={chartData}
              startAngle={0}
              endAngle={180}
              innerRadius={60}
              outerRadius={90}
            >
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 4}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {value.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 16}
                            className="fill-muted-foreground text-xs"
                          >
                            {title}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              {/* Single color full semicircle */}
              <RadialBar
                dataKey="value"
                cornerRadius={5}
                fill={color}
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </Link>
  )
}
