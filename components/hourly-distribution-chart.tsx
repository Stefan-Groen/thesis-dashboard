"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Calendar, ChevronDown } from "lucide-react"

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { Stats } from "@/lib/types"

interface HourlyDistributionData {
  hour: number
  threats: number
  opportunities: number
  neutral: number
  unclassified: number
  total: number
}

interface HourlyDistributionChartProps {
  stats: Stats
  todayStats: Stats
}

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
  unclassified: {
    label: "Pending",
    color: "#88B6E7",
  },
} satisfies ChartConfig

export function HourlyDistributionChart({ stats, todayStats }: HourlyDistributionChartProps) {
  const [view, setView] = React.useState<"total" | "today">("today")
  const [selectedDate, setSelectedDate] = React.useState<string>("")
  const [data, setData] = React.useState<HourlyDistributionData[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        // Determine which date to fetch (always need a date for hourly distribution)
        const dateToFetch = selectedDate || new Date().toISOString().split('T')[0]

        const response = await fetch(`/api/hourly-distribution?date=${dateToFetch}`)
        if (response.ok) {
          const result = await response.json()
          setData(result.data || [])

          // Check if there's an error message
          if (result.meta?.message) {
            setErrorMessage(result.meta.message)
          }
        } else {
          console.error("Failed to fetch hourly distribution")
          setData([])
          setErrorMessage("Failed to load data")
        }
      } catch (error) {
        console.error("Error fetching hourly distribution:", error)
        setData([])
        setErrorMessage("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [view, selectedDate])

  const handleViewChange = (newView: "total" | "today") => {
    setView(newView)
    setSelectedDate("")
  }

  const handleYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    setSelectedDate(yesterdayStr)
    setView("today")
    setDropdownOpen(false)
  }

  const handleDateSelect = (date: string) => {
    if (!date) return
    setSelectedDate(date)
    setView("today")
    setDropdownOpen(false)
  }

  const getDisplayLabel = () => {
    if (selectedDate) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (selectedDate === yesterdayStr) {
        return "Yesterday"
      }
      const date = new Date(selectedDate + 'T00:00:00')
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return "Today"
  }

  const getTitle = () => {
    if (selectedDate) {
      const date = new Date(selectedDate + 'T00:00:00')
      return `Article Distribution - ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    }
    return "Today's Article Distribution"
  }

  const getDescription = () => {
    if (selectedDate) {
      return "Hourly breakdown of articles published on selected date"
    }
    return "Hourly breakdown of articles published today"
  }

  // Format data for chart - ensure all 24 hours are present
  const chartData = data.map((item) => ({
    hour: `${item.hour.toString().padStart(2, '0')}:00`,
    hourValue: item.hour,
    threats: item.threats,
    opportunities: item.opportunities,
    neutral: item.neutral,
    unclassified: item.unclassified,
  }))

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between w-full">
          <div>
            <CardTitle>{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            {/* Toggle slider */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={view === "today" ? "default" : "ghost"}
                    size="sm"
                    className={`px-4 ${view === "today" ? "" : "hover:bg-transparent"}`}
                    disabled={isLoading}
                  >
                    {getDisplayLabel()}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => { handleViewChange("today"); setDropdownOpen(false); }}>
                    Today
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleYesterday}>
                    Yesterday
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-2">
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Select a date
                    </label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateSelect(e.target.value)}
                      className="mt-1"
                      disabled={isLoading}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : errorMessage ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <p className="text-muted-foreground font-medium mb-1">No data available</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={1}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
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
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="unclassified"
                stackId="a"
                fill={chartConfig.unclassified.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
