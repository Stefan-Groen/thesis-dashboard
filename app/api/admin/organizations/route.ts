/**
 * API Route: /api/admin/organizations
 *
 * GET: Fetch all organizations
 * POST: Create new organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { query } from '@/lib/db'

// GET: Fetch all organizations
export async function GET() {
  try {
    const session = await auth()

    // Verify admin access
    if (!session?.user?.username || session.user.username !== 'stefan.groen') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const sql = `
      SELECT
        o.id,
        o.name,
        o.company_context,
        o.is_active,
        o.created_at,
        o.updated_at,
        COUNT(u.id) as user_count
      FROM organizations o
      LEFT JOIN users u ON o.id = u.organization_id
      GROUP BY o.id, o.name, o.company_context, o.is_active, o.created_at, o.updated_at
      ORDER BY o.created_at DESC;
    `

    const result = await query(sql)

    const organizations = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      companyContext: row.company_context,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userCount: parseInt(row.user_count) || 0,
    }))

    return NextResponse.json({ organizations })

  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

// POST: Create new organization
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Verify admin access
    if (!session?.user?.username || session.user.username !== 'stefan.groen') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { name, companyContext } = await request.json()

    // Validate required fields
    if (!name || !companyContext) {
      return NextResponse.json(
        { error: 'Name and company context are required' },
        { status: 400 }
      )
    }

    const sql = `
      INSERT INTO organizations (name, company_context)
      VALUES ($1, $2)
      RETURNING id, name, company_context, is_active, created_at, updated_at;
    `

    const result = await query(sql, [name.trim(), companyContext.trim()])
    const org = result.rows[0]

    return NextResponse.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        companyContext: org.company_context,
        isActive: org.is_active,
        createdAt: org.created_at,
        updatedAt: org.updated_at,
        userCount: 0,
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating organization:', error)

    // Check for unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'An organization with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}
