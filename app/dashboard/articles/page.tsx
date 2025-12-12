/**
 * All Articles Page
 *
 * Displays all articles in the database.
 * Uses Server Components to fetch data from the API.
 */

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { IconArrowLeft, IconNews } from "@tabler/icons-react"
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
import { auth } from "@/auth"

/**
 * Fetch all articles directly from the database
 * MULTI-TENANT: Filters by organization_id
 */
async function getAllArticles(): Promise<Article[]> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return []
    }

    const sql = `
      SELECT
        a.id, a.title, a.link, a.summary, a.source,
        ac.classification, ac.explanation, ac.reasoning, ac.advice,
        a.date_published, ac.classification_date, ac.status, ac.starred,
        ac.criti_score, ac.criti_explanation, ac.criti_status,
        csd.correctness_factual_soundness,
        csd.relevance_alignment,
        csd.reasoning_transparency,
        csd.practical_usefulness_actionability,
        csd.clarity_communication_quality,
        csd.safety_bias_appropriateness,
        csd.correctness_factual_soundness_explanation,
        csd.relevance_alignment_explanation,
        csd.reasoning_transparency_explanation,
        csd.practical_usefulness_actionability_explanation,
        csd.clarity_communication_quality_explanation,
        csd.safety_bias_appropriateness_explanation
      FROM articles a
      LEFT JOIN article_classifications ac ON a.id = ac.article_id AND ac.organization_id = $1
      LEFT JOIN criticality_scores_detail csd ON ac.id = csd.article_classification_id
      INNER JOIN organizations o ON o.id = $1
      WHERE (ac.status IS NULL OR ac.status != 'OUTDATED')
        AND (ac.classification IS NULL OR ac.classification != 'OUTDATED')
        AND a.date_published >= o.created_at
      ORDER BY a.date_added DESC
      LIMIT 10000;
    `

    const result = await query(sql, [session.user.organizationId])

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
      classification_summary: row.classification_summary || null,
      date_published: row.date_published,
      classification_date: row.classification_date,
      status: row.status,
      starred: row.starred,
      criti_score: row.criti_score,
      criti_explanation: row.criti_explanation,
      criti_status: row.criti_status,
      criticality_detail:
        row.correctness_factual_soundness !== null &&
        row.correctness_factual_soundness !== undefined
          ? {
              correctness_factual_soundness: row.correctness_factual_soundness,
              relevance_alignment: row.relevance_alignment,
              reasoning_transparency: row.reasoning_transparency,
              practical_usefulness_actionability: row.practical_usefulness_actionability,
              clarity_communication_quality: row.clarity_communication_quality,
              safety_bias_appropriateness: row.safety_bias_appropriateness,
              correctness_factual_soundness_explanation: row.correctness_factual_soundness_explanation,
              relevance_alignment_explanation: row.relevance_alignment_explanation,
              reasoning_transparency_explanation: row.reasoning_transparency_explanation,
              practical_usefulness_actionability_explanation: row.practical_usefulness_actionability_explanation,
              clarity_communication_quality_explanation: row.clarity_communication_quality_explanation,
              safety_bias_appropriateness_explanation: row.safety_bias_appropriateness_explanation,
            }
          : null,
    }))
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export default async function ArticlesPage() {
  const articles = await getAllArticles()

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
                        <IconNews className="size-8 text-blue-600" />
                        All Articles
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Complete list of all articles in the database
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
