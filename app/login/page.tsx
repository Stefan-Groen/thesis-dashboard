/**
 * Login Page
 *
 * This is where users enter their username and password to access the dashboard.
 *
 * Key Concepts:
 * - "use client" directive: This makes it a Client Component (can use hooks, handle events)
 * - Server Actions: signIn() is called on the server for security
 * - Form handling: Uses React state to track input values
 * - Error handling: Shows user-friendly error messages
 *
 * Think of this like a door with a lock - users need the right key (credentials) to enter!
 */

"use client"

import { useState, FormEvent } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { IconLogin, IconAlertCircle, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Login Page Component
 *
 * This component handles the entire login flow:
 * 1. Display the login form
 * 2. Capture username and password
 * 3. Submit to NextAuth
 * 4. Handle success/error
 * 5. Redirect to dashboard on success
 */
export default function LoginPage() {
  // Router for navigation after successful login
  const router = useRouter()

  // Get URL parameters (used for error messages from NextAuth)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  // State management (like variables that trigger re-renders when changed)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handle form submission
   *
   * This runs when the user clicks "Sign In" button.
   * It's marked as 'async' because we need to wait for the login to complete.
   *
   * What happens:
   * 1. Prevent default form submission (we handle it ourselves)
   * 2. Clear any previous errors
   * 3. Set loading state (shows spinner)
   * 4. Call NextAuth's signIn function
   * 5. Check result and redirect or show error
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    // Prevent default form submission (which would reload the page)
    e.preventDefault()

    // Clear any previous error messages
    setError("")

    // Show loading spinner
    setIsLoading(true)

    try {
      /**
       * Call NextAuth's signIn function
       *
       * Parameters:
       * - "credentials": We're using username/password (not Google, GitHub, etc.)
       * - { username, password, redirect: false }: The credentials to check
       *
       * redirect: false means NextAuth won't automatically redirect
       * (we want to handle success/error ourselves)
       */
      const result = await signIn("credentials", {
        username: username,
        password: password,
        redirect: false, // Don't auto-redirect, we'll handle it
      })

      /**
       * Check the result
       *
       * result.error exists if login failed
       * result.ok is true if login succeeded
       */
      if (result?.error) {
        // Login failed - show error message
        setError("Invalid username or password. Please try again.")
        console.log("❌ Login failed:", result.error)
      } else if (result?.ok) {
        // Login succeeded! 🎉
        console.log("✅ Login successful! Redirecting to dashboard...")

        // Redirect to the dashboard (or wherever they were trying to go)
        router.push(callbackUrl)
        router.refresh() // Refresh to update session state
      }

    } catch (err) {
      // Unexpected error (network issue, etc.)
      console.error("❌ Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      // Always turn off loading spinner (whether success or fail)
      setIsLoading(false)
    }
  }

  /**
   * Render the login page UI
   *
   * This is what the user sees:
   * - A centered card with the login form
   * - Username and password fields
   * - Error message if login fails
   * - Loading spinner during login
   * - Submit button
   */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        {/* Card Header */}
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <IconLogin className="size-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold">
            Article Classification Dashboard
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        {/* Card Content - The Form */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-start gap-2">
                <IconAlertCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <IconLogin className="size-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>

        {/* Card Footer */}
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-xs text-center text-muted-foreground">
            For internal use only. Authorized personnel only.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
