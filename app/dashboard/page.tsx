/**
 * Dashboard Page
 *
 * This is a Next.js Server Component that fetches data from our API routes
 * and passes it to the client components.
 */

import Link from "next/link"
import { IconGauge, IconUser, IconUpload } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ActivityLineChart } from "@/components/activity-line-chart"
import { MetricCards } from "@/components/metric-cards"
import { UploadArticleDialog } from "@/components/upload-article-dialog"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { Stats, ChartDataPoint, ActivityDataPoint, Metrics } from "@/lib/types"

/**
 * Fetch dashboard statistics from our API
 */
async function getStats(): Promise<Stats> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/stats`, {
      next: { revalidate: 30 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch stats')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { total: 0, threats: 0, opportunities: 0, neutral: 0, unclassified: 0, articlesToday: 0, starred: 0 }
  }
}

/**
 * Fetch chart data from our API
 */
async function getChartData(): Promise<ChartDataPoint[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/chart-data?days=90`, {
      next: { revalidate: 30 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch chart data')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return []
  }
}

/**
 * Fetch activity data (published vs classified)
 */
async function getActivityData(): Promise<ActivityDataPoint[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/activity-data?days=90`, {
      next: { revalidate: 30 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch activity data')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching activity data:', error)
    return []
  }
}

/**
 * Fetch metrics (backlog, service level, own articles)
 */
async function getMetrics(): Promise<Metrics> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/metrics`, {
      next: { revalidate: 30 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch metrics')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return { backlog: 0, serviceLevel: 0, ownArticles: 0 }
  }
}

/**
 * Main Dashboard Page Component
 */
export default async function Page() {
  // Fetch all data in parallel for better performance
  const [stats, chartData, activityData, metrics] = await Promise.all([
    getStats(),
    getChartData(),
    getActivityData(),
    getMetrics(),
  ])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Summary Cards - Row 1 & 2 */}
              <SectionCards stats={stats} />

              {/* Row 3: Both graphs side by side (4 cols each) */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  {/* Classification Trends Chart - Left */}
                  <div>
                    <ChartAreaInteractive data={chartData} />
                  </div>

                  {/* Activity Line Chart - Right */}
                  <div>
                    <ActivityLineChart data={activityData} />
                  </div>
                </div>
              </div>

              {/* Row 4: Metric cards - Service Level (2 cols), Own Articles (2 cols), Upload (4 cols) */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-8">
                  {/* Service Level Card - 2 cols wide */}
                  <div className="lg:col-span-2">
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

                  {/* Own Articles Card - 2 cols wide */}
                  <div className="lg:col-span-2">
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
                  </div>

                  {/* Upload Article Card - 4 cols wide */}
                  <div className="lg:col-span-4">
                    <Link href="/dashboard/upload" className="block">
                      <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full">
                        <CardHeader className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                          <IconUpload className="size-12 text-muted-foreground mb-4" />
                          <CardTitle className="text-xl">Upload Article</CardTitle>
                          <CardDescription>
                            Add your own article for classification
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
