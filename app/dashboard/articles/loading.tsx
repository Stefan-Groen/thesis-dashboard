/**
 * Loading State for All Articles Page
 *
 * Displays skeleton UI while articles are being fetched
 */

import Link from "next/link"
import { IconArrowLeft, IconNews } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function ArticlesLoading() {
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
                        <IconNews className="size-8 text-blue-600" />
                        All Articles
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Complete list of all articles in the database
                      </p>
                    </div>
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>

              {/* Table Skeleton */}
              <div className="px-4 lg:px-6">
                <div className="rounded-lg border bg-card">
                  {/* Search bar skeleton */}
                  <div className="p-4 border-b">
                    <Skeleton className="h-10 w-full max-w-sm" />
                  </div>

                  {/* Table rows skeleton */}
                  <div className="p-4 space-y-3">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                        <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-24 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
