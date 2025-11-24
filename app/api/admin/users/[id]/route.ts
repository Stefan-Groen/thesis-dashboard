/**
 * API Route: /api/admin/users/[id]
 *
 * DELETE: Delete a user
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { query } from '@/lib/db'

// DELETE: Delete user
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

    // Prevent deleting the admin user (stefan.groen)
    const checkSql = `SELECT username FROM users WHERE id = $1`
    const checkResult = await query(checkSql, [id])

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (checkResult.rows[0].username === 'stefan.groen') {
      return NextResponse.json(
        { error: 'Cannot delete the admin user' },
        { status: 403 }
      )
    }

    const sql = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, username;
    `

    const result = await query(sql, [id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User '${result.rows[0].username}' deleted successfully`
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
