/**
 * API Route: /api/admin/organizations/[id]/users
 *
 * GET: Fetch all users for an organization
 * POST: Create new user for an organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { query } from '@/lib/db'
import bcrypt from 'bcrypt'

// GET: Fetch all users for an organization
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
        id,
        username,
        full_name,
        email,
        is_active,
        created_at,
        last_login
      FROM users
      WHERE organization_id = $1
      ORDER BY created_at DESC;
    `

    const result = await query(sql, [id])

    const users = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      isActive: row.is_active,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    }))

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST: Create new user for an organization
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Creating user for organization ID:', id)
    const session = await auth()

    // Verify admin access
    if (!session?.user?.username || session.user.username !== 'stefan.groen') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { username, password, fullName, email } = await request.json()

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Validate username format
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, dots, and underscores' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        )
      }
    }

    // Verify organization exists
    console.log('Checking if organization exists with ID:', id)
    const orgCheck = await query('SELECT id FROM organizations WHERE id = $1', [id])
    console.log('Organization check result:', orgCheck.rows.length, 'rows found')
    if (orgCheck.rows.length === 0) {
      console.error('Organization not found for ID:', id)
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert user
    const sql = `
      INSERT INTO users (username, password_hash, full_name, email, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, full_name, email, is_active, created_at;
    `

    const result = await query(sql, [
      username,
      passwordHash,
      fullName || null,
      email || null,
      id
    ])

    const user = result.rows[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        isActive: user.is_active,
        createdAt: user.created_at,
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating user:', error)

    // Check for unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A user with this username already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
