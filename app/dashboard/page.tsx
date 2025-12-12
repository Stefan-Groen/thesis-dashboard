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
import { Star, CalendarDays, KeyRound } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ActivityLineChart } from "@/components/activity-line-chart"
import { MetricCards } from "@/components/metric-cards"
import { UploadArticleDialog } from "@/components/upload-article-dialog"
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
import { NewSinceLastVisit } from "@/components/new-since-last-visit"
import { TotalInDatabase } from "@/components/total-in-database"
import { DashboardContent } from "@/components/dashboard-content"
import { CollapsibleSection } from "@/components/collapsible-section"

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
 * Fetch today's statistics directly from database
 * MULTI-TENANT: Filters by organization_id
 */
async function getTodayStats(): Promise<Stats> {
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
        COUNT(*) as articles_today,
        COUNT(*) FILTER (WHERE ac.starred = true) as starred
      FROM articles a
      LEFT JOIN article_classifications ac ON a.id = ac.article_id AND ac.organization_id = $1
      INNER JOIN organizations o ON o.id = $1
      WHERE DATE(a.date_published) = CURRENT_DATE
        AND (ac.status IS NULL OR ac.status != 'OUTDATED')
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
    console.error('Error fetching today stats:', error)
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
 * Fetch new articles since last dashboard visit
 * MULTI-TENANT: Filters by organization_id
 */
async function getNewSinceLastVisit(): Promise<{ threats: number, opportunities: number, neutral: number, unclassified: number }> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId || !session?.user?.id) {
      return { threats: 0, opportunities: 0, neutral: 0, unclassified: 0 }
    }

    // Get user's last dashboard visit timestamp
    const userResult = await query(
      `SELECT last_dashboard_visit FROM users WHERE id = $1`,
      [session.user.id]
    )

    const lastVisit = userResult.rows[0]?.last_dashboard_visit

    // If no last visit recorded, return zeros
    if (!lastVisit) {
      return { threats: 0, opportunities: 0, neutral: 0, unclassified: 0 }
    }

    // Count new articles by classification since last visit
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE ac.classification = 'Threat') as threats,
        COUNT(*) FILTER (WHERE ac.classification = 'Opportunity') as opportunities,
        COUNT(*) FILTER (WHERE ac.classification = 'Neutral') as neutral,
        COUNT(*) FILTER (WHERE ac.classification IS NULL OR ac.classification = '' OR ac.status = 'PENDING') as unclassified
      FROM articles a
      LEFT JOIN article_classifications ac ON a.id = ac.article_id AND ac.organization_id = $1
      INNER JOIN organizations o ON o.id = $1
      WHERE a.date_published >= $2
        AND a.date_published >= o.created_at
        AND (ac.status IS NULL OR ac.status != 'OUTDATED')
        AND (ac.classification IS NULL OR ac.classification != 'OUTDATED');
    `

    const result = await query(sql, [session.user.organizationId, lastVisit])
    const row = result.rows[0]

    return {
      threats: parseInt(row.threats) || 0,
      opportunities: parseInt(row.opportunities) || 0,
      neutral: parseInt(row.neutral) || 0,
      unclassified: parseInt(row.unclassified) || 0,
    }
  } catch (error) {
    console.error('Error fetching new articles since last visit:', error)
    return { threats: 0, opportunities: 0, neutral: 0, unclassified: 0 }
  }
}

/**
 * Update user's last dashboard visit timestamp
 */
async function updateLastDashboardVisit() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return
    }

    await query(
      `UPDATE users SET last_dashboard_visit = NOW() WHERE id = $1`,
      [session.user.id]
    )
  } catch (error) {
    console.error('Error updating last_dashboard_visit:', error)
  }
}

/**
 * Fetch organization creation date
 * MULTI-TENANT: Filters by organization_id
 */
async function getOrganizationCreatedAt(): Promise<Date> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return new Date()
    }

    const result = await query(
      `SELECT created_at FROM organizations WHERE id = $1`,
      [session.user.organizationId]
    )

    return result.rows[0]?.created_at || new Date()
  } catch (error) {
    console.error('Error fetching organization created_at:', error)
    return new Date()
  }
}

/**
 * Main Dashboard Page Component
 */
export default async function Page() {
  // Fetch new articles count BEFORE updating last visit timestamp
  const newSinceLastVisit = await getNewSinceLastVisit()

  // Update the user's last dashboard visit timestamp
  await updateLastDashboardVisit()

  // Fetch all data in parallel for better performance
  const [stats, todayStats, chartData, activityData, metrics, todayArticles, starredArticles, organizationCreatedAt] = await Promise.all([
    getStats(),
    getTodayStats(),
    getChartData(),
    getActivityData(),
    getMetrics(),
    getTodayArticles(),
    getStarredArticles(),
    getOrganizationCreatedAt(),
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
                {/* Section 1: Quick Overview */}
                <DashboardContent stats={stats} todayStats={todayStats} metrics={metrics} />

                {/* Section 2: Database Information */}
                <CollapsibleSection title="Database Information">
                  {/* Row 1: Activity chart (6 cols, 2 rows) + Total in Database (2 cols, 2 rows) */}
                  <div className="px-4 lg:px-6">
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-8">
                      {/* Activity Line Chart - 6 cols wide, 2 rows height */}
                      <div className="lg:col-span-6 lg:row-span-2">
                        <ActivityLineChart data={activityData} />
                      </div>

                      {/* Total in Database - 2 cols wide, 2 rows height */}
                      <div className="lg:col-span-2 lg:row-span-2">
                        <TotalInDatabase
                          threats={stats.threats}
                          opportunities={stats.opportunities}
                          neutral={stats.neutral}
                          unclassified={stats.unclassified}
                          organizationCreatedAt={organizationCreatedAt}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: 4 Cards - Starred, Today's, Own, Upload (2 cols each) */}
                  <div className="px-4 lg:px-6">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Starred Articles tile */}
                      <Link href="/dashboard/starred">
                        <Card className="cursor-pointer transition-all hover:bg-muted/50 pt-4 pb-4 h-full">
                          <CardHeader className="pb-0 pt-0">
                            <div className="flex items-center gap-2">
                              <Star className="size-5 text-yellow-600 dark:text-yellow-400" strokeWidth={2} fill="none" />
                              <CardTitle className="text-lg">Starred Articles</CardTitle>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Your saved articles</p>
                          </CardHeader>
                          <div className="pt-0 pb-0 px-6">
                            <span className="text-4xl font-bold tabular-nums">
                              {stats.starred.toLocaleString()}
                            </span>
                          </div>
                        </Card>
                      </Link>

                      {/* Today's Articles tile */}
                      <Link href="/dashboard/today">
                        <Card className="cursor-pointer transition-all hover:bg-muted/50 pt-4 pb-4 h-full">
                          <CardHeader className="pb-0 pt-0">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="size-5" style={{ color: "#F25857" }} />
                              <CardTitle className="text-lg">Today's Articles</CardTitle>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">All articles of today</p>
                          </CardHeader>
                          <div className="pt-0 pb-0 px-6">
                            <span className="text-4xl font-bold tabular-nums">
                              {stats.articlesToday.toLocaleString()}
                            </span>
                          </div>
                        </Card>
                      </Link>

                      {/* Own Articles tile */}
                      <Link href="/dashboard/user_uploaded">
                        <Card className="cursor-pointer transition-all hover:bg-muted/50 pt-4 pb-4 h-full">
                          <CardHeader className="pb-0 pt-0">
                            <div className="flex items-center gap-2">
                              <KeyRound className="size-5 text-green-600 dark:text-green-400" />
                              <CardTitle className="text-lg">Own Articles</CardTitle>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Articles added by you</p>
                          </CardHeader>
                          <div className="pt-0 pb-0 px-6">
                            <span className="text-4xl font-bold tabular-nums">
                              {metrics.ownArticles.toLocaleString()}
                            </span>
                          </div>
                        </Card>
                      </Link>

                      {/* Upload Article tile */}
                      <Link href="/dashboard/upload">
                        <Card className="cursor-pointer transition-all hover:bg-muted/50 pt-4 pb-4 h-full">
                          <CardHeader className="pb-0 pt-0">
                            <div className="flex items-center gap-2">
                              <IconUpload className="size-5 text-muted-foreground" />
                              <CardTitle className="text-lg">Upload Article</CardTitle>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Add your own article</p>
                          </CardHeader>
                          <div className="pt-0 pb-0 px-6">
                            <span className="text-4xl font-bold tabular-nums">
                              +
                            </span>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  </div>

                  {/* Row 3: Classification Trends Chart (full width) */}
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive data={chartData} />
                  </div>
                </CollapsibleSection>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
