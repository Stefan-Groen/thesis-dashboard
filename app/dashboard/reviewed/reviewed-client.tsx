"use client"

import * as React from "react"
import Link from "next/link"
import { IconArrowLeft, IconStarFilled } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { FilteredArticlesTable } from "@/components/filtered-articles-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Article } from "@/lib/types"

interface ReviewedPageClientProps {
  articles: Article[]
}

export function ReviewedPageClient({ articles }: ReviewedPageClientProps) {
  const [showThreats, setShowThreats] = React.useState(true)
  const [showOpportunities, setShowOpportunities] = React.useState(true)
  const [showNeutral, setShowNeutral] = React.useState(false)
  const [showPending, setShowPending] = React.useState(false)

  // Filter articles based on selected classifications
  const filteredArticles = React.useMemo(() => {
    return articles.filter((article) => {
      if (showThreats && article.classification === 'Threat') return true
      if (showOpportunities && article.classification === 'Opportunity') return true
      if (showNeutral && article.classification === 'Neutral') return true
      if (showPending && article.status === 'PENDING') return true
      return false
    })
  }, [articles, showThreats, showOpportunities, showNeutral, showPending])

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
                        <IconStarFilled className="size-8 text-yellow-500" />
                        Reviewed Threats/Opportunities
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Articles you have rated and reviewed
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500 dark:text-yellow-400 text-lg px-4 py-2">
                    {filteredArticles.length} {filteredArticles.length === 1 ? 'Article' : 'Articles'}
                  </Badge>
                </div>

                {/* Classification Filter Checkboxes */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="threats-checkbox"
                      checked={showThreats}
                      onCheckedChange={(checked) => setShowThreats(checked as boolean)}
                    />
                    <Label htmlFor="threats-checkbox" className="text-sm cursor-pointer">
                      Threats
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="opportunities-checkbox"
                      checked={showOpportunities}
                      onCheckedChange={(checked) => setShowOpportunities(checked as boolean)}
                    />
                    <Label htmlFor="opportunities-checkbox" className="text-sm cursor-pointer">
                      Opportunities
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="neutral-checkbox"
                      checked={showNeutral}
                      onCheckedChange={(checked) => setShowNeutral(checked as boolean)}
                    />
                    <Label htmlFor="neutral-checkbox" className="text-sm cursor-pointer">
                      Neutral
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="pending-checkbox"
                      checked={showPending}
                      onCheckedChange={(checked) => setShowPending(checked as boolean)}
                    />
                    <Label htmlFor="pending-checkbox" className="text-sm cursor-pointer">
                      Pending
                    </Label>
                  </div>
                </div>
              </div>

              {/* Filtered Table */}
              <div className="px-4 lg:px-6">
                <FilteredArticlesTable articles={filteredArticles} classification="All" />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
