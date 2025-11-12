/**
 * Dashboard Page
 *
 * This is a Next.js Server Component that fetches data from our API routes
 * and passes it to the client components.
 */

// Force dynamic rendering (don't statically generate at build time)
export const dynamic = 'force-dynamic'

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
import { query } from "@/lib/db"

/**
 * Fetch dashboard statistics directly from database
 */
async function getStats(): Promise<Stats> {
  try {
    const sql = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE classification = 'Threat') as threats,
        COUNT(*) FILTER (WHERE classification = 'Opportunity') as opportunities,
        COUNT(*) FILTER (WHERE classification = 'Neutral') as neutral,
        COUNT(*) FILTER (WHERE classification IS NULL OR classification = '') as unclassified,
        COUNT(*) FILTER (WHERE date_published >= CURRENT_DATE) as articles_today,
        COUNT(*) FILTER (WHERE starred = true) as starred
      FROM articles
      WHERE status != 'OUTDATED' AND classification != 'OUTDATED';
    `

    const result = await query(sql)
    const row = result.rows[0]

    return {
      total: parseInt(row.total) || 0,
      threats: parseInt(row.threats) || 0,
      opportunities: parseInt(row.opportunities) || 0,
      neutral: parseInt(row.neutral) || 0,
      unclassified: parseInt(row.unclassified) || 0,
      articlesToday: parseInt(row.articles_today) || 0,
      starred: parseInt(row.starred) || 0,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { total: 0, threats: 0, opportunities: 0, neutral: 0, unclassified: 0, articlesToday: 0, starred: 0 }
  }
}

/**
 * Fetch chart data directly from database
 */
async function getChartData(): Promise<ChartDataPoint[]> {
  try {
    const sql = `
      SELECT
        TO_CHAR(date_published::date, 'YYYY-MM-DD') as date,
        COUNT(*) FILTER (WHERE classification = 'Threat') as threats,
        COUNT(*) FILTER (WHERE classification = 'Opportunity') as opportunities,
        COUNT(*) FILTER (WHERE classification = 'Neutral') as neutral
      FROM articles
      WHERE date_published >= CURRENT_DATE - INTERVAL '90 days'
        AND status != 'OUTDATED' AND classification != 'OUTDATED'
      GROUP BY date_published::date
      ORDER BY date_published::date;
    `

    const result = await query(sql)

    return result.rows.map((row) => ({
      date: row.date,
      threats: parseInt(row.threats) || 0,
      opportunities: parseInt(row.opportunities) || 0,
      neutral: parseInt(row.neutral) || 0,
    }))
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return []
  }
}

/**
 * Fetch activity data (published vs classified) directly from database
 */
async function getActivityData(): Promise<ActivityDataPoint[]> {
  try {
    const sql = `
      SELECT
        TO_CHAR(date_published::date, 'YYYY-MM-DD') as date,
        COUNT(*) as published,
        COUNT(*) FILTER (WHERE classification_date IS NOT NULL) as classified
      FROM articles
      WHERE date_published >= CURRENT_DATE - INTERVAL '90 days'
        AND status != 'OUTDATED' AND classification != 'OUTDATED'
      GROUP BY date_published::date
      ORDER BY date_published::date;
    `

    const result = await query(sql)

    return result.rows.map((row) => ({
      date: row.date,
      published: parseInt(row.published) || 0,
      classified: parseInt(row.classified) || 0,
    }))
  } catch (error) {
    console.error('Error fetching activity data:', error)
    return []
  }
}

/**
 * Fetch metrics (backlog, service level, own articles) directly from database
 */
async function getMetrics(): Promise<Metrics> {
  try {
    const backlogSql = `
      SELECT COUNT(*) as count
      FROM articles
      WHERE classification IS NULL
        AND status = 'active'
        AND classification != 'OUTDATED' AND status != 'OUTDATED';
    `

    const serviceLevelSql = `
      SELECT
        COUNT(*) FILTER (
          WHERE classification_date - date_published <= INTERVAL '6 hours'
        ) * 100.0 / NULLIF(COUNT(*), 0) as service_level,
        COUNT(*) FILTER (
          WHERE classification_date IS NOT NULL
          AND date_published IS NOT NULL
        ) as total_classified
      FROM articles
      WHERE status != 'OUTDATED' AND classification != 'OUTDATED';
    `

    const ownArticlesSql = `
      SELECT COUNT(*) as count
      FROM articles
      WHERE (source IN ('imported', 'uploaded') OR source LIKE 'uploaded by %')
        AND classification != 'OUTDATED' AND status != 'OUTDATED';
    `

    const [backlogResult, serviceLevelResult, ownArticlesResult] = await Promise.all([
      query(backlogSql),
      query(serviceLevelSql),
      query(ownArticlesSql)
    ])

    return {
      backlog: parseInt(backlogResult.rows[0].count) || 0,
      serviceLevel: parseFloat(serviceLevelResult.rows[0].service_level) || 0,
      ownArticles: parseInt(ownArticlesResult.rows[0].count) || 0,
    }
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
