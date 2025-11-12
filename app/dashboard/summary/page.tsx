/**
 * Summary Page
 *
 * Allows users to generate and view AI summaries of daily threats and opportunities
 */

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { IconArrowLeft, IconFileText } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SummaryGenerator } from "@/components/summary-generator"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export default async function SummaryPage() {
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
                        <IconFileText className="size-8 text-blue-600" />
                        Daily Summaries
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        AI-generated summaries of threats and opportunities
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Generator Component */}
              <div className="px-4 lg:px-6">
                <SummaryGenerator />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
