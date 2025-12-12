/**
 * ChartBarInteractive Component
 *
 * Displays a multiple bar chart showing article classification trends.
 * Shows two data series: Threats (red) and Opportunities (green)
 * Based on date_published (when articles were published)
 *
 * This component receives chart data as props and allows filtering by time range.
 */

"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { ChartDataPoint } from "@/lib/types"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Chart configuration for colors and labels
const chartConfig = {
  threats: {
    label: "Threats",
    color: "#ED674C",
  },
  opportunities: {
    label: "Opportunities",
    color: "#5AE57F",
  },
  neutral: {
    label: "Neutral",
    color: "#4E79E4",
  },
} satisfies ChartConfig

interface ChartBarInteractiveProps {
  data: ChartDataPoint[]
}

export function ChartAreaInteractive({ data: chartData }: ChartBarInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d") // Default to 30 days
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return []

    const now = new Date()
    let daysToSubtract = 7 // Default: 1 week

    if (timeRange === "90d") {
      daysToSubtract = 90 // 3 months
    } else if (timeRange === "30d") {
      daysToSubtract = 30 // 1 month
    }

    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [chartData, timeRange])

  // Show loading skeleton during SSR/hydration
  if (!mounted) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Article Classification Trends</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Daily classified threats and opportunities based on publication date
            </span>
            <span className="@[540px]/card:hidden">Classification trends</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Article Classification Trends</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Daily classified threats and opportunities based on publication date
          </span>
          <span className="@[540px]/card:hidden">Classification trends</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 7 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">
              No data available for the selected time range
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart accessibilityLayer data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="threats"
                stackId="a"
                fill={chartConfig.threats.color}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="opportunities"
                stackId="a"
                fill={chartConfig.opportunities.color}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="neutral"
                stackId="a"
                fill={chartConfig.neutral.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
