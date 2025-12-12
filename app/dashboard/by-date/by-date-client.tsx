"use client"

import * as React from "react"
import Link from "next/link"
import { IconArrowLeft, IconCalendarEvent } from "@tabler/icons-react"
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

interface ByDateClientProps {
  articles: Article[]
  initialDate: string
  initialClassification?: 'Threat' | 'Opportunity' | 'Neutral' | 'Pending'
}

export function ByDateClient({ articles, initialDate, initialClassification }: ByDateClientProps) {
  // Set initial checkboxes based on URL parameter
  // If a classification is specified, only check that one
  // If no classification is specified, check all (for "View all" button)
  const [showThreats, setShowThreats] = React.useState(
    initialClassification ? initialClassification === 'Threat' : true
  )
  const [showOpportunities, setShowOpportunities] = React.useState(
    initialClassification ? initialClassification === 'Opportunity' : true
  )
  const [showNeutral, setShowNeutral] = React.useState(
    initialClassification ? initialClassification === 'Neutral' : true
  )
  const [showPending, setShowPending] = React.useState(
    initialClassification ? initialClassification === 'Pending' : true
  )

  // Sync state with URL parameter changes
  React.useEffect(() => {
    if (initialClassification) {
      setShowThreats(initialClassification === 'Threat')
      setShowOpportunities(initialClassification === 'Opportunity')
      setShowNeutral(initialClassification === 'Neutral')
      setShowPending(initialClassification === 'Pending')
    } else {
      // No classification specified, show all
      setShowThreats(true)
      setShowOpportunities(true)
      setShowNeutral(true)
      setShowPending(true)
    }
  }, [initialClassification])

  // Filter articles based on selected classifications
  const filteredArticles = React.useMemo(() => {
    return articles.filter((article) => {
      if (showThreats && article.classification === 'Threat') return true
      if (showOpportunities && article.classification === 'Opportunity') return true
      if (showNeutral && article.classification === 'Neutral') return true
      if (showPending && (article.status === 'PENDING' || !article.classification)) return true
      return false
    })
  }, [articles, showThreats, showOpportunities, showNeutral, showPending])

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
                        <IconCalendarEvent className="size-8 text-blue-600" />
                        Articles - {formattedDate}
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Articles published on {formattedDate}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600 dark:text-blue-400 text-lg px-4 py-2">
                    {filteredArticles.length} {filteredArticles.length === 1 ? 'Article' : 'Articles'}
                  </Badge>
                </div>

                {/* Classification Filter Checkboxes - On the page, not in filter popup */}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
