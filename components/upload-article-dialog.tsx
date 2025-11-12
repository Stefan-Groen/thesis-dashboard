/**
 * UploadArticleDialog Component
 *
 * Dialog for uploading user articles.
 * Fields: title (required), link (optional), article text (required)
 */

"use client"

import * as React from "react"
import { IconUpload } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function UploadArticleDialog() {
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: "",
    link: "",
    summary: "",
  })

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error("Please enter a title")
      return
    }

    if (!formData.summary.trim()) {
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
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload article")
      }

      toast.success("Article uploaded successfully! It will be classified soon.")

      // Reset form and close dialog
      setFormData({ title: "", link: "", summary: "" })
      setOpen(false)

      // Refresh the page to show updated data
      window.location.reload()

    } catch (error) {
      console.error("Error uploading article:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload article")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading skeleton during SSR/hydration
  if (!mounted) {
    return (
      <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full">
        <CardHeader className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
          <IconUpload className="size-12 text-muted-foreground mb-4" />
          <CardTitle className="text-xl">Upload Article</CardTitle>
          <CardDescription>
            Add your own article for classification
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer transition-all hover:bg-muted/50 h-full">
          <CardHeader className="flex flex-col items-center justify-center text-center h-full min-h-[200px]">
            <IconUpload className="size-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl">Upload Article</CardTitle>
            <CardDescription>
              Add your own article for classification
            </CardDescription>
          </CardHeader>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Article</DialogTitle>
            <DialogDescription>
              Add your own article to be classified by the LLM
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter article title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Link Field */}
            <div className="space-y-2">
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://example.com/article"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty if no link is available
              </p>
            </div>

            {/* Article Text Field */}
            <div className="space-y-2">
              <Label htmlFor="summary">
                Article Text <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="summary"
                placeholder="Paste or type the article content here..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={8}
                className="resize-y"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload Article"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
