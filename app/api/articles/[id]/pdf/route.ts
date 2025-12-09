/**
 * API Route: Download Article as PDF
 *
 * Generates and downloads a PDF containing article details
 */

import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { auth } from '@/auth'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Await params
    const { id } = await params

    // Fetch article from database
    const sql = `
      SELECT
        a.id, a.title, a.link, a.summary, a.source,
        ac.classification, ac.explanation, ac.reasoning, ac.advice,
        a.date_published
      FROM articles a
      LEFT JOIN article_classifications ac ON a.id = ac.article_id AND ac.organization_id = $1
      INNER JOIN organizations o ON o.id = $1
      WHERE a.id = $2
        AND (ac.status IS NULL OR ac.status != 'OUTDATED')
        AND (ac.classification IS NULL OR ac.classification != 'OUTDATED')
        AND a.date_published >= o.created_at
      LIMIT 1;
    `

    const result = await query(sql, [session.user.organizationId, parseInt(id)])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    const article = result.rows[0]

    // Create PDF
    const doc = new jsPDF()
    const margin = 15
    const maxWidth = 180
    const pageHeight = doc.internal.pageSize.height
    const bottomMargin = 20
    let yPosition = 20

    // Helper to check page overflow
    const checkPageOverflow = (estimatedHeight: number) => {
      if (yPosition + estimatedHeight > pageHeight - bottomMargin) {
        doc.addPage()
        yPosition = 20
      }
    }

    // Helper to add text with wrapping
    const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, maxWidth)
      const lineHeight = fontSize * 0.5

      for (let i = 0; i < lines.length; i++) {
        checkPageOverflow(lineHeight + 5)
        doc.text(lines[i], margin, yPosition)
        yPosition += lineHeight
      }

      yPosition += 5
    }

    // Add content
    addText(article.title, 16, true)

    const publishedDate = article.date_published
      ? new Date(article.date_published).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Unknown'
    addText(`Published: ${publishedDate}`, 10)
    yPosition += 5

    addText('Classification', 12, true)
    addText(article.classification || 'Unknown', 11)
    yPosition += 5

    addText('Advice', 12, true)
    addText(article.advice || 'No advice available', 11)
    yPosition += 5

    if (article.explanation) {
      addText('LLM Explanation', 12, true)
      addText(article.explanation, 11)
      yPosition += 5
    }

    if (article.reasoning) {
      addText('LLM Reasoning', 12, true)
      addText(article.reasoning, 11)
      yPosition += 5
    }

    checkPageOverflow(15)
    addText(`Source: ${article.source || 'Unknown'}`, 10)

    checkPageOverflow(15)
    addText(`Link: ${article.link}`, 9)

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Generate filename
    const filename = `${article.title.substring(0, 50).replace(/[^a-z0-9]/gi, '_')}.pdf`

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
