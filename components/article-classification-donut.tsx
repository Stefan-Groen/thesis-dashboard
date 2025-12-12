"use client"

import * as React from "react"
import Link from "next/link"
import { Label, Pie, PieChart } from "recharts"
import { OctagonAlert, Lightbulb, Circle, Clock, Calendar, ChevronDown, ChevronRight } from "lucide-react"

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

interface ArticleClassificationDonutProps {
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

export function ArticleClassificationDonut({ stats, todayStats }: ArticleClassificationDonutProps) {
  const [view, setView] = React.useState<"total" | "today">("today")
  const [selectedDate, setSelectedDate] = React.useState<string>("")
  const [customStats, setCustomStats] = React.useState<Stats | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const displayStats = customStats || (view === "today" ? todayStats : stats)

  const chartData = [
    {
      classification: "opportunities",
      count: displayStats.opportunities,
      fill: "#5AE57F",
      icon: Lightbulb
    },
    {
      classification: "threats",
      count: displayStats.threats,
      fill: "#ED674C",
      icon: OctagonAlert
    },
    {
      classification: "neutral",
      count: displayStats.neutral,
      fill: "#4E79E4",
      icon: Circle
    },
    {
      classification: "unclassified",
      count: displayStats.unclassified,
      fill: "#88B6E7",
      icon: Clock
    },
  ]

  const totalArticles = React.useMemo(() => {
    return displayStats.total
  }, [displayStats])

  const handleYesterday = async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    handleDateSelect(yesterdayStr)
  }

  const handleDateSelect = async (date: string) => {
    if (!date) return

    setSelectedDate(date)
    setIsLoading(true)
    setErrorMessage(null)
    setDropdownOpen(false)

    try {
      // Fetch stats for the selected date
      const response = await fetch(`/api/stats?date=${date}`)
      if (response.ok) {
        const data = await response.json()
        // Check if there's an error message in the response
        if (data.error || data.message) {
          setErrorMessage(data.error || data.message)
          setCustomStats(null)
        } else {
          setCustomStats(data)
          setErrorMessage(null)
        }
        setView("today") // Keep "Today" button active when custom date is selected
      } else {
        setErrorMessage("Failed to load data for selected date")
        setCustomStats(null)
      }
    } catch (error) {
      console.error("Error fetching custom date stats:", error)
      setErrorMessage("Failed to load data")
      setCustomStats(null)
      setSelectedDate("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewChange = (newView: "total" | "today") => {
    setView(newView)
    setCustomStats(null)
    setSelectedDate("")
    setErrorMessage(null)
  }

  const getDisplayLabel = () => {
    if (selectedDate && customStats) {
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

  const getButtonHref = () => {
    if (selectedDate) {
      return `/dashboard/by-date?date=${selectedDate}`
    }
    if (view === "today") {
      const today = new Date().toISOString().split('T')[0]
      return `/dashboard/by-date?date=${today}`
    }
    return "/dashboard"
  }

  const CustomLegend = () => (
    <div className="flex flex-col gap-3 justify-center">
      {chartData.map((item) => {
        return (
          <div key={item.classification} className="flex items-center gap-2">
            <div
              className="size-3 rounded-sm"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-sm font-medium capitalize">
              {chartConfig[item.classification as keyof typeof chartConfig].label}
            </span>
            <span className="text-sm text-muted-foreground ml-auto">
              {item.count}
            </span>
          </div>
        )
      })}
    </div>
  )

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between w-full">
          <div>
            <CardTitle>Article Classification</CardTitle>
            <CardDescription>
              {selectedDate && customStats
                ? `Articles from ${new Date(selectedDate).toLocaleDateString()}`
                : view === "today"
                ? "Articles published today"
                : "All articles"}
            </CardDescription>
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
              <Button
                variant={view === "total" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("total")}
                className={`px-4 ${view === "total" ? "" : "hover:bg-transparent"}`}
                disabled={isLoading}
              >
                Total
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 flex flex-col">
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
        ) : (
          <>
            <div className="flex items-center gap-8 flex-1">
              <div className="flex-1">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="classification"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {totalArticles.toLocaleString()}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground text-sm"
                                >
                                  Articles
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="min-w-[150px]">
                <CustomLegend />
              </div>
            </div>
            {/* View All Button - Aligned with legend right edge */}
            <div className="flex justify-end mt-2">
              <Button asChild variant="outline" size="sm">
                <Link href={getButtonHref()}>
                  View all of selected date
                  <ChevronRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
