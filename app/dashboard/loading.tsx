/**
 * Loading State for Main Dashboard Page
 *
 * Displays skeleton UI while dashboard data is being fetched
 */

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
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
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-5 rounded" />
                      </div>
                      <Skeleton className="h-8 w-16 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Chart 1 */}
                  <div className="rounded-lg border bg-card p-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-64 w-full" />
                  </div>

                  {/* Chart 2 */}
                  <div className="rounded-lg border bg-card p-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                </div>
              </div>

              {/* Recent Articles Section */}
              <div className="px-4 lg:px-6">
                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-9 w-32" />
                  </div>

                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-8 w-20 flex-shrink-0" />
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
