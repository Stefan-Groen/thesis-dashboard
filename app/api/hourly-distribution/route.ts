/**
 * API Route: /api/hourly-distribution
 *
 * Returns hourly article distribution for a specific date
 * Shows how many articles (by classification) were published each hour
 *
 * MULTI-TENANT: Filters by organization_id
 */

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/auth'

export interface HourlyDistributionData {
  hour: number
  threats: number
  opportunities: number
  neutral: number
  unclassified: number
  total: number
}

/**
 * GET /api/hourly-distribution?date=YYYY-MM-DD
 * Returns hourly distribution for the specified date (defaults to today)
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

    // Get date parameter from URL (defaults to today)
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // First check if the date is valid (not in future, not before org creation)
    const orgResult = await query(
      `SELECT created_at FROM organizations WHERE id = $1`,
      [organizationId]
    )
    const orgCreatedAt = orgResult.rows[0]?.created_at
    const selectedDateObj = new Date(dateParam + 'T00:00:00Z')
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today

    const isFutureDate = selectedDateObj > today
    const orgCreatedDate = orgCreatedAt ? new Date(new Date(orgCreatedAt).toISOString().split('T')[0] + 'T00:00:00Z') : null
    const isBeforeOrgCreation = orgCreatedDate && selectedDateObj < orgCreatedDate

    // If invalid date, return empty data for all 24 hours with metadata
    if (isFutureDate || isBeforeOrgCreation) {
      const emptyHourlyData: HourlyDistributionData[] = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        threats: 0,
        opportunities: 0,
        neutral: 0,
        unclassified: 0,
        total: 0,
      }))

      return NextResponse.json({
        data: emptyHourlyData,
        meta: {
          isFutureDate,
          isBeforeOrgCreation,
          message: isFutureDate
            ? 'Selected date is in the future'
            : 'Selected date is before organization creation date'
        }
      })
    }

    // Query to get hourly distribution based on PUBLICATION TIME
    const sql = `
      WITH hours AS (
        SELECT generate_series(0, 23) AS hour
      ),
      articles_on_date AS (
        SELECT
          a.id,
          EXTRACT(HOUR FROM a.date_published AT TIME ZONE 'UTC')::integer as pub_hour
        FROM articles a
        INNER JOIN organizations o ON o.id = $1
        WHERE DATE(a.date_published) = $2
          AND a.date_published >= o.created_at
      )
      SELECT
        h.hour,
        COUNT(aod.id) FILTER (WHERE ac.classification = 'Threat') as threats,
        COUNT(aod.id) FILTER (WHERE ac.classification = 'Opportunity') as opportunities,
        COUNT(aod.id) FILTER (WHERE ac.classification = 'Neutral') as neutral,
        COUNT(aod.id) FILTER (WHERE ac.classification IS NULL OR ac.classification = '' OR ac.status = 'PENDING') as unclassified,
        COUNT(aod.id) as total
      FROM hours h
      LEFT JOIN articles_on_date aod ON h.hour = aod.pub_hour
      LEFT JOIN article_classifications ac ON
        aod.id = ac.article_id
        AND ac.organization_id = $1
        AND (ac.status IS NULL OR ac.status != 'OUTDATED')
        AND (ac.classification IS NULL OR ac.classification != 'OUTDATED')
      GROUP BY h.hour
      ORDER BY h.hour;
    `

    const result = await query(sql, [organizationId, dateParam])

    // Format the results - ensure all 24 hours are present
    const hourlyData: HourlyDistributionData[] = result.rows.map((row) => ({
      hour: parseInt(row.hour),
      threats: parseInt(row.threats) || 0,
      opportunities: parseInt(row.opportunities) || 0,
      neutral: parseInt(row.neutral) || 0,
      unclassified: parseInt(row.unclassified) || 0,
      total: parseInt(row.total) || 0,
    }))

    console.log(`[Hourly Distribution] Date: ${dateParam}, Rows: ${result.rows.length}, Total articles: ${hourlyData.reduce((sum, h) => sum + h.total, 0)}`)

    return NextResponse.json({
      data: hourlyData,
      meta: {
        isFutureDate: false,
        isBeforeOrgCreation: false,
        message: null
      }
    })

  } catch (error) {
    console.error('Error fetching hourly distribution:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hourly distribution' },
      { status: 500 }
    )
  }
}
