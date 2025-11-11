/**
 * Today's Articles Page
 *
 * Displays all articles published today (based on date_published).
 */

import Link from "next/link"
import { IconArrowLeft, IconCalendarEvent } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { FilteredArticlesTable } from "@/components/filtered-articles-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/lib/types"
import { query } from "@/lib/db"

// Revalidate this page every 30 seconds
export const revalidate = 30

/**
 * Fetch articles published today directly from database
 */
async function getTodayArticles(): Promise<Article[]> {
  try {
    const sql = `
      SELECT
        id, title, link, summary, source, classification, explanation, reasoning,
        date_published, classification_date, status, starred
      FROM articles
      WHERE DATE(date_published) = CURRENT_DATE
      AND classification != 'OUTDATED' AND status != 'OUTDATED'
      ORDER BY date_published DESC
      LIMIT 1000;
    `

    const result = await query(sql)

    return result.rows.map((row) => ({
      ...row,
      date_published: row.date_published?.toISOString() || null,
      classification_date: row.classification_date?.toISOString() || null,
    }))
  } catch (error) {
    console.error('Error fetching today\'s articles:', error)
    return []
  }
}

export default async function TodayPage() {
  const articles = await getTodayArticles()

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
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                      <Link href="/dashboard">
                        <IconArrowLeft className="size-4" />
                      </Link>
                    </Button>
                    <div>
                      <h1 className="text-3xl font-bold flex items-center gap-2">
                        <IconCalendarEvent className="size-8 text-blue-600" />
                        Today's Articles
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Articles published today
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600 dark:text-blue-400 text-lg px-4 py-2">
                    {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
                  </Badge>
                </div>
              </div>

              {/* Filtered Table */}
              <div className="px-4 lg:px-6">
                <FilteredArticlesTable articles={articles} classification="All" />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
