/**
 * API Route: /api/articles/[id]/star
 *
 * Toggles the starred status of an article FOR THE USER'S ORGANIZATION.
 *
 * MULTI-TENANT: Updates starred status in article_classifications table
 * Only allows starring articles that belong to the user's organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'
import { auth } from '@/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Validate that the ID is a valid number
    const articleId = parseInt(id, 10)
    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      )
    }

    // MULTI-TENANT: Toggle starred in article_classifications for this organization
    const sql = `
      UPDATE article_classifications
      SET starred = NOT starred
      WHERE article_id = $1 AND organization_id = $2
      RETURNING starred
    `

    const result = await query(sql, [articleId, organizationId])

    // Check if classification exists for this organization
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found or not accessible' },
        { status: 404 }
      )
    }

    // Invalidate cache for all pages that show article data
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/starred')
    revalidatePath('/dashboard/articles')
    revalidatePath('/dashboard/threats')
    revalidatePath('/dashboard/opportunities')
    revalidatePath('/dashboard/neutral')
    revalidatePath('/dashboard/today')
    revalidatePath('/dashboard/backlog')
    revalidatePath('/dashboard/user_uploaded')

    // Return the new starred status
    return NextResponse.json({
      starred: result.rows[0].starred
    })

  } catch (error) {
    console.error('Error toggling starred status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle starred status' },
      { status: 500 }
    )
  }
}
