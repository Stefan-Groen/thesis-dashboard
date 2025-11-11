/**
 * API Route: /api/articles
 *
 * Returns a list of articles with their classifications.
 * Supports pagination and filtering.
 *
 * Query parameters:
 * - limit: Number of articles per page (default: 50)
 * - offset: Number of articles to skip (default: 0)
 * - classification: Filter by classification type (optional)
 *
 * Example usage:
 * - /api/articles?limit=10&offset=0
 * - /api/articles?classification=Threat
 *
 * Python Flask equivalent:
 * ```python
 * @app.route('/api/articles')
 * def get_articles():
 *     limit = request.args.get('limit', 50)
 *     offset = request.args.get('offset', 0)
 *     cursor.execute("SELECT * FROM articles LIMIT %s OFFSET %s", (limit, offset))
 *     articles = cursor.fetchall()
 *     return jsonify(articles)
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from URL
    // In Python: request.args.get('limit')
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const classificationFilter = searchParams.get('classification')
    const starredFilter = searchParams.get('starred') === 'true'

    // Build SQL query dynamically based on filters
    let sql = `
      SELECT
        id,
        title,
        link,
        summary,
        source,
        classification,
        explanation,
        reasoning,
        date_published,
        classification_date,
        status,
        starred
      FROM articles
    `

    // Array to hold query parameters (prevents SQL injection!)
    const params: any[] = []
    let paramIndex = 1

    // Always exclude OUTDATED articles
    sql += ` WHERE classification != 'OUTDATED' AND status != 'OUTDATED'`

    // Add starred filter if provided
    if (starredFilter) {
      sql += ` AND starred = $${paramIndex}`
      params.push(true)
      paramIndex++
    }

    // Add classification filter if provided
    if (classificationFilter) {
      sql += ` AND classification = $${paramIndex}`
      params.push(classificationFilter)
      paramIndex++
    }

    // Order by most recent first
    sql += ` ORDER BY date_published DESC NULLS LAST`

    // Add pagination
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    // Execute query
    const result = await query(sql, params)

    // Also get the total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM articles WHERE classification != 'OUTDATED' AND status != 'OUTDATED'`
    const countParams: any[] = []
    let countParamIndex = 1

    if (starredFilter) {
      countSql += ` AND starred = $${countParamIndex}`
      countParams.push(true)
      countParamIndex++
    }

    if (classificationFilter) {
      countSql += ` AND classification = $${countParamIndex}`
      countParams.push(classificationFilter)
      countParamIndex++
    }

    const countResult = await query(countSql, countParams)
    const total = Number(countResult.rows[0].total)

    // Format dates to ISO strings (easier to work with in JavaScript)
    const articles = result.rows.map((article) => ({
      ...article,
      date_published: article.date_published?.toISOString() || null,
      classification_date: article.classification_date?.toISOString() || null,
    }))

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
