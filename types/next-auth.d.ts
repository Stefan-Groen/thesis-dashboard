/**
 * NextAuth Type Definitions
 *
 * This file extends NextAuth's default types to include our custom user fields.
 * Without this, TypeScript would complain about accessing user.username!
 *
 * Think of this as telling TypeScript: "Hey, our users have extra properties!"
 */

import NextAuth, { DefaultSession } from "next-auth"

/**
 * Extend the built-in session types
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
    } & DefaultSession["user"]
  }

  interface User {
    username: string
  }
}

/**
 * Extend the built-in JWT types
 */
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
  }
}
