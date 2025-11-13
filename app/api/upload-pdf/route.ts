/**
 * API Route: /api/upload-pdf
 *
 * Handles PDF file uploads with text extraction.
 * Accepts multipart/form-data with a PDF file.
 * Extracts text from PDF and creates an article entry.
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.username) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const datePublished = formData.get('datePublished') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from PDF
    let pdfData
    try {
      // Use pdf-parse-fork which works in Node.js server environment
      const pdfParse = (await import('pdf-parse-fork')).default
      pdfData = await pdfParse(buffer)
    } catch (error) {
      console.error('Error parsing PDF:', error)
      return NextResponse.json(
        { error: 'Failed to parse PDF file' },
        { status: 400 }
      )
    }

    const extractedText = pdfData.text.trim()

    if (!extractedText || extractedText.length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from the PDF' },
        { status: 400 }
      )
    }

    // Use filename (without extension) as title
    const title = file.name.replace('.pdf', '').replace('.PDF', '')
    // Create unique link for each PDF upload using timestamp and filename
    const link = `pdf-upload-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const summary = extractedText
    const source = `uploaded by ${session.user.username}`

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
      VALUES ($1, $2, $3, $4, 'PENDING', COALESCE($5::timestamp, NOW()), NOW())
      RETURNING id, title;
    `

    const result = await query(sql, [
      title,
      link,
      summary,
      source,
      datePublished || null
    ])

    if (result.rows.length === 0) {
      throw new Error('Failed to insert article')
    }

    const article = result.rows[0]

    // Invalidate cache for all pages that show article data
    // This forces them to refetch fresh data on next request
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/articles')
    revalidatePath('/dashboard/user_uploaded')

    return NextResponse.json({
      success: true,
      message: 'PDF uploaded and processed successfully',
      article: {
        id: article.id,
        title: article.title,
        extractedTextLength: extractedText.length,
      },
    })

  } catch (error) {
    console.error('Error uploading PDF:', error)
    return NextResponse.json(
      { error: 'Failed to upload PDF' },
      { status: 500 }
    )
  }
}

// Next.js App Router handles large file uploads by default (up to 4.5MB body size)
// For files larger than that, consider using a cloud storage service with direct uploads
