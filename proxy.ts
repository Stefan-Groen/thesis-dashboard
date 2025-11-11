/**
 * Proxy - The Security Guard 🛡️
 *
 * This file runs BEFORE every request to your app (Next.js 16 renamed middleware to proxy).
 * It checks if the user is logged in and decides what to do.
 *
 * Think of it like a bouncer at a club:
 * - Has a ticket (session)? Come in!
 * - No ticket? Go to the entrance (login page)
 *
 * What is proxy/middleware?
 * In web apps, proxy is code that runs "in the middle" - between the request
 * coming in and the page being shown. It's perfect for authentication checks!
 *
 * Why do we need this?
 * Without proxy, anyone could just type "yoursite.com/dashboard" and see everything!
 * With proxy, we check: "Are you logged in? No? Back to login!"
 */

import { auth } from "@/auth"
import { NextResponse } from "next/server"

/**
 * Proxy function
 *
 * This function runs on EVERY request that matches the paths in the config below.
 *
 * How it works:
 * 1. Check if user has a valid session (logged in)
 * 2. If yes → Let them through
 * 3. If no → Redirect to login page
 *
 * The auth() function comes from our auth.ts file
 * It checks the session cookie and returns user info if valid
 */
export default auth((req) => {
  /**
   * Check authentication status
   *
   * req.auth contains the session data if user is logged in
   * If it's null/undefined, user is NOT logged in
   */
  const isAuthenticated = !!req.auth

  /**
   * Get the current URL path
   *
   * Examples:
   * - /dashboard → pathname is "/dashboard"
   * - /dashboard/threats → pathname is "/dashboard/threats"
   * - /login → pathname is "/login"
   */
  const { pathname } = req.nextUrl

  /**
   * Define public paths (don't need login)
   *
   * These pages anyone can see without logging in:
   * - /login - The login page itself
   * - /api/* - All API routes (they handle their own auth if needed)
   */
  const isPublicPath = pathname === "/login" || pathname.startsWith("/api")

  /**
   * Handle different scenarios
   */

  // Scenario 1: User is on a public path (login page or auth API)
  // → Let them through, no check needed
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Scenario 2: User is NOT logged in and trying to access protected page
  // → Redirect to login
  if (!isAuthenticated) {
    console.log(`🚫 Unauthorized access attempt to: ${pathname}`)
    console.log(`   Redirecting to login page...`)

    // Build the login URL with a "callbackUrl" parameter
    // This lets us redirect them back after they log in!
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)

    return NextResponse.redirect(loginUrl)
  }

  // Scenario 3: User IS logged in and on login page
  // → Redirect to dashboard (already logged in!)
  if (isAuthenticated && pathname === "/login") {
    console.log(`✅ Authenticated user on login page, redirecting to dashboard...`)
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Scenario 4: User IS logged in and accessing protected page
  // → Let them through! 🎉
  console.log(`✅ Authenticated request to: ${pathname}`)
  return NextResponse.next()
})

/**
 * Proxy Configuration
 *
 * This tells Next.js which routes this proxy should run on.
 *
 * The matcher uses pattern matching:
 * - "/dashboard/:path*" → /dashboard and ALL sub-paths
 * - "/api/:path*" → All API routes
 * - "/login" → The login page itself
 *
 * The negative patterns (!) exclude certain paths:
 * - /_next/* → Next.js internal files (don't check these)
 * - /static/* → Static assets like images
 * - /*.* → Files with extensions (like favicon.ico, robots.txt)
 *
 * Why exclude these?
 * - They're not pages, they're resources
 * - Checking auth on every image request would slow things down
 * - NextAuth's own API routes handle their own auth
 */
export const config = {
  matcher: [
    /**
     * Match all paths EXCEPT:
     * - API auth routes (NextAuth handles these)
     * - Static files (_next/static, images, etc.)
     * - Files with extensions (favicon.ico, robots.txt, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
