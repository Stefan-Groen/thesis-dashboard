/**
 * By Date Threats Page
 *
 * Displays threat articles published on a specific date
 * URL format: /dashboard/by-date-threats?date=YYYY-MM-DD
 */

export const dynamic = 'force-dynamic'

import { query } from "@/lib/db"
import { auth } from "@/auth"
import type { Article } from "@/lib/types"
import { ByDateThreatsClient } from "./by-date-threats-client"

/**
 * Fetch threat articles for a specific date
 * MULTI-TENANT: Filters by organization_id
 */
async function getThreatArticlesByDate(date: string): Promise<Article[]> {
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
      INNER JOIN article_classifications ac ON a.id = ac.article_id AND ac.organization_id = $1
      LEFT JOIN criticality_scores_detail csd ON ac.id = csd.article_classification_id
      WHERE DATE(a.date_published) = $2
        AND ac.classification = 'Threat'
        AND ac.status != 'OUTDATED'
        AND a.date_published >= o.created_at
      ORDER BY a.date_published DESC
      LIMIT 1000;
    `

    const result = await query(sql, [session.user.organizationId, date])

    return result.rows.map((row) => ({
      ...row,
      date_published: row.date_published?.toISOString() || null,
      classification_date: row.classification_date?.toISOString() || null,
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
    console.error('Error fetching threat articles by date:', error)
    return []
  }
}

interface PageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function ByDateThreatsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const date = params.date || new Date().toISOString().split('T')[0]
  const articles = await getThreatArticlesByDate(date)

  return <ByDateThreatsClient key={date} articles={articles} initialDate={date} />
}
