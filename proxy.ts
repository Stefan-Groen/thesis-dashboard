import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

export async function proxy(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await auth()

    // Check if user is logged in
    if (!session?.user?.username) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user is stefan.groen (super admin)
    if (session.user.username !== 'stefan.groen') {
      // Return 403 Forbidden
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }
  }

  // Check if the request is for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const session = await auth()

    // Check if user has a valid session with organizationId
    // If session is null (invalidated by auth.ts) or missing required data, redirect to login
    if (!session?.user?.username || !session?.user?.organizationId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}
