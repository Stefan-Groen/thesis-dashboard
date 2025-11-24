/**
 * API Route: DELETE /api/summaries/[id]
 *
 * Deletes a specific summary by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/auth'

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
    // Check authentication
    const session = await auth()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Summary ID is required' },
        { status: 400 }
      )
    }

    // Delete the summary (only if it belongs to the user's organization)
    const result = await query(
      'DELETE FROM summaries WHERE id = $1 AND organization_id = $2 RETURNING id',
      [id, session.user.organizationId]
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
