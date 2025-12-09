/**
 * PDF Text Viewer Page
 *
 * Displays extracted text from uploaded PDF files
 */

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { query } from "@/lib/db"
import { auth } from "@/auth"

/**
 * Fetch article summary (PDF text)
 */
async function getArticlePdfText(id: string): Promise<{ title: string; summary: string } | null> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return null
    }

    const sql = `
      SELECT a.title, a.summary
      FROM articles a
      INNER JOIN organizations o ON o.id = $1
      WHERE a.id = $2
        AND a.date_published >= o.created_at
      LIMIT 1;
    `

    const result = await query(sql, [session.user.organizationId, parseInt(id)])

    if (result.rows.length === 0) {
      return null
    }

    return {
      title: result.rows[0].title,
      summary: result.rows[0].summary,
    }
  } catch (error) {
    console.error('Error fetching PDF text:', error)
    return null
  }
}

export default async function PdfTextPage({ params }: { params: Promise<{ id: string }> }) {
  // Check authentication
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Await params
  const { id } = await params

  // Fetch article text
  const articleData = await getArticlePdfText(id)

  if (!articleData) {
    notFound()
  }

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
                <div className="px-4 lg:px-6">
                  {/* Header with Back Button */}
                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/dashboard/article/${id}`}>
                        <IconArrowLeft className="size-4" />
                      </Link>
                    </Button>
                    <div>
                      <h1 className="text-3xl font-bold">PDF Text</h1>
                      <p className="text-muted-foreground mt-1">
                        Extracted text from uploaded PDF document
                      </p>
                    </div>
                  </div>

                  {/* PDF Text Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{articleData.title}</CardTitle>
                      <CardDescription>
                        Full text content extracted from the PDF file
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap border rounded-md p-4 bg-muted/30 font-mono max-h-[600px] overflow-y-auto">
                        {articleData.summary || 'No text available'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
