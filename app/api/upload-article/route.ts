/**
 * API Route: /api/upload-article
 *
 * Handles user-uploaded articles.
 * POST request with JSON body:
 * {
 *   title: string (required)
 *   link: string (optional - defaults to 'not uploaded')
 *   summary: string (required - the article text)
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!body.summary || typeof body.summary !== 'string' || body.summary.trim() === '') {
      return NextResponse.json(
        { error: 'Article text is required' },
        { status: 400 }
      )
    }

    const title = body.title.trim()
    const link = body.link && body.link.trim() !== '' ? body.link.trim() : 'not uploaded'
    const summary = body.summary.trim()
    const source = 'uploaded'

    // Insert article into database
    const sql = `
      INSERT INTO articles (
        title,
        link,
        summary,
        source,
        status,
        date_published,
        date_added
      )
      VALUES ($1, $2, $3, $4, 'PENDING', NOW(), NOW())
      RETURNING id, title;
    `

    const result = await query(sql, [title, link, summary, source])

    if (result.rows.length === 0) {
      throw new Error('Failed to insert article')
    }

    const article = result.rows[0]

    return NextResponse.json({
      success: true,
      message: 'Article uploaded successfully',
      article: {
        id: article.id,
        title: article.title,
      },
    })

  } catch (error) {
    console.error('Error uploading article:', error)
    return NextResponse.json(
      { error: 'Failed to upload article' },
      { status: 500 }
    )
  }
}
