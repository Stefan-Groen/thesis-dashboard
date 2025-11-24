/**
 * API Route: /api/user/profile
 *
 * GET: Fetch current user's profile information
 * PUT: Update user's profile information (full_name, email, organization)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // MULTI-TENANT: Join with organizations table to get organization name
    const result = await query(
      `SELECT u.username, u.full_name, u.email, u.organization_id, o.name as organization_name
       FROM users u
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = result.rows[0]

    return NextResponse.json({
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      organizationId: user.organization_id,
      organizationName: user.organization_name,
    })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { fullName, email } = await request.json()

    // Validate required fields
    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // MULTI-TENANT: Update user profile (organization_id cannot be changed by users)
    await query(
      `UPDATE users
       SET full_name = $1,
           email = $2
       WHERE id = $3`,
      [fullName, email, session.user.id]
    )

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
