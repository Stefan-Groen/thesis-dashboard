/**
 * API Route: /api/articles
 *
 * Returns a list of articles with their classifications FOR THE LOGGED-IN USER'S ORGANIZATION.
 * Supports pagination and filtering.
 *
 * MULTI-TENANT: This route now filters articles by the user's organization_id.
 * Users only see classifications for their own organization.
 *
 * Query parameters:
 * - limit: Number of articles per page (default: 50)
 * - offset: Number of articles to skip (default: 0)
 * - classification: Filter by classification type (optional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    // Get the logged-in user's session
    const session = await auth()

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get the user's organization ID
    const organizationId = session.user.organizationId

    if (!organizationId) {
      return NextResponse.json(
        { error: 'User is not associated with an organization' },
        { status: 403 }
      )
    }

    // Get query parameters from URL
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const classificationFilter = searchParams.get('classification')
    const starredFilter = searchParams.get('starred') === 'true'

    // Build SQL query - JOIN articles with article_classifications
    // This is the KEY multi-tenant change: we filter by organization_id!
    let sql = `
      SELECT
        a.id,
        a.title,
        a.link,
        a.summary,
        a.source,
        a.date_published,
        ac.classification,
        ac.explanation,
        ac.reasoning,
        ac.advice,
        ac.classification_date,
        ac.status,
        ac.starred,
        ac.criti_score,
        ac.criti_explanation,
        ac.criti_status,
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
      INNER JOIN article_classifications ac
        ON a.id = ac.article_id
      LEFT JOIN criticality_scores_detail csd
        ON ac.id = csd.article_classification_id
      WHERE ac.organization_id = $1
    `

    // Array to hold query parameters (prevents SQL injection!)
    const params: any[] = [organizationId]
    let paramIndex = 2

    // Always exclude OUTDATED articles
    sql += ` AND ac.classification != 'OUTDATED' AND ac.status != 'OUTDATED'`

    // Add starred filter if provided
    if (starredFilter) {
      sql += ` AND ac.starred = $${paramIndex}`
      params.push(true)
      paramIndex++
    }

    // Add classification filter if provided
    if (classificationFilter) {
      sql += ` AND ac.classification = $${paramIndex}`
      params.push(classificationFilter)
      paramIndex++
    }

    // Order by most recent first
    sql += ` ORDER BY a.date_published DESC NULLS LAST`

    // Add pagination
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    // Execute query
    const result = await query(sql, params)

    // Also get the total count for pagination
    let countSql = `
      SELECT COUNT(*) as total
      FROM articles a
      INNER JOIN article_classifications ac
        ON a.id = ac.article_id
      WHERE ac.organization_id = $1
        AND ac.classification != 'OUTDATED'
        AND ac.status != 'OUTDATED'
    `
    const countParams: any[] = [organizationId]
    let countParamIndex = 2

    if (starredFilter) {
      countSql += ` AND ac.starred = $${countParamIndex}`
      countParams.push(true)
      countParamIndex++
    }

    if (classificationFilter) {
      countSql += ` AND ac.classification = $${countParamIndex}`
      countParams.push(classificationFilter)
      countParamIndex++
    }

    const countResult = await query(countSql, countParams)
    const total = Number(countResult.rows[0].total)

    // Format dates to ISO strings (easier to work with in JavaScript)
    // Also structure the criticality detail fields into a nested object
    const articles = result.rows.map((article) => {
      const {
        correctness_factual_soundness,
        relevance_alignment,
        reasoning_transparency,
        practical_usefulness_actionability,
        clarity_communication_quality,
        safety_bias_appropriateness,
        correctness_factual_soundness_explanation,
        relevance_alignment_explanation,
        reasoning_transparency_explanation,
        practical_usefulness_actionability_explanation,
        clarity_communication_quality_explanation,
        safety_bias_appropriateness_explanation,
        ...baseArticle
      } = article

      return {
        ...baseArticle,
        date_published: article.date_published?.toISOString() || null,
        classification_date: article.classification_date?.toISOString() || null,
        criticality_detail:
          correctness_factual_soundness !== null &&
          correctness_factual_soundness !== undefined
            ? {
                correctness_factual_soundness,
                relevance_alignment,
                reasoning_transparency,
                practical_usefulness_actionability,
                clarity_communication_quality,
                safety_bias_appropriateness,
                correctness_factual_soundness_explanation,
                relevance_alignment_explanation,
                reasoning_transparency_explanation,
                practical_usefulness_actionability_explanation,
                clarity_communication_quality_explanation,
                safety_bias_appropriateness_explanation,
              }
            : null,
      }
    })

    // Return articles with pagination metadata
    return NextResponse.json({
      articles,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })

  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
