/**
 * API Route: /api/articles/ratings
 *
 * Handles article classification ratings and reviews from users
 *
 * GET - Retrieve user's existing rating for an article
 * POST - Submit a rating and optional review for an article classification
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

    // Get article ID from query params
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const organizationId = session.user.organizationId

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'User or organization not found' },
        { status: 403 }
      )
    }

    // Get existing rating
    const sql = `
      SELECT id, rating, review, created_at, updated_at
      FROM article_ratings
      WHERE article_id = $1
        AND user_id = $2
        AND organization_id = $3;
    `

    const result = await query(sql, [articleId, userId, organizationId])

    if (result.rows.length === 0) {
      return NextResponse.json({ rating: null })
    }

    return NextResponse.json({
      rating: result.rows[0],
    })

  } catch (error) {
    console.error('Error fetching rating:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { articleId, rating, review } = body

    // Validate input
    if (!articleId || typeof articleId !== 'number') {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      )
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 10' },
        { status: 400 }
      )
    }

    if (review && typeof review !== 'string') {
      return NextResponse.json(
        { error: 'Review must be a string' },
        { status: 400 }
      )
    }

    // Get the user ID from the session
    const userId = session.user.id
    const organizationId = session.user.organizationId

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'User or organization not found' },
        { status: 403 }
      )
    }

    // Insert or update rating in database
    // If user has already rated this article, update the rating
    const sql = `
      INSERT INTO article_ratings (
        article_id,
        user_id,
        organization_id,
        rating,
        review,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (article_id, user_id, organization_id)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        review = EXCLUDED.review,
        updated_at = NOW()
      RETURNING id, rating, review, created_at, updated_at;
    `

    const result = await query(sql, [
      articleId,
      userId,
      organizationId,
      rating,
      review,
    ])

    if (result.rows.length === 0) {
      throw new Error('Failed to save rating')
    }

    return NextResponse.json({
      success: true,
      rating: result.rows[0],
    })

  } catch (error) {
    console.error('Error saving rating:', error)
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    )
  }
}
