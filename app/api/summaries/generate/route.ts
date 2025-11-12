/**
 * API Route: POST /api/summaries/generate
 *
 * Generates an AI summary for a specific date's threats and opportunities
 * Fetches articles from that date, sends them to Chutes AI, and stores the result
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { SUMMARY_SYSTEM_PROMPT, getSummaryUserPrompt, SUMMARY_AI_CONFIG } from '@/lib/prompts/summary-prompt'

export async function POST(request: NextRequest) {
  try {
    const { date } = await request.json()

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    // Check for existing summaries and determine next version number
    const existingCheck = await query(
      `SELECT MAX(version) as max_version FROM summaries WHERE summary_date = $1`,
      [date]
    )

    const nextVersion = existingCheck.rows[0]?.max_version
      ? existingCheck.rows[0].max_version + 1
      : 1

    // Fetch threats and opportunities from the specified date
    const articlesResult = await query(
      `SELECT
        id,
        title,
        classification,
        explanation,
        reasoning,
        advice,
        date_published
      FROM articles
      WHERE DATE(date_published) = $1
        AND classification IN ('Threat', 'Opportunity')
        AND status = 'CLASSIFIED'
      ORDER BY classification, title`,
      [date]
    )

    const articles = articlesResult.rows

    if (articles.length === 0) {
      return NextResponse.json(
        { error: 'No classified threats or opportunities found for this date' },
        { status: 404 }
      )
    }

    // Prepare the prompt for Chutes AI
    const chutesApiKey = process.env.CHUTES_API_KEY
    if (!chutesApiKey) {
      return NextResponse.json(
        { error: 'CHUTES_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Build article summary text
    const articlesText = articles.map((article, index) => {
      return `
Article ${index + 1}: ${article.title}
Summary: ${article.summary || 'N/A'}
Classification: ${article.classification}
Explanation: ${article.explanation || 'N/A'}
Reasoning: ${article.reasoning || 'N/A'}
Advice: ${article.advice || 'N/A'}
---`
    }).join('\n\n')

    const prompt = {
      model: SUMMARY_AI_CONFIG.model,
      messages: [
        {
          role: "system",
          content: SUMMARY_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: getSummaryUserPrompt(articlesText, articles.length, date)
        }
      ],
      stream: SUMMARY_AI_CONFIG.stream,
      max_tokens: SUMMARY_AI_CONFIG.max_tokens,
      temperature: SUMMARY_AI_CONFIG.temperature
    }

    // Call Chutes AI API
    const chutesResponse = await fetch('https://llm.chutes.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${chutesApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prompt)
    })

    if (!chutesResponse.ok) {
      const errorText = await chutesResponse.text()
      console.error('Chutes AI API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate summary from AI' },
        { status: 500 }
      )
    }

    const chutesData = await chutesResponse.json()
    const summaryContent = chutesData.choices[0]?.message?.content

    if (!summaryContent) {
      return NextResponse.json(
        { error: 'No summary content received from AI' },
        { status: 500 }
      )
    }

    console.log('Generated summary content:', summaryContent.substring(0, 200) + '...')

    // Store the summary in the database with version number
    const insertResult = await query(
      `INSERT INTO summaries (summary_date, version, content, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, summary_date, version, content, created_at`,
      [date, nextVersion, summaryContent]
    )

    const savedSummary = insertResult.rows[0]

    console.log('Input date:', date)
    console.log('DB returned date:', savedSummary.summary_date)
    console.log('DB date type:', typeof savedSummary.summary_date)

    // Just use the input date since we know it's correct
    // PostgreSQL DATE type should preserve the date we sent
    return NextResponse.json({
      success: true,
      summary: {
        id: savedSummary.id,
        date: date, // Use the input date directly
        version: savedSummary.version,
        content: savedSummary.content,
        createdAt: savedSummary.created_at,
        articleCount: articles.length
      }
    })

  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
