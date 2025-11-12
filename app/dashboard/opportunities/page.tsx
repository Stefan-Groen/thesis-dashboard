/**
 * Opportunities Page
 *
 * Displays all articles classified as opportunities.
 * Uses Server Components to fetch data from the API.
 */

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { IconArrowLeft, IconSparkles } from "@tabler/icons-react"
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

/**
 * Fetch opportunity articles directly from the database
 */
async function getOpportunityArticles(): Promise<Article[]> {
  try {
    const sql = `
      SELECT
        id, title, link, summary, source, classification, explanation, reasoning, advice,
        date_published, classification_date, status, starred
      FROM articles
      WHERE classification = 'Opportunity' AND status != 'OUTDATED'
      ORDER BY date_published DESC
      LIMIT 1000;
    `

    const result = await query(sql)

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      link: row.link,
      summary: row.summary,
      source: row.source,
      classification: row.classification,
      explanation: row.explanation,
      reasoning: row.reasoning,
      advice: row.advice,
      date_published: row.date_published,
      classification_date: row.classification_date,
      status: row.status,
      starred: row.starred,
    }))
  } catch (error) {
    console.error('Error fetching opportunity articles:', error)
    return []
  }
}

export default async function OpportunitiesPage() {
  const articles = await getOpportunityArticles()

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
                        <IconSparkles className="size-8 text-green-600" />
                        Opportunity Articles
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Articles classified as opportunities for growth
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 text-lg px-4 py-2">
                    {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
                  </Badge>
                </div>
              </div>

              {/* Filtered Table */}
              <div className="px-4 lg:px-6">
                <FilteredArticlesTable articles={articles} classification="Opportunity" />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
