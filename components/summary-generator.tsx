/**
 * Summary Generator Component
 *
 * Allows users to select a date and generate/view AI summaries
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconCalendar, IconSparkles, IconEye, IconLoader2, IconFileText, IconArrowUp, IconArrowDown, IconDownload, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { jsPDF } from "jspdf"

interface Summary {
  id: number
  date: string
  version: number
  content: string
  createdAt: string
  updatedAt: string
}

export function SummaryGenerator() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = React.useState<string>('')
  const [existingSummaries, setExistingSummaries] = React.useState<Summary[]>([])
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [generatingDate, setGeneratingDate] = React.useState<string | null>(null)
  const [sortOrder, setSortOrder] = React.useState<'desc' | 'asc'>('desc') // desc = newest first

  // Fetch existing summaries on mount
  React.useEffect(() => {
    fetchSummaries()
  }, [])

  const fetchSummaries = async () => {
    try {
      const response = await fetch('/api/summaries')
      if (response.ok) {
        const data = await response.json()
        setExistingSummaries(data.summaries || [])
      }
    } catch (error) {
      console.error('Error fetching summaries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Sort summaries based on sortOrder
  const sortedSummaries = React.useMemo(() => {
    return [...existingSummaries].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) {
        return sortOrder === 'desc' ? -dateCompare : dateCompare
      }
      // If dates are equal, sort by version
      return sortOrder === 'desc' ? b.version - a.version : a.version - b.version
    })
  }, [existingSummaries, sortOrder])

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  const handleDeleteSummary = async (summaryId: number) => {
    try {
      const response = await fetch(`/api/summaries/${summaryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Summary deleted successfully')
        // Refresh the summaries list
        await fetchSummaries()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete summary')
      }
    } catch (error) {
      console.error('Error deleting summary:', error)
      toast.error('Failed to delete summary')
    }
  }

  const downloadPDF = (summary: Summary) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const maxWidth = pageWidth - 2 * margin
    const bottomMargin = 20
    let yPosition = 20

    // Helper function to check if we need a new page
    const checkPageOverflow = (estimatedHeight: number) => {
      if (yPosition + estimatedHeight > pageHeight - bottomMargin) {
        doc.addPage()
        yPosition = 20
      }
    }

    // Helper function to add text with word wrapping and automatic page breaks
    const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, maxWidth)
      const lineHeight = fontSize * 0.5

      for (let i = 0; i < lines.length; i++) {
        checkPageOverflow(lineHeight + 5)
        doc.text(lines[i], margin, yPosition)
        yPosition += lineHeight
      }

      yPosition += 5 // Add some spacing after text block
    }

    // Add title
    const [year, month, day] = summary.date.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    addText('Executive Summary', 18, true)
    addText(formattedDate, 12)
    if (summary.version > 1) {
      addText(`Version ${summary.version}`, 10)
    }
    yPosition += 10

    // Add content (parse markdown-like sections)
    const content = summary.content
    const sections = content.split('\n\n')

    sections.forEach(section => {
      if (!section.trim()) return

      // Check if it's a heading (starts with ## or similar)
      if (section.startsWith('##')) {
        yPosition += 5
        const heading = section.replace(/^#+\s*/, '')
        addText(heading, 14, true)
      } else if (section.startsWith('#')) {
        yPosition += 5
        const heading = section.replace(/^#+\s*/, '')
        addText(heading, 16, true)
      } else if (section.startsWith('**')) {
        // Bold section
        const text = section.replace(/\*\*/g, '')
        addText(text, 11, true)
      } else if (section.startsWith('- ') || section.startsWith('* ')) {
        // Bullet points
        const bulletPoints = section.split('\n')
        bulletPoints.forEach(point => {
          if (point.trim()) {
            const cleanPoint = point.replace(/^[-*]\s*/, '• ')
            addText(cleanPoint, 11)
          }
        })
      } else {
        // Regular paragraph
        addText(section, 11)
      }
    })

    // Add footer
    checkPageOverflow(15)
    yPosition = pageHeight - 15
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text('Generated by AI-powered Executive Summary System', margin, yPosition)

    // Download the PDF
    const filename = `summary_${summary.date}${summary.version > 1 ? `_v${summary.version}` : ''}.pdf`
    doc.save(filename)

    toast.success('PDF downloaded successfully')
  }

  const handleGenerateSummary = async () => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }

    setIsGenerating(true)
    setGeneratingDate(selectedDate)

    // Show loading toast immediately
    const loadingToast = toast.loading('Summary is being generated, this may take a moment...')

    try {
      const response = await fetch('/api/summaries/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: selectedDate })
      })

      const data = await response.json()

      // Dismiss the loading toast
      toast.dismiss(loadingToast)

      if (response.ok) {
        console.log('Summary data:', data.summary)
        console.log('Summary date:', data.summary.date)
        toast.success(`Summary generated successfully! (${data.summary.articleCount} articles analyzed)`)
        // Refresh summaries list
        await fetchSummaries()
        // Navigate to the summary detail page using the date returned from the API
        router.push(`/dashboard/summary/${data.summary.date}`)
      } else {
        if (response.status === 409) {
          toast.error('Summary already exists for this date')
        } else if (response.status === 404) {
          toast.error('No classified articles found for this date')
        } else {
          toast.error(data.error || 'Failed to generate summary')
        }
      }
    } catch (error) {
      // Dismiss the loading toast
      toast.dismiss(loadingToast)
      console.error('Error generating summary:', error)
      toast.error('Failed to generate summary')
    } finally {
      setIsGenerating(false)
      setGeneratingDate(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Generate New Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Summary</CardTitle>
          <CardDescription>
            Select a date to generate an AI summary of that day's threats and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="date-select" className="sr-only">
                Select Date
              </Label>
              <div className="relative">
                <IconCalendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <Button
              onClick={handleGenerateSummary}
              disabled={!selectedDate || isGenerating}
              className="sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <IconSparkles className="size-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Summaries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Existing Summaries</CardTitle>
              <CardDescription>
                View previously generated summaries
              </CardDescription>
            </div>
            {existingSummaries.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
              >
                {sortOrder === 'desc' ? (
                  <>
                    <IconArrowDown className="size-4 mr-2" />
                    Newest First
                  </>
                ) : (
                  <>
                    <IconArrowUp className="size-4 mr-2" />
                    Oldest First
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : existingSummaries.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <IconFileText className="size-12 mx-auto mb-4 opacity-50" />
              <p>No summaries generated yet</p>
              <p className="text-sm mt-2">Select a date above to generate your first summary</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Show generating placeholder if actively generating */}
              {generatingDate && (
                <div className="flex items-center justify-between p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-3">
                    <IconLoader2 className="size-5 animate-spin text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Generating Summary...
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {(() => {
                          const [year, month, day] = generatingDate.split('-').map(Number)
                          const date = new Date(year, month - 1, day)
                          return date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        })()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    In Progress
                  </span>
                </div>
              )}

              {sortedSummaries.map((summary) => (
                <div
                  key={summary.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/dashboard/summary/${summary.date}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {(() => {
                        const [year, month, day] = summary.date.split('-').map(Number)
                        const date = new Date(year, month - 1, day)
                        const formattedDate = date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                        // Only show version for versions 2+
                        return summary.version > 1 ? `${formattedDate} - Version ${summary.version}` : formattedDate
                      })()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Generated on {new Date(summary.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF(summary)}
                    >
                      <IconDownload className="size-4 mr-2" />
                      PDF
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Summary?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this summary version.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSummary(summary.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
