/**
 * API Route: POST /api/summaries/generate
 *
 * Generates an AI summary for a specific date's threats and opportunities
 * Fetches articles from that date, sends them to Chutes AI, and stores the result
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { auth } from '@/auth'
import { SUMMARY_SYSTEM_PROMPT, getSummaryUserPrompt, SUMMARY_AI_CONFIG } from '@/lib/prompts/summary-prompt'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { date } = await request.json()

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    // Check for existing summaries and determine next version number (for this org)
    const existingCheck = await query(
      `SELECT MAX(version) as max_version FROM summaries
       WHERE summary_date = $1 AND organization_id = $2`,
      [date, session.user.organizationId]
    )

    const nextVersion = existingCheck.rows[0]?.max_version
      ? existingCheck.rows[0].max_version + 1
      : 1

    // Fetch threats and opportunities from the specified date for this organization
    const articlesResult = await query(
      `SELECT
        a.id,
        a.title,
        a.summary,
        ac.classification,
        ac.explanation,
        ac.reasoning,
        ac.advice,
        ac.criti_score,
        a.date_published,
        csd.correctness_factual_soundness,
        csd.relevance_alignment,
        csd.reasoning_transparency,
        csd.practical_usefulness_actionability,
        csd.clarity_communication_quality,
        csd.safety_bias_appropriateness,
        csd.correctness_factual_soundness_explanation,
        csd.relevance_alignment_explanation,
        csd.reasoning_transparency_explanation,
        csd.practical_usefulness_actionability_explanation,
        csd.clarity_communication_quality_explanation,
        csd.safety_bias_appropriateness_explanation
      FROM articles a
      INNER JOIN article_classifications ac ON a.id = ac.article_id
      INNER JOIN organizations o ON o.id = $2
      LEFT JOIN criticality_scores_detail csd ON ac.id = csd.article_classification_id
      WHERE DATE(a.date_published) = $1
        AND ac.organization_id = $2
        AND ac.classification IN ('Threat', 'Opportunity')
        AND ac.status = 'CLASSIFIED'
        AND a.date_published >= o.created_at
      ORDER BY ac.classification, a.title`,
      [date, session.user.organizationId]
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
      let articleText = `
Article ${index + 1}: ${article.title}
Summary: ${article.summary || 'N/A'}
Classification: ${article.classification}
Explanation: ${article.explanation || 'N/A'}
Reasoning: ${article.reasoning || 'N/A'}
Advice: ${article.advice || 'N/A'}`

      // Add criticality score if available
      if (article.criti_score !== null && article.criti_score !== undefined) {
        articleText += `
Overall Criticality Score: ${article.criti_score}/100`
      }

      // Add criticality score details if available
      if (article.correctness_factual_soundness !== null && article.correctness_factual_soundness !== undefined) {
        articleText += `
Criticality Score Breakdown:
  - Correctness & Factual Soundness: ${article.correctness_factual_soundness}/100
    ${article.correctness_factual_soundness_explanation ? `Explanation: ${article.correctness_factual_soundness_explanation}` : ''}
  - Relevance & Alignment: ${article.relevance_alignment}/100
    ${article.relevance_alignment_explanation ? `Explanation: ${article.relevance_alignment_explanation}` : ''}
  - Reasoning Transparency: ${article.reasoning_transparency}/100
    ${article.reasoning_transparency_explanation ? `Explanation: ${article.reasoning_transparency_explanation}` : ''}
  - Practical Usefulness & Actionability: ${article.practical_usefulness_actionability}/100
    ${article.practical_usefulness_actionability_explanation ? `Explanation: ${article.practical_usefulness_actionability_explanation}` : ''}
  - Clarity & Communication Quality: ${article.clarity_communication_quality}/100
    ${article.clarity_communication_quality_explanation ? `Explanation: ${article.clarity_communication_quality_explanation}` : ''}
  - Safety, Bias & Appropriateness: ${article.safety_bias_appropriateness}/100
    ${article.safety_bias_appropriateness_explanation ? `Explanation: ${article.safety_bias_appropriateness_explanation}` : ''}`
      }

      articleText += '\n---'
      return articleText
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

    // Store the summary in the database with version number and organization_id
    const insertResult = await query(
      `INSERT INTO summaries (summary_date, version, content, organization_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, summary_date, version, content, created_at`,
      [date, nextVersion, summaryContent, session.user.organizationId]
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
