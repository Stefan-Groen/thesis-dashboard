/**
 * Backlog Page
 *
 * Displays all articles pending classification.
 */

import Link from "next/link"
import { IconArrowLeft, IconClock } from "@tabler/icons-react"
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

// Revalidate this page every 30 seconds
export const revalidate = 30

/**
 * Fetch backlog articles directly from database
 */
async function getBacklogArticles(): Promise<Article[]> {
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
      INNER JOIN organizations o ON o.id = $1
      LEFT JOIN article_classifications ac ON a.id = ac.article_id AND ac.organization_id = $1
      LEFT JOIN criticality_scores_detail csd ON ac.id = csd.article_classification_id
      WHERE (ac.classification IS NULL OR ac.classification = '' OR ac.status = 'PENDING')
        AND (ac.classification IS NULL OR ac.classification != 'OUTDATED')
        AND (ac.status IS NULL OR ac.status != 'OUTDATED')
        AND a.date_published >= o.created_at
      ORDER BY a.date_added DESC
      LIMIT 1000;
    `

    const result = await query(sql, [session.user.organizationId])

    return result.rows.map((row) => ({
      ...row,
      date_published: row.date_published?.toISOString() || null,
      classification_date: row.classification_date?.toISOString() || null,
      // Set classification to empty string for consistent typing
      classification: row.classification || '',
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
    console.error('Error fetching backlog articles:', error)
    return []
  }
}

export default async function BacklogPage() {
  const articles = await getBacklogArticles()

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
                        <IconClock className="size-8 text-orange-600" />
                        Backlog
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Articles pending classification
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 dark:text-orange-400 text-lg px-4 py-2">
                    {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
                  </Badge>
                </div>
              </div>

                {/* Filtered Table */}
                <div className="px-4 lg:px-6">
                  <FilteredArticlesTable articles={articles} classification="Backlog" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
