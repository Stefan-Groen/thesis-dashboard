/**
 * Dashboard Page
 *
 * This is a Next.js Server Component that fetches data from our API routes
 * and passes it to the client components.
 */

// Force dynamic rendering (don't statically generate at build time)
export const dynamic = 'force-dynamic'

import Link from "next/link"
import { IconUser, IconUpload, IconStarFilled, IconAlertCircle, IconCalendarEvent, IconNews } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ActivityLineChart } from "@/components/activity-line-chart"
import { MetricCards } from "@/components/metric-cards"
import { UploadArticleDialog } from "@/components/upload-article-dialog"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { DashboardMiniTable } from "@/components/dashboard-mini-table"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { Stats, ChartDataPoint, ActivityDataPoint, Metrics } from "@/lib/types"
import { query } from "@/lib/db"
import { auth } from "@/auth"

/**
 * Fetch dashboard statistics directly from database
 * MULTI-TENANT: Filters by organization_id
 */
async function getStats(): Promise<Stats> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { total: 0, threats: 0, opportunities: 0, neutral: 0, unclassified: 0, articlesToday: 0, starred: 0 }
    }

    const sql = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE ac.classification = 'Threat') as threats,
        COUNT(*) FILTER (WHERE ac.classification = 'Opportunity') as opportunities,
        COUNT(*) FILTER (WHERE ac.classification = 'Neutral') as neutral,
        COUNT(*) FILTER (WHERE ac.classification IS NULL OR ac.classification = '' OR ac.status = 'PENDING') as unclassified,
        COUNT(*) FILTER (WHERE DATE(a.date_published) = CURRENT_DATE) as articles_today,
        COUNT(*) FILTER (WHERE ac.starred = true) as starred
      FROM articles a
      LEFT JOIN article_classifications ac ON a.id = ac.article_id AND ac.organization_id = $1
      INNER JOIN organizations o ON o.id = $1
      WHERE (ac.status IS NULL OR ac.status != 'OUTDATED')
        AND (ac.classification IS NULL OR ac.classification != 'OUTDATED')
        AND a.date_published >= o.created_at;
    `

    const result = await query(sql, [session.user.organizationId])
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
 * MULTI-TENANT: Filters by organization_id
 */
async function getChartData(): Promise<ChartDataPoint[]> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return []
    }

    const sql = `
      SELECT
        TO_CHAR(a.date_published::date, 'YYYY-MM-DD') as date,
        COUNT(*) FILTER (WHERE ac.classification = 'Threat') as threats,
        COUNT(*) FILTER (WHERE ac.classification = 'Opportunity') as opportunities,
        COUNT(*) FILTER (WHERE ac.classification = 'Neutral') as neutral
      FROM articles a
      INNER JOIN article_classifications ac ON a.id = ac.article_id
      INNER JOIN organizations o ON o.id = $1
      WHERE a.date_published >= CURRENT_DATE - INTERVAL '90 days'
        AND a.date_published >= o.created_at
        AND ac.organization_id = $1
        AND ac.status != 'OUTDATED'
        AND ac.classification != 'OUTDATED'
      GROUP BY a.date_published::date
      ORDER BY a.date_published::date;
    `

    const result = await query(sql, [session.user.organizationId])

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
 * MULTI-TENANT: Shows all published articles vs classified articles for this organization
 */
async function getActivityData(): Promise<ActivityDataPoint[]> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return []
    }

    const sql = `
      WITH org_info AS (
        SELECT created_at FROM organizations WHERE id = $1
      ),
      date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '90 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      ),
      published_counts AS (
        SELECT
          a.date_published::date as date,
          COUNT(DISTINCT a.id) as count
        FROM articles a
        CROSS JOIN org_info o
        WHERE
          a.date_published >= CURRENT_DATE - INTERVAL '90 days'
          AND a.date_published >= o.created_at
          AND a.date_published IS NOT NULL
        GROUP BY a.date_published::date
      ),
      classified_counts AS (
        SELECT
          ac.classification_date::date as date,
          COUNT(*) as count
        FROM article_classifications ac
        WHERE
          ac.organization_id = $1
          AND ac.classification_date >= CURRENT_DATE - INTERVAL '90 days'
          AND ac.classification_date IS NOT NULL
          AND ac.classification != 'OUTDATED'
          AND ac.status != 'OUTDATED'
        GROUP BY ac.classification_date::date
      )
      SELECT
        TO_CHAR(ds.date, 'YYYY-MM-DD') as date,
        COALESCE(pc.count, 0) as published,
        COALESCE(cc.count, 0) as classified
      FROM date_series ds
      LEFT JOIN published_counts pc ON ds.date = pc.date
      LEFT JOIN classified_counts cc ON ds.date = cc.date
      ORDER BY ds.date ASC;
    `

    const result = await query(sql, [session.user.organizationId])

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
 * Fetch today's articles (limited to 3 for dashboard preview)
 * MULTI-TENANT: Filters by organization_id
 */
async function getTodayArticles(): Promise<any[]> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return []
    }

    const sql = `
      SELECT
        a.id, a.title, a.link,
        ac.classification
      FROM articles a
      INNER JOIN organizations o ON o.id = $1
      LEFT JOIN article_classifications ac ON a.id = ac.article_id AND ac.organization_id = $1
      WHERE DATE(a.date_published) = CURRENT_DATE
        AND (ac.classification IS NULL OR ac.classification != 'OUTDATED')
        AND (ac.status IS NULL OR ac.status != 'OUTDATED')
        AND a.date_published >= o.created_at
      ORDER BY a.date_published DESC
      LIMIT 3;
    `

    const result = await query(sql, [session.user.organizationId])
    return result.rows
  } catch (error) {
    console.error('Error fetching today\'s articles:', error)
    return []
  }
}

/**
 * Fetch starred articles (limited to 3 for dashboard preview)
 * MULTI-TENANT: Filters by organization_id
 */
async function getStarredArticles(): Promise<any[]> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return []
    }

    const sql = `
      SELECT
        a.id, a.title, a.link,
        ac.classification
      FROM articles a
      INNER JOIN organizations o ON o.id = $1
      INNER JOIN article_classifications ac ON a.id = ac.article_id
      WHERE ac.organization_id = $1
        AND ac.starred = true
        AND ac.status != 'OUTDATED'
        AND ac.classification != 'OUTDATED'
        AND a.date_published >= o.created_at
      ORDER BY a.date_published DESC
      LIMIT 3;
    `

    const result = await query(sql, [session.user.organizationId])
    return result.rows
  } catch (error) {
    console.error('Error fetching starred articles:', error)
    return []
  }
}

/**
 * Fetch metrics (backlog, service level, own articles) directly from database
 * MULTI-TENANT: Filters by organization_id
 */
async function getMetrics(): Promise<Metrics> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId || !session?.user?.id) {
      return { backlog: 0, serviceLevel: 0, ownArticles: 0, reviewedThreatsOpps: 0, newThreatsOpps: 0 }
    }

    const organizationId = session.user.organizationId
    const userId = session.user.id

    const backlogSql = `
      SELECT COUNT(*) as count
      FROM articles a
      LEFT JOIN article_classifications ac ON a.id = ac.article_id AND ac.organization_id = $1
      INNER JOIN organizations o ON o.id = $1
      WHERE a.date_published >= o.created_at
        AND (ac.id IS NULL OR ac.status = 'PENDING');
    `

    const serviceLevelSql = `
      SELECT
        COUNT(*) FILTER (
          WHERE ac.classification_date - a.date_published <= INTERVAL '6 hours'
        ) * 100.0 / NULLIF(COUNT(*), 0) as service_level,
        COUNT(*) FILTER (
          WHERE ac.classification_date IS NOT NULL
          AND a.date_published IS NOT NULL
        ) as total_classified
      FROM articles a
      INNER JOIN article_classifications ac ON a.id = ac.article_id
      INNER JOIN organizations o ON o.id = $1
      WHERE ac.organization_id = $1
        AND a.date_published >= o.created_at
        AND ac.status != 'OUTDATED'
        AND ac.classification != 'OUTDATED';
    `

    const ownArticlesSql = `
      SELECT COUNT(*) as count
      FROM articles a
      INNER JOIN article_classifications ac ON a.id = ac.article_id
      INNER JOIN organizations o ON o.id = $1
      WHERE ac.organization_id = $1
        AND a.date_published >= o.created_at
        AND (a.source IN ('imported', 'uploaded') OR a.source LIKE 'uploaded by %')
        AND ac.classification != 'OUTDATED'
        AND ac.status != 'OUTDATED';
    `

    const reviewedThreatsOppsSql = `
      SELECT COUNT(DISTINCT a.id) as count
      FROM articles a
      INNER JOIN article_classifications ac ON a.id = ac.article_id
      INNER JOIN article_ratings ar ON a.id = ar.article_id
      INNER JOIN organizations o ON o.id = $1
      WHERE ac.organization_id = $1
        AND ar.organization_id = $1
        AND ar.user_id = $2
        AND a.date_published >= o.created_at
        AND ac.classification IN ('Threat', 'Opportunity')
        AND ac.status = 'CLASSIFIED';
    `

    const newThreatsOppsSql = `
      SELECT COUNT(DISTINCT a.id) as count
      FROM articles a
      INNER JOIN article_classifications ac ON a.id = ac.article_id
      INNER JOIN organizations o ON o.id = $1
      LEFT JOIN article_ratings ar ON a.id = ar.article_id
        AND ar.organization_id = $1
        AND ar.user_id = $2
      WHERE ac.organization_id = $1
        AND a.date_published >= o.created_at
        AND ac.classification IN ('Threat', 'Opportunity')
        AND ac.status = 'CLASSIFIED'
        AND ar.id IS NULL;
    `

    const [backlogResult, serviceLevelResult, ownArticlesResult, reviewedResult, newResult] = await Promise.all([
      query(backlogSql, [organizationId]),
      query(serviceLevelSql, [organizationId]),
      query(ownArticlesSql, [organizationId]),
      query(reviewedThreatsOppsSql, [organizationId, userId]),
      query(newThreatsOppsSql, [organizationId, userId])
    ])

    return {
      backlog: parseInt(backlogResult.rows[0].count) || 0,
      serviceLevel: parseFloat(serviceLevelResult.rows[0].service_level) || 0,
      ownArticles: parseInt(ownArticlesResult.rows[0].count) || 0,
      reviewedThreatsOpps: parseInt(reviewedResult.rows[0].count) || 0,
      newThreatsOpps: parseInt(newResult.rows[0].count) || 0,
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return { backlog: 0, serviceLevel: 0, ownArticles: 0, reviewedThreatsOpps: 0, newThreatsOpps: 0 }
  }
}

/**
 * Main Dashboard Page Component
 */
export default async function Page() {
  // Fetch all data in parallel for better performance
  const [stats, chartData, activityData, metrics, todayArticles, starredArticles] = await Promise.all([
    getStats(),
    getChartData(),
    getActivityData(),
    getMetrics(),
    getTodayArticles(),
    getStarredArticles(),
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
            {/* Max-width container for better layout on large screens */}
            <div className="mx-auto w-full max-w-[1600px]">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Row 1: Threats, Opportunities, Neutral, Pending (4 tiles × 2 cols each) */}
                <SectionCards stats={stats} />

                {/* Row 2-3: Both graphs side by side (4 cols each, 2 rows height) */}
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

                {/* Row 3-4: Articles Added Today tile (2 cols) + Table (6 cols, 2 rows) */}
                <div className="px-4 lg:px-6">
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-8">
                    {/* Articles Added Today tile - 2 cols wide, 1 row height */}
                    <Link href="/dashboard/today" className="lg:col-span-2">
                      <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full overflow-hidden relative min-h-[140px]">
                        <div className="absolute top-4 left-4 z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <IconCalendarEvent className="size-5 text-primary" />
                            <Badge variant="outline" className="text-xs">
                              Today
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold mb-1">Articles Added Today</CardTitle>
                          <CardDescription className="text-xs">Published today</CardDescription>
                        </div>
                        <div className="absolute bottom-2 right-4 opacity-90">
                          <span className="text-7xl font-black tabular-nums text-foreground/20">
                            {stats.articlesToday.toLocaleString()}
                          </span>
                        </div>
                      </Card>
                    </Link>

                    {/* Articles Today Table - 6 cols wide, spans rows 3-4 */}
                    <div className="lg:col-span-6 lg:row-span-2">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="pb-3">
                          <CardTitle>New Articles of Today</CardTitle>
                          <CardDescription>Articles published today</CardDescription>
                        </CardHeader>
                        <div className="flex-1 px-4 pb-4 overflow-hidden">
                          <DashboardMiniTable
                            articles={todayArticles}
                            limit={5}
                            viewAllHref="/dashboard/today"
                          />
                        </div>
                      </Card>
                    </div>

                    {/* Total Articles tile - 2 cols wide, row 4 */}
                    <Link href="/dashboard/articles" className="lg:col-span-2">
                      <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full overflow-hidden relative min-h-[140px]">
                        <div className="absolute top-4 left-4 z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <IconNews className="size-5 text-primary" />
                            <Badge variant="outline" className="text-xs">
                              All Time
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold mb-1">Total Articles</CardTitle>
                          <CardDescription className="text-xs">All articles in database</CardDescription>
                        </div>
                        <div className="absolute bottom-2 right-4 opacity-90">
                          <span className="text-7xl font-black tabular-nums text-foreground/20">
                            {stats.total.toLocaleString()}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  </div>
                </div>

                {/* Row 5-6: Starred Articles table (4 cols, 2 rows) + Own Articles + Upload tiles (2 cols each) */}
                <div className="px-4 lg:px-6">
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-8">
                    {/* Starred Articles table - 4 cols wide, spans rows 5-6 */}
                    <div className="lg:col-span-4 lg:row-span-2">
                      <Card className="h-full flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <IconStarFilled className="size-5 text-yellow-600 dark:text-yellow-400" />
                            <CardTitle>Starred Articles</CardTitle>
                          </div>
                          <CardDescription>Your starred articles ({stats.starred})</CardDescription>
                        </CardHeader>
                        <div className="flex-1 px-4 pb-4 overflow-hidden">
                          <DashboardMiniTable
                            articles={starredArticles}
                            limit={5}
                            viewAllHref="/dashboard/starred"
                          />
                        </div>
                      </Card>
                    </div>

                    {/* Own Articles tile - 2 cols wide, row 5 */}
                    <Link href="/dashboard/user_uploaded" className="lg:col-span-2">
                      <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full overflow-hidden relative min-h-[140px]">
                        <div className="absolute top-4 left-4 z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <IconUser className="size-8 text-purple-600" />
                            <Badge variant="outline" className="text-xs">
                              Your Content
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold mb-1">Own Articles</CardTitle>
                          <CardDescription className="text-xs">Articles added by you</CardDescription>
                        </div>
                        <div className="absolute bottom-2 right-4 opacity-90">
                          <span className="text-7xl font-black tabular-nums text-foreground/20">
                            {metrics.ownArticles.toLocaleString()}
                          </span>
                        </div>
                      </Card>
                    </Link>

                    {/* Upload Article tile - 2 cols wide, row 5 */}
                    <Link href="/dashboard/upload" className="lg:col-span-2">
                      <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full overflow-hidden relative min-h-[140px] flex items-center justify-center">
                        <CardHeader className="flex flex-col items-center justify-center text-center">
                          <IconUpload className="size-12 text-muted-foreground mb-2" />
                          <CardTitle className="text-lg">Upload Article</CardTitle>
                          <CardDescription className="text-xs">Add your own article</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>

                    {/* Reviewed T/O tile - 2 cols wide, row 6 */}
                    <Link href="/dashboard/reviewed" className="lg:col-span-2">
                      <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full overflow-hidden relative min-h-[140px]">
                        <div className="absolute top-4 left-4 z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <IconStarFilled className="size-5 text-yellow-600 dark:text-yellow-400" />
                            <Badge variant="outline" className="text-xs text-yellow-600 dark:text-yellow-400">
                              Reviewed
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold mb-1">Reviewed T/O</CardTitle>
                          <CardDescription className="text-xs">Articles you have rated</CardDescription>
                        </div>
                        <div className="absolute bottom-2 right-4 opacity-90">
                          <span className="text-7xl font-black tabular-nums text-foreground/20">
                            {metrics.reviewedThreatsOpps.toLocaleString()}
                          </span>
                        </div>
                      </Card>
                    </Link>

                    {/* New T/O tile - 2 cols wide, row 6 */}
                    <Link href="/dashboard/new" className="lg:col-span-2">
                      <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full overflow-hidden relative min-h-[140px]">
                        <div className="absolute top-4 left-4 z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <IconAlertCircle className="size-5 text-orange-600 dark:text-orange-400" />
                            <Badge variant="outline" className="text-xs text-orange-600 dark:text-orange-400">
                              New
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold mb-1">New T/O</CardTitle>
                          <CardDescription className="text-xs">Awaiting your feedback</CardDescription>
                        </div>
                        <div className="absolute bottom-2 right-4 opacity-90">
                          <span className="text-7xl font-black tabular-nums text-foreground/20">
                            {metrics.newThreatsOpps.toLocaleString()}
                          </span>
                        </div>
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
