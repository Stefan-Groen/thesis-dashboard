/**
 * Article Detail Page
 *
 * Displays comprehensive information about a single article including:
 * - Title, published date, classification, criticality score
 * - Quick summary from article classification
 * - LLM explanation, reasoning, and advice
 * - Rating functionality
 * - PDF download and read full article options
 */

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { IconExternalLink, IconDownload, IconFileText } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { CriticalityScoreCircle } from "@/components/criticality-score-circle"
import { ArticleRatingSection } from "@/components/article-rating-section"
import { BackButton } from "@/components/back-button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Article } from "@/lib/types"
import { query } from "@/lib/db"
import { auth } from "@/auth"

/**
 * Fetch article details from database
 * MULTI-TENANT: Filters by organization_id
 */
async function getArticle(id: string): Promise<Article | null> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return null
    }

    const sql = `
      SELECT
        a.id, a.title, a.link, a.summary, a.source,
        ac.classification, ac.explanation, ac.reasoning, ac.advice, ac.summary as classification_summary,
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
      WHERE a.id = $2
        AND (ac.status IS NULL OR ac.status != 'OUTDATED')
        AND (ac.classification IS NULL OR ac.classification != 'OUTDATED')
        AND a.date_published >= o.created_at
      LIMIT 1;
    `

    const result = await query(sql, [session.user.organizationId, parseInt(id)])

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]

    return {
      id: row.id,
      title: row.title,
      link: row.link,
      summary: row.summary,
      source: row.source,
      classification: row.classification,
      explanation: row.explanation,
      reasoning: row.reasoning,
      advice: row.advice,
      classification_summary: row.classification_summary,
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
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

/**
 * Helper component to display classification badge
 */
function ClassificationBadge({ classification }: { classification: string | null }) {
  const config: Record<string, { className: string; label: string }> = {
    Threat: {
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      label: 'Threat',
    },
    Opportunity: {
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      label: 'Opportunity',
    },
    Neutral: {
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      label: 'Neutral',
    },
    'Error: Unknown': {
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      label: 'Error',
    },
    '': {
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      label: 'Pending',
    },
  }

  const { className, label } = config[classification || ''] || config['']

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Check authentication
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Await params
  const { id } = await params

  // Fetch article
  const article = await getArticle(id)

  if (!article) {
    notFound()
  }

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
                <div className="px-4 lg:px-6">
                  {/* Header with Back Button */}
                  <div className="flex items-center gap-4 mb-6">
                    <BackButton />
                    <div>
                      <h1 className="text-3xl font-bold">Article Details</h1>
                      <p className="text-muted-foreground mt-1">
                        Comprehensive view of article classification and analysis
                      </p>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="space-y-6">
                    {/* Title Card */}
                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Published: {article.date_published
                              ? new Date(article.date_published).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Unknown'}
                          </span>
                          <span>•</span>
                          <span>Source: {article.source || 'Unknown'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Summary Card */}
                    {article.classification_summary && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-sm font-semibold mb-3">Quick Summary</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {article.classification_summary}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Classification and Criticality Score Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Classification Card */}
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-sm font-semibold mb-3">Classification</h3>
                          <ClassificationBadge classification={article.classification} />
                        </CardContent>
                      </Card>

                      {/* Criticality Score Card */}
                      <Card>
                        <CardContent className="pt-6 flex flex-col items-center">
                          <h3 className="text-sm font-semibold mb-3">Criticality Score</h3>
                          <CriticalityScoreCircle
                            score={article.criti_score ?? null}
                            explanation={article.criti_explanation ?? null}
                            detail={article.criticality_detail ?? null}
                            articleTitle={article.title}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Advice Card */}
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-sm font-semibold mb-3">Advice</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {article.advice || 'No advice available'}
                        </p>
                      </CardContent>
                    </Card>

                    {/* LLM Explanation Card */}
                    {article.explanation && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-sm font-semibold mb-3">LLM Explanation</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {article.explanation}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* LLM Reasoning Card */}
                    {article.reasoning && (
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-sm font-semibold mb-3">LLM Reasoning</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {article.reasoning}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Rating Section */}
                    <ArticleRatingSection articleId={article.id} />

                    {/* Action Buttons */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" asChild>
                            <a href={`/api/articles/${article.id}/pdf`} download>
                              <IconDownload className="size-4 mr-2" />
                              Download PDF
                            </a>
                          </Button>

                          {article.link?.startsWith('pdf-upload-') ? (
                            <Button variant="outline" asChild>
                              <Link href={`/dashboard/article/${article.id}/pdf-text`}>
                                <IconFileText className="size-4 mr-2" />
                                View PDF Text
                              </Link>
                            </Button>
                          ) : (
                            <Button variant="outline" asChild>
                              <Link
                                href={article.link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconExternalLink className="size-4 mr-2" />
                                Read Full Article
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
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
