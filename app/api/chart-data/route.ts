/**
 * API Route: /api/chart-data
 *
 * Returns time-series data for the classification trend bar chart FOR THE USER'S ORGANIZATION.
 * Groups articles by publication date (when articles were published).
 * Returns only Threats and Opportunities (excludes Neutral).
 *
 * MULTI-TENANT: Filters chart data by organization_id
 *
 * Query parameters:
 * - days: Number of days to show (default: 7)
 * - interval: Grouping interval - 'day', 'week', or 'month' (default: 'day')
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7', 10)
    const interval = searchParams.get('interval') || 'day'

    // Validate interval parameter
    if (!['day', 'week', 'month'].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval. Must be day, week, or month.' },
        { status: 400 }
      )
    }

    // Determine the date truncation function based on interval
    const truncFunc = `date_trunc('${interval}', a.date_published AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Amsterdam')`

    // SQL query to get counts grouped by publication date
    // MULTI-TENANT: Join with article_classifications and filter by organization_id
    const sql = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days} days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      )
      SELECT
        TO_CHAR(ds.date, 'YYYY-MM-DD') as date,
        COALESCE(COUNT(*) FILTER (WHERE ac.classification = 'Threat'), 0) as threats,
        COALESCE(COUNT(*) FILTER (WHERE ac.classification = 'Opportunity'), 0) as opportunities
      FROM date_series ds
      LEFT JOIN articles a
        INNER JOIN article_classifications ac ON a.id = ac.article_id
        INNER JOIN organizations o ON o.id = $1
        ON ${truncFunc}::date = ds.date
        AND ac.organization_id = $1
        AND ac.classification IN ('Threat', 'Opportunity')
        AND ac.status != 'OUTDATED'
        AND a.date_published >= o.created_at
      GROUP BY ds.date
      ORDER BY ds.date ASC;
    `

    // Execute query with organization_id
    const result = await query(sql, [organizationId])

    // Format the data for the chart
    const chartData = result.rows.map((row) => ({
      date: row.date || '',
      threats: Number(row.threats),
      opportunities: Number(row.opportunities),
    }))

    return NextResponse.json(chartData)

  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}
