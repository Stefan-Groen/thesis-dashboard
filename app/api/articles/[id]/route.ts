/**
 * API Route: /api/articles/[id]
 *
 * DELETE - Delete an article classification for the user's organization
 *
 * MULTI-TENANT: In multi-tenant mode, we delete the classification, not the article itself
 * (since articles are shared across organizations)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { query } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.username) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
    const articleId = parseInt(id)

    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      )
    }

    // Check if the article was uploaded by this user's organization
    const checkSql = `
      SELECT a.id, a.source
      FROM articles a
      INNER JOIN article_classifications ac ON a.id = ac.article_id
      WHERE a.id = $1 AND ac.organization_id = $2
    `
    const checkResult = await query(checkSql, [articleId, organizationId])

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found or not accessible' },
        { status: 404 }
      )
    }

    const article = checkResult.rows[0]
    const expectedSource = `uploaded by ${session.user.username}`

    // Check if user is authorized to delete this article
    if (article.source !== expectedSource && article.source !== 'uploaded' && article.source !== 'imported') {
      return NextResponse.json(
        { error: 'You can only delete articles you uploaded' },
        { status: 403 }
      )
    }

    // MULTI-TENANT: Delete the classification for this organization
    // If this is a user-uploaded article, also delete the article itself
    const isUserUploaded = article.source === expectedSource ||
                          article.source === 'uploaded' ||
                          article.source === 'imported'

    if (isUserUploaded) {
      // Delete the entire article (and cascades to all classifications)
      const deleteSql = `
        DELETE FROM articles
        WHERE id = $1
        RETURNING id
      `
      const deleteResult = await query(deleteSql, [articleId])

      if (deleteResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Failed to delete article' },
          { status: 500 }
        )
      }
    } else {
      // Just mark the classification as OUTDATED for this organization
      const updateSql = `
        UPDATE article_classifications
        SET status = 'OUTDATED', classification = 'OUTDATED'
        WHERE article_id = $1 AND organization_id = $2
        RETURNING id
      `
      const updateResult = await query(updateSql, [articleId, organizationId])

      if (updateResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Failed to update classification' },
          { status: 500 }
        )
      }
    }

    // Revalidate relevant pages
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/user_uploaded')
    revalidatePath('/dashboard/articles')

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}
