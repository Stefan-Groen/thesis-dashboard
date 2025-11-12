/**
 * Site Header Component
 *
 * This is the top bar of the dashboard that shows:
 * - App title
 * - Navigation links (Thesis, GitHub, LinkedIn)
 */

"use client"

import { IconBrandLinkedin, IconFileText } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Article Classification Dashboard</h1>

        {/* Right side - Links and User Menu */}
        <div className="ml-auto flex items-center gap-2">
          {/* Thesis Link */}
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://drive.google.com/file/d/1VP-katLsR3I07dTy8LLeXDfBUjHFFNgz/view?usp=sharing"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              <IconFileText className="size-4 mr-2" />
              Thesis
            </a>
          </Button>

          {/* LinkedIn Link */}
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://www.linkedin.com/in/stefan-groen-557223265/"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              <IconBrandLinkedin className="size-4 mr-2" style={{ color: '#0077B5' }} />
              LinkedIn
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
