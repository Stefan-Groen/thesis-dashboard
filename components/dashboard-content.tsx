"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, CheckCheck, Loader } from "lucide-react"
import { SectionCards } from "@/components/section-cards"
import { DashboardViewToggle } from "@/components/dashboard-view-toggle"
import { ArticleClassificationDonut } from "@/components/article-classification-donut"
import { HourlyDistributionChart } from "@/components/hourly-distribution-chart"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { Stats, Metrics } from "@/lib/types"

interface DashboardContentProps {
  stats: Stats
  todayStats: Stats
  metrics: Metrics
}

export function DashboardContent({ stats, todayStats, metrics }: DashboardContentProps) {
  const [view, setView] = useState<"total" | "today">("today")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [customStats, setCustomStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleViewChange = (newView: "total" | "today", date?: string) => {
    setView(newView)
    setSelectedDate(date || "")
    if (!date) {
      setCustomStats(null)
      setErrorMessage(null)
    }
  }

  // Fetch stats when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setCustomStats(null)
      setErrorMessage(null)
      return
    }

    const fetchStats = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const response = await fetch(`/api/stats?date=${selectedDate}`)
        if (response.ok) {
          const data = await response.json()
          if (data.error || data.message) {
            setErrorMessage(data.error || data.message)
            setCustomStats(null)
          } else {
            setCustomStats(data)
            setErrorMessage(null)
          }
        } else {
          setErrorMessage("Failed to load data for selected date")
          setCustomStats(null)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
        setErrorMessage("Failed to load data")
        setCustomStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [selectedDate])

  const displayStats = customStats || (view === "today" ? todayStats : stats)

  return (
    <>
      {/* Section Title with Chevron */}
      <div className="px-4 lg:px-6 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Quick Overview</h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label={isCollapsed ? "Expand section" : "Collapse section"}
          >
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Section Content */}
      {!isCollapsed && (
        <>
          {/* Row 1: Section Cards with Toggle */}
          <div className="px-4 lg:px-6">
            {/* Toggle - positioned above cards to show it controls them */}
            <div className="flex justify-end mb-2">
              <DashboardViewToggle onViewChange={handleViewChange} defaultView="today" />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : errorMessage ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <p className="text-muted-foreground font-medium mb-1">No data available</p>
                  <p className="text-sm text-muted-foreground">{errorMessage}</p>
                </div>
              </div>
            ) : (
              <SectionCards
                stats={stats}
                todayStats={todayStats}
                view={view}
                selectedDate={selectedDate}
                displayStats={displayStats}
              />
            )}
          </div>

          {/* Row 2: Article Classification Donut (6 cols, 2 rows) + Reviewed Articles + New Articles (2 cols each) */}
          <div className="px-4 lg:px-6">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-8">
              {/* Article Classification Donut - 6 cols wide, 2 rows height */}
              <div className="lg:col-span-6 lg:row-span-2">
                <ArticleClassificationDonut stats={stats} todayStats={todayStats} />
              </div>

              {/* Reviewed T/O tile - 2 cols wide, row 2 */}
              <Link href="/dashboard/reviewed" className="lg:col-span-2">
                <Card className="cursor-pointer transition-all hover:bg-muted/50 pt-4 pb-4 h-full">
                  <CardHeader className="pb-0 pt-0">
                    <div className="flex items-center gap-2">
                      <CheckCheck className="size-5 text-green-600 dark:text-green-400" />
                      <CardTitle className="text-lg">Reviewed Articles</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Threats/Opportunities rated</p>
                  </CardHeader>
                  <div className="pt-0 pb-0 px-6">
                    <span className="text-4xl font-bold tabular-nums">
                      {metrics.reviewedThreatsOpps.toLocaleString()}
                    </span>
                  </div>
                </Card>
              </Link>

              {/* New T/O tile - 2 cols wide, row 3 */}
              <Link href="/dashboard/new" className="lg:col-span-2">
                <Card className={`cursor-pointer transition-all hover:bg-muted/50 pt-4 pb-4 h-full ${
                  metrics.newThreatsOpps > 0
                    ? 'border-orange-500/60 dark:border-orange-400/60 border-2 animate-pulse-slow'
                    : ''
                }`}>
                  <CardHeader className="pb-0 pt-0">
                    <div className="flex items-center gap-2">
                      <Loader className="size-5 text-orange-600 dark:text-orange-400" />
                      <CardTitle className="text-lg">New Articles</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">New Threats/Opportunities</p>
                  </CardHeader>
                  <div className="pt-0 pb-0 px-6">
                    <span className="text-4xl font-bold tabular-nums">
                      {metrics.newThreatsOpps.toLocaleString()}
                    </span>
                  </div>
                </Card>
              </Link>
            </div>
          </div>

          {/* Row 3: Hourly Distribution Chart (8 cols, 2 rows) */}
          <div className="px-4 lg:px-6">
            <HourlyDistributionChart stats={stats} todayStats={todayStats} />
          </div>
        </>
      )}
    </>
  )
}
