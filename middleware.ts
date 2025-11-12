/**
 * Middleware for Authentication
 *
 * This runs before every request and protects routes that require authentication.
 * Public routes (landing page, login) are accessible without auth.
 * All /dashboard routes require authentication.
 */

export { auth as middleware } from "@/auth"

/**
 * Matcher Configuration
 *
 * Specifies which routes this middleware should run on.
 * We protect /dashboard routes but allow public access to:
 * - Landing page (/)
 * - Login page (/login)
 * - API routes needed for auth
 */
export const config = {
  matcher: [
    /*
     * Match only /dashboard routes
     * This protects all dashboard pages while leaving the landing page and login open
     */
    '/dashboard/:path*',
  ],
}
