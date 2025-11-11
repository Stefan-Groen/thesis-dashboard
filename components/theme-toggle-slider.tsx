"use client"

import * as React from "react"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"

export function ThemeToggleSlider() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
        <span className="text-sm font-medium">Theme</span>
        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted">
          <span className="sr-only">Loading theme...</span>
        </div>
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <span className="text-sm font-medium">Theme</span>
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-muted"
        role="switch"
        aria-checked={isDark}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span
          className={`${
            isDark ? "translate-x-6" : "translate-x-1"
          } inline-flex h-4 w-4 items-center justify-center transform rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out`}
        >
          {isDark ? (
            <IconMoon className="size-3 text-foreground" />
          ) : (
            <IconSun className="size-3 text-foreground" />
          )}
        </span>
      </button>
    </div>
  )
}
