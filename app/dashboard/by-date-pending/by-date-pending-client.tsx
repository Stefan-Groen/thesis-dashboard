"use client"

import * as React from "react"
import Link from "next/link"
import { IconArrowLeft, IconClock } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { FilteredArticlesTable } from "@/components/filtered-articles-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Article } from "@/lib/types"

interface ByDatePendingClientProps {
  articles: Article[]
  initialDate: string
}

export function ByDatePendingClient({ articles, initialDate }: ByDatePendingClientProps) {
  // Format date for display
  const formattedDate = React.useMemo(() => {
    const date = new Date(initialDate + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }, [initialDate])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {/* Max-width container for better layout on large screens */}
            <div className="mx-auto w-full max-w-[1600px]">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Header */}
                <div className="px-4 lg:px-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard">
                          <IconArrowLeft className="size-4" />
                        </Link>
                      </Button>
                      <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                          <IconClock className="size-8 text-slate-500" />
                          Pending - {formattedDate}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                          Pending/unclassified articles published on {formattedDate}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-slate-500 dark:text-slate-400 text-lg px-4 py-2">
                      {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
                    </Badge>
                  </div>
                </div>

                {/* Filtered Table */}
                <div className="px-4 lg:px-6">
                  <FilteredArticlesTable articles={articles} classification="Backlog" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
