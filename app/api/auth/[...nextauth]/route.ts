/**
 * NextAuth API Route Handler
 *
 * This is a "catch-all" route that handles ALL authentication requests.
 * The [...nextauth] part means it catches:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/callback
 * - And more!
 *
 * Think of it as the "front desk" that routes all auth requests to NextAuth.
 *
 * In Next.js App Router, API routes export HTTP method handlers.
 * NextAuth gives us these handlers from our auth configuration.
 */

import { handlers } from "@/auth"

/**
 * Export handlers for GET and POST requests
 *
 * These handle:
 * - GET: Checking session status, OAuth callbacks
 * - POST: Login, logout, etc.
 *
 * NextAuth automatically knows which request is which!
 */
export const { GET, POST } = handlers
