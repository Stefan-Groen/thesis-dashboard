/**
 * API Route: /api/admin/organizations/[id]
 *
 * GET: Fetch single organization
 * PUT: Update organization
 * PATCH: Toggle is_active status
 * DELETE: Delete organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { query } from '@/lib/db'

// GET: Fetch single organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      WHERE o.id = $1
      GROUP BY o.id, o.name, o.company_context, o.is_active, o.created_at, o.updated_at;
    `

    const result = await query(sql, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const org = result.rows[0]

    return NextResponse.json({
      id: org.id,
      name: org.name,
      companyContext: org.company_context,
      isActive: org.is_active,
      createdAt: org.created_at,
      updatedAt: org.updated_at,
      userCount: parseInt(org.user_count) || 0,
    })

  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    )
  }
}

// PUT: Update organization
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      UPDATE organizations
      SET name = $1,
          company_context = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, company_context, is_active, created_at, updated_at;
    `

    const result = await query(sql, [name.trim(), companyContext.trim(), id])

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
        companyContext: org.company_context,
        isActive: org.is_active,
        createdAt: org.created_at,
        updatedAt: org.updated_at,
      }
    })

  } catch (error: any) {
    console.error('Error updating organization:', error)

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'An organization with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    )
  }
}

// PATCH: Toggle is_active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    // Verify admin access
    if (!session?.user?.username || session.user.username !== 'stefan.groen') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { isActive } = await request.json()

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      )
    }

    const sql = `
      UPDATE organizations
      SET is_active = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, company_context, is_active, created_at, updated_at;
    `

    const result = await query(sql, [isActive, id])

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
        companyContext: org.company_context,
        isActive: org.is_active,
        createdAt: org.created_at,
        updatedAt: org.updated_at,
      }
    })

  } catch (error) {
    console.error('Error toggling organization status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle organization status' },
      { status: 500 }
    )
  }
}

// DELETE: Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    // Verify admin access
    if (!session?.user?.username || session.user.username !== 'stefan.groen') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Check if organization has users
    const checkSql = `
      SELECT COUNT(*) as user_count
      FROM users
      WHERE organization_id = $1;
    `
    const checkResult = await query(checkSql, [id])
    const userCount = parseInt(checkResult.rows[0].user_count)

    if (userCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete organization with ${userCount} user(s). Please delete or reassign users first.` },
        { status: 409 }
      )
    }

    const sql = `
      DELETE FROM organizations
      WHERE id = $1
      RETURNING id, name;
    `

    const result = await query(sql, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Organization '${result.rows[0].name}' deleted successfully`
    })

  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    )
  }
}
