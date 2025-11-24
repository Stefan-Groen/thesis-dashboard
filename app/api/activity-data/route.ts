/**
 * API Route: /api/activity-data
 *
 * Returns time-series data showing articles published vs classified per day FOR THE USER'S ORGANIZATION.
 *
 * MULTI-TENANT: Filters activity data by organization_id
 *
 * Query parameters:
 * - days: Number of days to show (default: 7)
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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7', 10)

    // MULTI-TENANT: Updated query to use article_classifications
    // Note: "published" refers to ALL articles published (organization-agnostic)
    // "classified" refers to articles classified for THIS organization
    const sql = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days} days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      ),
      published_counts AS (
        SELECT
          date_trunc('day', a.date_published AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Amsterdam')::date as date,
          COUNT(DISTINCT a.id) as count
        FROM articles a
        INNER JOIN organizations o ON o.id = $1
        WHERE
          a.date_published >= CURRENT_DATE - INTERVAL '${days} days'
          AND a.date_published IS NOT NULL
          AND a.date_published >= o.created_at
        GROUP BY date_trunc('day', a.date_published AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Amsterdam')
      ),
      classified_counts AS (
        SELECT
          date_trunc('day', ac.classification_date AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Amsterdam')::date as date,
          COUNT(*) as count
        FROM article_classifications ac
        INNER JOIN articles a ON ac.article_id = a.id
        INNER JOIN organizations o ON o.id = $1
        WHERE
          ac.organization_id = $1
          AND ac.classification_date >= CURRENT_DATE - INTERVAL '${days} days'
          AND ac.classification_date IS NOT NULL
          AND ac.classification != 'OUTDATED'
          AND ac.status != 'OUTDATED'
          AND a.date_published >= o.created_at
        GROUP BY date_trunc('day', ac.classification_date AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Amsterdam')
      )
      SELECT
        TO_CHAR(ds.date, 'YYYY-MM-DD') as date,
        COALESCE(pc.count, 0) as published,
        COALESCE(cc.count, 0) as classified
      FROM date_series ds
      LEFT JOIN published_counts pc ON ds.date = pc.date
      LEFT JOIN classified_counts cc ON ds.date = cc.date
      ORDER BY ds.date ASC;
    `

    const result = await query(sql, [organizationId])

    // Format the data for the chart
    const activityData = result.rows.map((row) => ({
      date: row.date || '',
      published: Number(row.published),
      classified: Number(row.classified),
    }))

    return NextResponse.json(activityData)

  } catch (error) {
    console.error('Error fetching activity data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    )
  }
}
