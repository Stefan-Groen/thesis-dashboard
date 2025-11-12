/**
 * ActivityLineChart Component
 *
 * Displays a line chart showing articles published vs classified per day.
 * Two lines: Published (purple) and Classified (orange)
 */

"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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

// Chart configuration for colors
const chartConfig = {
  published: {
    label: "Published",
    color: "hsl(270, 60%, 60%)", // Purple
  },
  classified: {
    label: "Classified",
    color: "hsl(30, 90%, 55%)", // Orange
  },
} satisfies ChartConfig

interface ActivityDataPoint {
  date: string
  published: number
  classified: number
}

interface ActivityLineChartProps {
  data: ActivityDataPoint[]
}

export function ActivityLineChart({ data: activityData }: ActivityLineChartProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("7d")
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    if (activityData.length === 0) return []

    const now = new Date()
    let daysToSubtract = 7

    if (timeRange === "90d") {
      daysToSubtract = 90
    } else if (timeRange === "30d") {
      daysToSubtract = 30
    }

    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return activityData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [activityData, timeRange])

  // Show loading skeleton during SSR/hydration
  if (!mounted) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Article Activity</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Daily article publishing and classification activity
            </span>
            <span className="@[540px]/card:hidden">Activity trends</span>
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
        <CardTitle>Article Activity</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Daily article publishing and classification activity
          </span>
          <span className="@[540px]/card:hidden">Activity trends</span>
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
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <LineChart
              accessibilityLayer
              data={filteredData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                  />
                }
              />
              <Line
                dataKey="published"
                type="natural"
                stroke="var(--color-published)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="classified"
                type="natural"
                stroke="var(--color-classified)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
