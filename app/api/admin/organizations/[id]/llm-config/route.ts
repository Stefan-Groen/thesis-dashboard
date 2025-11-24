/**
 * API Route: PUT /api/admin/organizations/[id]/llm-config
 *
 * Updates LLM configuration for an organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { query } from '@/lib/db'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth()

    // Verify admin access
    if (!session?.user?.username || session.user.username !== 'stefan.groen') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { systemPrompt, userPromptTemplate, maxTokens, temperature } = await request.json()

    // Validate inputs
    if (!systemPrompt || !systemPrompt.trim()) {
      return NextResponse.json(
        { error: 'System prompt is required' },
        { status: 400 }
      )
    }

    if (!maxTokens || maxTokens < 1 || maxTokens > 8000) {
      return NextResponse.json(
        { error: 'Max tokens must be between 1 and 8000' },
        { status: 400 }
      )
    }

    if (temperature === undefined || temperature === null || temperature < 0 || temperature > 2) {
      return NextResponse.json(
        { error: 'Temperature must be between 0 and 2' },
        { status: 400 }
      )
    }

    // Update the organization's LLM configuration
    const sql = `
      UPDATE organizations
      SET
        system_prompt = $1,
        user_prompt_template = $2,
        max_tokens = $3,
        temperature = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING id, name, system_prompt, user_prompt_template, max_tokens, temperature, updated_at;
    `

    const result = await query(sql, [
      systemPrompt.trim(),
      userPromptTemplate?.trim() || null,
      maxTokens,
      temperature,
      id
    ])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const org = result.rows[0]

    return NextResponse.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        systemPrompt: org.system_prompt,
        userPromptTemplate: org.user_prompt_template,
        maxTokens: org.max_tokens,
        temperature: parseFloat(org.temperature),
        updatedAt: org.updated_at
      }
    })

  } catch (error) {
    console.error('Error updating LLM configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update LLM configuration' },
      { status: 500 }
    )
  }
}
