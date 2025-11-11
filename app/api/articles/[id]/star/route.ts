/**
 * API Route: /api/articles/[id]/star
 *
 * Toggles the starred status of an article.
 *
 * Methods:
 * - PATCH: Toggle starred status for the specified article
 *
 * Example usage:
 * - PATCH /api/articles/123/star
 *
 * Python Flask equivalent:
 * ```python
 * @app.route('/api/articles/<int:id>/star', methods=['PATCH'])
 * def toggle_star(id):
 *     cursor.execute(
 *         "UPDATE articles SET starred = NOT starred WHERE id = %s RETURNING starred",
 *         (id,)
 *     )
 *     result = cursor.fetchone()
 *     conn.commit()
 *     return jsonify({'starred': result['starred']})
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { query } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate that the ID is a valid number
    const articleId = parseInt(id, 10)
    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      )
    }

    // Toggle the starred status
    const sql = `
      UPDATE articles
      SET starred = NOT starred
      WHERE id = $1
      RETURNING starred
    `

    const result = await query(sql, [articleId])

    // Check if article exists
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Invalidate cache for all pages that show article data
    // This forces them to refetch fresh data on next request
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
