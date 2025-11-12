/**
 * API Route: GET /api/summaries
 *
 * Fetches all existing summaries or a specific summary by date
 * Query parameters:
 * - date: specific date to fetch (optional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Helper function to format dates safely
const formatDate = (dateValue: any): string => {
  if (!dateValue) return ''
  if (typeof dateValue === 'string') {
    // If it's already a string, check if it's in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
      return dateValue.split('T')[0] // Remove time if present
    }
    return dateValue
  }
  if (dateValue instanceof Date) {
    // Use local date methods to match the input format
    const year = dateValue.getFullYear()
    const month = String(dateValue.getMonth() + 1).padStart(2, '0')
    const day = String(dateValue.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  return String(dateValue)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (date) {
      // Fetch specific summary by date (latest version only)
      // Cast date to text to avoid timezone issues
      const result = await query(
        `SELECT id, summary_date::text as summary_date, version, content, created_at, updated_at
         FROM summaries
         WHERE summary_date = $1
         ORDER BY version DESC
         LIMIT 1`,
        [date]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Summary not found for this date' },
          { status: 404 }
        )
      }

      const summary = result.rows[0]
      console.log('Fetched single summary - Raw date:', summary.summary_date, 'Type:', typeof summary.summary_date)
      return NextResponse.json({
        id: summary.id,
        date: summary.summary_date, // Already a string from ::text cast
        version: summary.version,
        content: summary.content,
        createdAt: summary.created_at,
        updatedAt: summary.updated_at
      })
    } else {
      // Fetch all summaries with all versions, most recent first
      // Cast date to text to avoid timezone issues
      const result = await query(
        `SELECT id, summary_date::text as summary_date, version, content, created_at, updated_at
         FROM summaries
         ORDER BY summary_date DESC, version DESC
         LIMIT 100`
      )

      const summaries = result.rows.map(row => {
        console.log('Raw DB date:', row.summary_date, 'Type:', typeof row.summary_date)
        return {
          id: row.id,
          date: row.summary_date, // Already a string from ::text cast
          version: row.version,
          content: row.content,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
      })

      return NextResponse.json({ summaries })
    }

  } catch (error) {
    console.error('Error fetching summaries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summaries' },
      { status: 500 }
    )
  }
}
