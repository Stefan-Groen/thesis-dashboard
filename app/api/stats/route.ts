/**
 * API Route: /api/stats
 *
 * Returns dashboard statistics FOR THE LOGGED-IN USER'S ORGANIZATION:
 * - Total number of articles
 * - Number of articles classified as "Threat"
 * - Number of articles classified as "Opportunity"
 * - Number of articles classified as "Neutral"
 *
 * MULTI-TENANT: Filters statistics by organization_id
 */

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/auth'

/**
 * GET /api/stats
 * Returns statistics for the logged-in user's organization only
 * Supports optional date parameter for filtering by specific date
 */
export async function GET(request: Request) {
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

    // Get date parameter from URL if provided
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    // Build SQL query with optional date filter
    let sql: string
    let params: any[]

    if (dateParam) {
      // Filter by specific date
      sql = `
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE ac.classification = 'Threat') as threats,
          COUNT(*) FILTER (WHERE ac.classification = 'Opportunity') as opportunities,
          COUNT(*) FILTER (WHERE ac.classification = 'Neutral') as neutral,
          COUNT(*) FILTER (WHERE ac.classification IN ('Error: Unknown', '')) as unclassified,
          COUNT(*) FILTER (WHERE DATE(a.date_published) = CURRENT_DATE) as articles_today,
          COUNT(*) FILTER (WHERE ac.starred = true) as starred
        FROM articles a
        INNER JOIN article_classifications ac
          ON a.id = ac.article_id
        WHERE ac.organization_id = $1
          AND ac.classification != 'OUTDATED'
          AND ac.status != 'OUTDATED'
          AND DATE(a.date_published) = $2;
      `
      params = [organizationId, dateParam]
    } else {
      // Return all stats (no date filter)
      sql = `
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE ac.classification = 'Threat') as threats,
          COUNT(*) FILTER (WHERE ac.classification = 'Opportunity') as opportunities,
          COUNT(*) FILTER (WHERE ac.classification = 'Neutral') as neutral,
          COUNT(*) FILTER (WHERE ac.classification IN ('Error: Unknown', '')) as unclassified,
          COUNT(*) FILTER (WHERE DATE(a.date_published) = CURRENT_DATE) as articles_today,
          COUNT(*) FILTER (WHERE ac.starred = true) as starred
        FROM articles a
        INNER JOIN article_classifications ac
          ON a.id = ac.article_id
        WHERE ac.organization_id = $1
          AND ac.classification != 'OUTDATED'
          AND ac.status != 'OUTDATED';
      `
      params = [organizationId]
    }

    // Execute the query with parameters
    const result = await query(sql, params)

    // Get the first row (there's only one row with the counts)
    const stats = result.rows[0]

    // Convert BigInt to Number (PostgreSQL COUNT returns BigInt)
    const formattedStats = {
      total: Number(stats.total),
      threats: Number(stats.threats),
      opportunities: Number(stats.opportunities),
      neutral: Number(stats.neutral),
      unclassified: Number(stats.unclassified),
      articlesToday: Number(stats.articles_today),
      starred: Number(stats.starred),
    }

    return NextResponse.json(formattedStats)

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
