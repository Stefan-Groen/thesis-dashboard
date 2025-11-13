/**
 * NextAuth.js Configuration
 *
 * This file configures how authentication works in our app.
 * It defines how users log in, what happens after login, and how sessions are managed.
 *
 * Key Concepts:
 * - Provider: A method of authentication (we use "Credentials" for username/password)
 * - Session: Keeps track of who's logged in
 * - Callbacks: Functions that run at specific times (like after login)
 */

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { query } from "@/lib/db"

/**
 * NextAuth Configuration Object
 *
 * This is like the settings panel for authentication.
 * Each property controls a different aspect of how login works.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  /**
   * SECRET
   *
   * Secret key for encrypting tokens and cookies
   * This is required for production
   */
  secret: process.env.AUTH_SECRET,

  /**
   * PROVIDERS
   *
   * Providers are different ways users can log in.
   * We're using "Credentials" which means username + password.
   *
   * Other providers include: Google, GitHub, Facebook, etc.
   * But for your internal dashboard, username/password is perfect!
   */
  providers: [
    Credentials({
      // These are the fields shown on the login form
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },

      /**
       * AUTHORIZE FUNCTION
       *
       * This is the most important part! It runs when someone tries to log in.
       *
       * What it does:
       * 1. Takes the username and password from the login form
       * 2. Looks up the user in the database
       * 3. Compares the password with the hashed password
       * 4. Returns user info if correct, or null if wrong
       *
       * Think of it like a bouncer at a club checking IDs!
       */
      async authorize(credentials) {
        try {
          // Get username and password from login form
          const { username, password } = credentials as {
            username: string
            password: string
          }

          // Validate that both fields are provided
          if (!username || !password) {
            console.log('❌ Login attempt with missing credentials')
            return null
          }

          console.log(`🔍 Attempting login for user: ${username}`)

          // Look up the user in the database
          const sql = `
            SELECT id, username, password_hash, full_name, email, is_active, last_login
            FROM users
            WHERE username = $1;
          `

          const result = await query(sql, [username])

          // If user doesn't exist, return null (login fails)
          if (result.rows.length === 0) {
            console.log(`❌ User not found: ${username}`)
            return null
          }

          const user = result.rows[0]

          // Check if user account is active
          if (!user.is_active) {
            console.log(`❌ User account is disabled: ${username}`)
            return null
          }

          // Compare the provided password with the stored hash
          // bcrypt.compare() automatically handles the salt and hashing
          const passwordMatch = await bcrypt.compare(password, user.password_hash)

          if (!passwordMatch) {
            console.log(`❌ Invalid password for user: ${username}`)
            return null
          }

          // Password is correct! Update last_login timestamp
          const updateSql = `
            UPDATE users
            SET last_login = NOW()
            WHERE id = $1;
          `
          await query(updateSql, [user.id])

          console.log(`✅ Login successful for user: ${username}`)

          // Return user object (this will be stored in the session)
          // Don't include password_hash!
          return {
            id: user.id.toString(),
            name: user.full_name || user.username,
            email: user.email,
            username: user.username
          }

        } catch (error) {
          console.error('❌ Error during authentication:', error)
          return null
        }
      }
    })
  ],

  /**
   * PAGES
   *
   * These are custom pages we'll create for authentication.
   * If not specified, NextAuth uses default (ugly) pages.
   */
  pages: {
    signIn: '/login',  // Custom login page
    error: '/login',   // If error, redirect back to login
  },

  /**
   * SESSION CONFIGURATION
   *
   * Session determines how long users stay logged in.
   * We use JWT (JSON Web Token) strategy - it's fast and scalable.
   *
   * Alternative: "database" strategy stores sessions in DB (more secure but slower)
   */
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },

  /**
   * USE SECURE COOKIES
   *
   * Automatically use secure cookies in production
   */
  useSecureCookies: process.env.NODE_ENV === 'production',

  /**
   * COOKIES CONFIGURATION
   *
   * Configure cookie settings for production (Vercel)
   * This fixes issues with session persistence on hosted environments
   */
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
      },
    },
  },

  /**
   * TRUST HOST
   *
   * Trust the host header in production (required for Vercel)
   */
  trustHost: true,

  /**
   * CALLBACKS
   *
   * Callbacks are functions that run at specific points in the auth flow.
   * They let you customize what data is stored in the session.
   */
  callbacks: {
    /**
     * JWT CALLBACK
     *
     * Runs when a JWT token is created or updated.
     * This is where we add custom user data to the token.
     *
     * When does it run?
     * - When user logs in (creates token)
     * - When session is accessed (reads token)
     */
    async jwt({ token, user }) {
      // On first login, user object is available
      // Add custom fields to the token
      if (user) {
        token.id = user.id
        token.username = (user as any).username
      }
      return token
    },

    /**
     * SESSION CALLBACK
     *
     * Runs whenever session data is accessed.
     * This is where we add user data to the session object.
     *
     * The session object is what you'll use in your app to check:
     * - Is someone logged in?
     * - Who is logged in?
     * - What's their username?
     */
    async session({ session, token }) {
      // Add custom fields from token to session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    }
  }
})
