/**
 * User Uploaded Page
 *
 * Displays all articles uploaded by the user (source: imported or uploaded).
 */

import Link from "next/link"
import { IconArrowLeft, IconUser } from "@tabler/icons-react"
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
 * Fetch user-uploaded articles directly from database
 */
async function getUserUploadedArticles(): Promise<Article[]> {
  try {
    const sql = `
      SELECT
        id, title, link, summary, source, classification, explanation, reasoning,
        date_published, classification_date, status, starred
      FROM articles
      WHERE (source IN ('imported', 'uploaded') OR source LIKE 'uploaded by %')
      AND classification != 'OUTDATED' AND status != 'OUTDATED'
      ORDER BY date_added DESC
      LIMIT 1000;
    `

    const result = await query(sql)

    return result.rows.map((row) => ({
      ...row,
      date_published: row.date_published?.toISOString() || null,
      classification_date: row.classification_date?.toISOString() || null,
    }))
  } catch (error) {
    console.error('Error fetching user-uploaded articles:', error)
    return []
  }
}

export default async function UserUploadedPage() {
  const articles = await getUserUploadedArticles()

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
                        <IconUser className="size-8 text-purple-600" />
                        Your Uploaded Articles
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Articles you have added to the system
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-purple-600 dark:text-purple-400 text-lg px-4 py-2">
                    {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
                  </Badge>
                </div>
              </div>

              {/* Filtered Table */}
              <div className="px-4 lg:px-6">
                <FilteredArticlesTable articles={articles} classification="User Uploaded" />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
