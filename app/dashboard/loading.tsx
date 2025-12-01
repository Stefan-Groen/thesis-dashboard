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
            {/* Max-width container for better layout on large screens */}
            <div className="mx-auto w-full max-w-[1600px]">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Row 1: 4 stat cards (Threats, Opportunities, Neutral, Pending) */}
                <div className="px-4 lg:px-6">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Skeleton className="h-5 w-5 rounded" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-6 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-20 w-20 rounded-full mx-auto mt-4" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 2-3: Charts */}
                <div className="px-4 lg:px-6">
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <div className="rounded-lg border bg-card p-6">
                      <Skeleton className="h-6 w-48 mb-4" />
                      <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="rounded-lg border bg-card p-6">
                      <Skeleton className="h-6 w-48 mb-4" />
                      <Skeleton className="h-64 w-full" />
                    </div>
                  </div>
                </div>

                {/* Row 3-4: Articles Today + Table */}
                <div className="px-4 lg:px-6">
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-8">
                    {/* Articles Today tile */}
                    <div className="lg:col-span-2">
                      <div className="rounded-lg border bg-card p-6 min-h-[140px]">
                        <Skeleton className="h-5 w-5 mb-2" />
                        <Skeleton className="h-6 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    {/* Table */}
                    <div className="lg:col-span-6 lg:row-span-2">
                      <div className="rounded-lg border bg-card p-6 h-full">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Total Articles tile */}
                    <div className="lg:col-span-2">
                      <div className="rounded-lg border bg-card p-6 min-h-[140px]">
                        <Skeleton className="h-5 w-5 mb-2" />
                        <Skeleton className="h-6 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 5-6: Starred table + action tiles */}
                <div className="px-4 lg:px-6">
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-8">
                    {/* Starred Articles table */}
                    <div className="lg:col-span-4 lg:row-span-2">
                      <div className="rounded-lg border bg-card p-6 h-full">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Own Articles tile */}
                    <div className="lg:col-span-2">
                      <div className="rounded-lg border bg-card p-6 min-h-[140px]">
                        <Skeleton className="h-5 w-5 mb-2" />
                        <Skeleton className="h-6 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    {/* Upload tile */}
                    <div className="lg:col-span-2">
                      <div className="rounded-lg border bg-card p-6 min-h-[140px] flex items-center justify-center">
                        <Skeleton className="h-12 w-12 rounded mb-2" />
                      </div>
                    </div>
                    {/* Reviewed T/O tile */}
                    <div className="lg:col-span-2">
                      <div className="rounded-lg border bg-card p-6 min-h-[140px]">
                        <Skeleton className="h-5 w-5 mb-2" />
                        <Skeleton className="h-6 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    {/* New T/O tile */}
                    <div className="lg:col-span-2">
                      <div className="rounded-lg border bg-card p-6 min-h-[140px]">
                        <Skeleton className="h-5 w-5 mb-2" />
                        <Skeleton className="h-6 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
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
