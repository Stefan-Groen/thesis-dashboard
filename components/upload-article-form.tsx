"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { IconFileText, IconUpload, IconFileTypePdf, IconCalendar } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

export function UploadArticleForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("manual")

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const todayDate = getTodayDate()

  // Manual entry form state
  const [manualForm, setManualForm] = React.useState({
    title: "",
    link: "",
    summary: "",
    datePublished: todayDate, // Default to today
  })

  // PDF upload state
  const [pdfFile, setPdfFile] = React.useState<File | null>(null)
  const [pdfDatePublished, setPdfDatePublished] = React.useState(todayDate) // Default to today
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Handle manual form submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualForm.title.trim()) {
      toast.error("Please enter a title")
      return
    }

    if (!manualForm.summary.trim()) {
      toast.error("Please enter article text")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/upload-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: manualForm.title,
          link: manualForm.link,
          summary: manualForm.summary,
          datePublished: manualForm.datePublished,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload article")
      }

      toast.success("Article uploaded successfully! It will be classified soon.")

      // Reset form
      setManualForm({ title: "", link: "", summary: "", datePublished: "" })

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)

    } catch (error) {
      console.error("Error uploading article:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload article")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle PDF upload
  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pdfFile) {
      toast.error("Please select a PDF file")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("file", pdfFile)
      if (pdfDatePublished) {
        formData.append("datePublished", pdfDatePublished)
      }

      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload PDF")
      }

      toast.success(`PDF uploaded successfully! Extracted ${data.article.extractedTextLength} characters.`)

      // Reset form
      setPdfFile(null)
      setPdfDatePublished("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)

    } catch (error) {
      console.error("Error uploading PDF:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload PDF")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file")
        e.target.value = ""
        return
      }
      setPdfFile(file)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="manual" className="flex items-center gap-2">
          <IconFileText className="size-4" />
          Manual Entry
        </TabsTrigger>
        <TabsTrigger value="pdf" className="flex items-center gap-2">
          <IconFileTypePdf className="size-4" />
          PDF Upload
        </TabsTrigger>
      </TabsList>

      {/* Manual Entry Tab */}
      <TabsContent value="manual" className="mt-0">
        <form onSubmit={handleManualSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">
              Article Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter the article title"
              value={manualForm.title}
              onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
              className="text-base"
              required
            />
          </div>

          {/* Link Field */}
          <div className="space-y-2">
            <Label htmlFor="link" className="text-base font-semibold">
              Article Link <span className="text-muted-foreground text-sm font-normal">(optional)</span>
            </Label>
            <Input
              id="link"
              type="url"
              placeholder="https://example.com/article"
              value={manualForm.link}
              onChange={(e) => setManualForm({ ...manualForm, link: e.target.value })}
              className="text-base"
            />
            <p className="text-sm text-muted-foreground">
              Original source URL if available
            </p>
          </div>

          {/* Date Published Field */}
          <div className="space-y-2">
            <Label htmlFor="datePublished" className="text-base font-semibold flex items-center gap-2">
              <IconCalendar className="size-4" />
              Publication Date <span className="text-muted-foreground text-sm font-normal">(defaults to today)</span>
            </Label>
            <Input
              id="datePublished"
              type="date"
              value={manualForm.datePublished}
              onChange={(e) => setManualForm({ ...manualForm, datePublished: e.target.value })}
              className="text-base"
            />
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                ⚠️ Changing this date will affect which AI Overview summary this article appears in
              </p>
            </div>
          </div>

          {/* Article Text Field */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="text-base font-semibold">
              Article Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="summary"
              placeholder="Paste or type the full article content here..."
              value={manualForm.summary}
              onChange={(e) => setManualForm({ ...manualForm, summary: e.target.value })}
              rows={14}
              className="resize-y text-base font-mono"
              required
            />
            <p className="text-sm text-muted-foreground">
              {manualForm.summary.length} characters
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/dashboard")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <IconUpload className="size-4 mr-2 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <IconUpload className="size-4 mr-2" />
                  Upload Article
                </>
              )}
            </Button>
          </div>
        </form>
      </TabsContent>

      {/* PDF Upload Tab */}
      <TabsContent value="pdf" className="mt-0">
        <form onSubmit={handlePdfSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Select PDF File <span className="text-red-500">*</span>
            </Label>

            {/* Drag and drop area */}
            <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <IconFileTypePdf className="size-12 text-primary" />
                </div>

                {pdfFile ? (
                  <div className="text-center space-y-2">
                    <p className="text-base font-medium text-foreground">
                      {pdfFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPdfFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                      className="mt-2"
                    >
                      Remove file
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-base font-medium text-foreground">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF files only, max 10 MB
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-file-input"
                />

                {!pdfFile && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6"
                  >
                    <IconUpload className="size-4 mr-2" />
                    Choose PDF File
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Note:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Text will be automatically extracted from the PDF</li>
                <li>The filename will be used as the article title</li>
                <li>The article will be queued for AI classification</li>
              </ul>
            </div>
          </div>

          {/* Date Published Field for PDF */}
          <div className="space-y-2">
            <Label htmlFor="pdf-datePublished" className="text-base font-semibold flex items-center gap-2">
              <IconCalendar className="size-4" />
              Publication Date <span className="text-muted-foreground text-sm font-normal">(defaults to today)</span>
            </Label>
            <Input
              id="pdf-datePublished"
              type="date"
              value={pdfDatePublished}
              onChange={(e) => setPdfDatePublished(e.target.value)}
              className="text-base"
            />
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                ⚠️ Changing this date will affect which AI Overview summary this article appears in
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/dashboard")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting || !pdfFile} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <IconUpload className="size-4 mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <IconFileTypePdf className="size-4 mr-2" />
                  Upload PDF
                </>
              )}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  )
}
