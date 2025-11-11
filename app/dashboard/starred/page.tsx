/**
 * Starred Articles Page
 *
 * Displays all articles that have been starred by managers.
 * Uses Server Components to fetch data from the API.
 */

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
import type { Article } from "@/lib/types"

/**
 * Fetch starred articles from our API
 */
async function getStarredArticles(): Promise<Article[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/articles?starred=true&limit=1000`, {
      next: { revalidate: 30 }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch starred articles')
    }

    const data = await res.json()
    return data.articles
  } catch (error) {
    console.error('Error fetching starred articles:', error)
    return []
  }
}

export default async function StarredPage() {
  const articles = await getStarredArticles()

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
                        Starred Articles
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Your favorite articles marked for quick access
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400 text-lg px-4 py-2">
                    {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
                  </Badge>
                </div>
              </div>

              {/* Filtered Table */}
              <div className="px-4 lg:px-6">
                <FilteredArticlesTable articles={articles} classification="Starred" />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
