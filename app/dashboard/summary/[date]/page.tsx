/**
 * Summary Detail Page
 *
 * Displays a specific summary with formatted content and PDF download option
 */

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { notFound } from "next/navigation"
import { IconArrowLeft, IconDownload } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SummaryView } from "@/components/summary-view"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { query } from "@/lib/db"

interface SummaryPageProps {
  params: Promise<{
    date: string
  }>
}

async function getSummary(date: string) {
  try {
    const sql = `
      SELECT id, date, version, content, created_at as "createdAt", updated_at as "updatedAt"
      FROM summaries
      WHERE date = $1
      ORDER BY version DESC
      LIMIT 1;
    `

    const result = await query(sql, [date])

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error('Error fetching summary:', error)
    return null
  }
}

export default async function SummaryDetailPage({ params }: SummaryPageProps) {
  const { date } = await params
  const summary = await getSummary(date)

  if (!summary) {
    notFound()
  }

  const formattedDate = (() => {
    const [year, month, day] = summary.date.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })()

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
                      <Link href="/dashboard/summary">
                        <IconArrowLeft className="size-4" />
                      </Link>
                    </Button>
                    <div>
                      <h1 className="text-3xl font-bold">Executive Summary</h1>
                      <p className="text-muted-foreground mt-1">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary View */}
              <div className="px-4 lg:px-6">
                <SummaryView summary={summary} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
