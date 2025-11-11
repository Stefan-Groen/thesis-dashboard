/**
 * API Route: /api/activity-data
 *
 * Returns time-series data showing articles published vs classified per day.
 *
 * Query parameters:
 * - days: Number of days to show (default: 7)
 *
 * Returns data format:
 * [
 *   { date: '2024-01-01', published: 10, classified: 8 },
 *   { date: '2024-01-02', published: 15, classified: 12 },
 *   ...
 * ]
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7', 10)

    // Use a date series to ensure all dates are included (even with 0 counts)
    // This ensures today's date always appears in the chart
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
          date_trunc('day', date_published AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Amsterdam')::date as date,
          COUNT(*) as count
        FROM articles
        WHERE
          date_published >= CURRENT_DATE - INTERVAL '${days} days'
          AND date_published IS NOT NULL
          AND classification != 'OUTDATED'
          AND status != 'OUTDATED'
        GROUP BY date_trunc('day', date_published AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Amsterdam')
      ),
      classified_counts AS (
        SELECT
          date_trunc('day', classification_date AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Amsterdam')::date as date,
          COUNT(*) as count
        FROM articles
        WHERE
          classification_date >= CURRENT_DATE - INTERVAL '${days} days'
          AND classification_date IS NOT NULL
          AND classification != 'OUTDATED'
          AND status != 'OUTDATED'
        GROUP BY date_trunc('day', classification_date AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Amsterdam')
      )
      SELECT
        ds.date,
        COALESCE(pc.count, 0) as published,
        COALESCE(cc.count, 0) as classified
      FROM date_series ds
      LEFT JOIN published_counts pc ON ds.date = pc.date
      LEFT JOIN classified_counts cc ON ds.date = cc.date
      ORDER BY ds.date ASC;
    `

    const result = await query(sql)

    // Format the data for the chart
    const activityData = result.rows.map((row) => ({
      date: row.date?.toISOString().split('T')[0] || '',
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
