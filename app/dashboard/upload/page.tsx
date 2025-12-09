/**
 * Upload Article Page
 *
 * Dedicated page for uploading articles to be classified.
 * Supports two methods:
 * 1. Manual entry: Title, Link, Article text, Date published
 * 2. PDF upload: Automatic text extraction from PDF files
 */

import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { IconUpload } from "@tabler/icons-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { UploadArticleForm } from "@/components/upload-article-form"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UploadPage() {
  // Check if user is authenticated
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
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
              <div className="flex flex-col gap-6 py-6 md:gap-8 md:py-8">
                <div className="px-4 lg:px-6">
                {/* Page Header */}
                <div className="mb-8 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <IconUpload className="size-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">Upload Article</h1>
                      <p className="text-muted-foreground">
                        Add your own article or document for AI classification
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Form Card */}
                <Card className="max-w-4xl border-2 shadow-lg">
                  <CardHeader className="pb-8">
                    <CardTitle className="text-xl">Choose Upload Method</CardTitle>
                    <CardDescription className="text-base">
                      Manually enter article details or upload a PDF for automatic text extraction
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <UploadArticleForm />
                  </CardContent>
                </Card>

                {/* Help Section */}
                <div className="mt-6 max-w-4xl">
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="pt-6">
                      <h3 className="text-sm font-semibold mb-3">What happens after upload?</h3>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Your article will be added to the classification queue</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>The AI will analyze and classify it as a Threat, Opportunity, or Neutral</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>You'll find it in your "Own Articles" section after classification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>The source will be attributed to your username: <strong>@{session.user.username}</strong></span>
                        </li>
                      </ul>
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
