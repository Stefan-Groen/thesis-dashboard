/**
 * API Route: DELETE /api/summaries/[id]
 *
 * Deletes a specific summary by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Summary ID is required' },
        { status: 400 }
      )
    }

    // Delete the summary
    const result = await query(
      'DELETE FROM summaries WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Summary deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting summary:', error)
    return NextResponse.json(
      { error: 'Failed to delete summary' },
      { status: 500 }
    )
  }
}
