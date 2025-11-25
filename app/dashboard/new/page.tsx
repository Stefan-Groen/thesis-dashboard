/**
 * New Threats/Opportunities Page
 *
 * Displays threats and opportunities that the user has NOT yet rated/reviewed
 */

export const dynamic = 'force-dynamic'

import { query } from "@/lib/db"
import { auth } from "@/auth"
import type { Article } from "@/lib/types"
import { NewPageClient } from "./new-client"

/**
 * Fetch unreviewed articles for current user (all classifications)
 * MULTI-TENANT: Filters by organization_id and excludes user ratings
 */
async function getNewArticles(): Promise<Article[]> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId || !session?.user?.id) {
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
      INNER JOIN article_classifications ac ON a.id = ac.article_id
      INNER JOIN organizations o ON o.id = $1
      LEFT JOIN article_ratings ar ON a.id = ar.article_id
        AND ar.organization_id = $1
        AND ar.user_id = $2
      LEFT JOIN criticality_scores_detail csd ON ac.id = csd.article_classification_id
      WHERE ac.organization_id = $1
        AND a.date_published >= o.created_at
        AND ar.id IS NULL
      ORDER BY ac.classification_date DESC
      LIMIT 10000;
    `

    const result = await query(sql, [session.user.organizationId, session.user.id])

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
    console.error('Error fetching new articles:', error)
    return []
  }
}

export default async function NewPage() {
  const articles = await getNewArticles()

  return <NewPageClient articles={articles} />
}
