/**
 * FilteredArticlesTable Component
 *
 * Displays a table of articles filtered by classification.
 * Clicking a row opens a modal with full article details.
 * Supports pagination and sorting.
 *
 * Columns: Classification, Title, Date Published, Source, Link (clickable)
 * Modal shows: Classification, Explanation, Reasoning
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconExternalLink, IconX, IconChevronUp, IconChevronDown, IconSelector, IconDownload, IconStar, IconStarFilled, IconSearch, IconFilter } from "@tabler/icons-react"
import type { Article } from "@/lib/types"
import { jsPDF } from "jspdf"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FilteredArticlesTableProps {
  articles: Article[]
  classification?: 'Threat' | 'Opportunity' | 'Neutral' | 'All' | 'Backlog' | 'User Uploaded' | 'Starred'
}

type SortField = 'classification' | 'title' | 'date_published' | 'source'
type SortDirection = 'asc' | 'desc' | null

export function FilteredArticlesTable({ articles, classification = 'All' }: FilteredArticlesTableProps) {
  const router = useRouter()
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(30)
  const [sortField, setSortField] = React.useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)
  const [searchTerm, setSearchTerm] = React.useState('')

  // Filter states
  const [sourceFilter, setSourceFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [dateFromFilter, setDateFromFilter] = React.useState<string>('')
  const [dateToFilter, setDateToFilter] = React.useState<string>('')
  const [showFilters, setShowFilters] = React.useState(false)

  // Track starred status locally for optimistic UI updates
  const [starredArticles, setStarredArticles] = React.useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {}
    articles.forEach(article => {
      initial[article.id] = article.starred
    })
    return initial
  })

  // Update starred articles when articles prop changes
  React.useEffect(() => {
    const updated: Record<number, boolean> = {}
    articles.forEach(article => {
      updated[article.id] = article.starred
    })
    setStarredArticles(updated)
  }, [articles])

  // Toggle starred status
  const toggleStar = async (articleId: number, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent row click

    const wasStarred = starredArticles[articleId]
    const willBeStarred = !wasStarred

    // Optimistic update
    setStarredArticles(prev => ({
      ...prev,
      [articleId]: willBeStarred
    }))

    try {
      const response = await fetch(`/api/articles/${articleId}/star`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        // Revert on error
        setStarredArticles(prev => ({
          ...prev,
          [articleId]: wasStarred
        }))
        toast.error('Failed to update article')
      } else {
        // Show success toast
        if (willBeStarred) {
          toast.success('Article starred')
        } else {
          toast.success('Article unstarred')
        }

        // Refresh the page data - revalidatePath on server clears cache
        router.refresh()
      }
    } catch (error) {
      // Revert on error
      setStarredArticles(prev => ({
        ...prev,
        [articleId]: wasStarred
      }))
      toast.error('Failed to update article')
      console.error('Error toggling star:', error)
    }
  }

  // Function to generate and download PDF
  const downloadPDF = () => {
    if (!selectedArticle) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const maxWidth = pageWidth - 2 * margin
    const bottomMargin = 20 // Space to leave at bottom of page
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
      const totalHeight = lines.length * lineHeight

      // Check if we need to split across pages
      for (let i = 0; i < lines.length; i++) {
        checkPageOverflow(lineHeight + 5)
        doc.text(lines[i], margin, yPosition)
        yPosition += lineHeight
      }

      yPosition += 5 // Add some spacing after text block
    }

    // Add title
    addText(selectedArticle.title, 16, true)

    // Add published date
    const publishedDate = selectedArticle.date_published
      ? new Date(selectedArticle.date_published).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Unknown'
    addText(`Published: ${publishedDate}`, 10)
    yPosition += 5

    // Add classification
    addText('Classification', 12, true)
    addText(selectedArticle.classification || 'Unknown', 11)
    yPosition += 5

    // Add Advice
    addText('Advice', 12, true)
    addText(selectedArticle.advice || 'No advice available', 11)
    yPosition += 5

    // Add LLM Explanation
    if (selectedArticle.explanation) {
      addText('LLM Explanation', 12, true)
      addText(selectedArticle.explanation, 11)
      yPosition += 5
    }

    // Add LLM Reasoning
    if (selectedArticle.reasoning) {
      addText('LLM Reasoning', 12, true)
      addText(selectedArticle.reasoning, 11)
      yPosition += 5
    }

    // Add source
    checkPageOverflow(15)
    addText(`Source: ${selectedArticle.source || 'Unknown'}`, 10)

    // Add link
    checkPageOverflow(15)
    addText(`Link: ${selectedArticle.link}`, 9)

    // Generate filename from title (sanitize it)
    const filename = `${selectedArticle.title.substring(0, 50).replace(/[^a-z0-9]/gi, '_')}.pdf`

    // Download the PDF
    doc.save(filename)
  }

  // Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  // Sort articles
  const sortedArticles = React.useMemo(() => {
    if (!sortField || !sortDirection) return articles

    return [...articles].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      // Compare
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [articles, sortField, sortDirection])

  // Extract unique sources and statuses for filter dropdowns
  const uniqueSources = React.useMemo(() => {
    const sources = new Set<string>()
    articles.forEach(article => {
      if (article.source) sources.add(article.source)
    })
    return Array.from(sources).sort()
  }, [articles])

  const uniqueStatuses = React.useMemo(() => {
    const statuses = new Set<string>()
    articles.forEach(article => {
      if (article.status) statuses.add(article.status)
    })
    return Array.from(statuses).sort()
  }, [articles])

  // Filter articles based on starred status, search term, and filters
  const filteredArticles = React.useMemo(() => {
    let filtered = sortedArticles

    // On starred page, filter out articles that have been unstarred
    if (classification === 'Starred') {
      filtered = filtered.filter(article => starredArticles[article.id] === true)
    }

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(lowerSearchTerm)
      )
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(article => article.source === sourceFilter)
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === statusFilter)
    }

    // Apply date range filter
    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter)
      filtered = filtered.filter(article => {
        if (!article.date_published) return false
        const articleDate = new Date(article.date_published)
        return articleDate >= fromDate
      })
    }

    if (dateToFilter) {
      const toDate = new Date(dateToFilter)
      toDate.setHours(23, 59, 59, 999) // Include the entire day
      filtered = filtered.filter(article => {
        if (!article.date_published) return false
        const articleDate = new Date(article.date_published)
        return articleDate <= toDate
      })
    }

    return filtered
  }, [sortedArticles, starredArticles, classification, searchTerm, sourceFilter, statusFilter, dateFromFilter, dateToFilter])

  // Pagination logic
  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredArticles.length / pageSize)
  const startIndex = pageSize === -1 ? 0 : (currentPage - 1) * pageSize
  const endIndex = pageSize === -1 ? filteredArticles.length : startIndex + pageSize
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

  // Reset to first page when page size changes
  const handlePageSizeChange = (value: string) => {
    setPageSize(value === 'all' ? -1 : parseInt(value))
    setCurrentPage(1)
  }

  // Reset to first page when search term or filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sourceFilter, statusFilter, dateFromFilter, dateToFilter])

  // Clear all filters
  const clearFilters = () => {
    setSourceFilter('all')
    setStatusFilter('all')
    setDateFromFilter('')
    setDateToFilter('')
  }

  // Check if any filters are active
  const hasActiveFilters = sourceFilter !== 'all' || statusFilter !== 'all' || dateFromFilter !== '' || dateToFilter !== ''

  // Helper to render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <IconSelector className="size-4 ml-1 text-muted-foreground" />
    }
    if (sortDirection === 'asc') {
      return <IconChevronUp className="size-4 ml-1" />
    }
    return <IconChevronDown className="size-4 ml-1" />
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search and Pagination controls - Top - Always visible */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side: Search box and filter button */}
          <div className="flex items-center gap-2 order-1">
            <div className="relative w-full sm:w-64">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <IconFilter className="size-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-white" />
              )}
            </Button>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          {/* Right side: Rows per page */}
          <div className="flex items-center gap-2 order-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={pageSize === -1 ? 'all' : pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters - Collapsible */}
        {showFilters && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-xs"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Source Filter */}
                <div className="space-y-2">
                  <Label htmlFor="source-filter" className="text-xs text-muted-foreground">
                    Source
                  </Label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger id="source-filter" className="h-9">
                      <SelectValue placeholder="All sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sources</SelectItem>
                      {uniqueSources.map(source => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-xs text-muted-foreground">
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter" className="h-9">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {uniqueStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From Filter */}
                <div className="space-y-2">
                  <Label htmlFor="date-from-filter" className="text-xs text-muted-foreground">
                    Published from
                  </Label>
                  <Input
                    id="date-from-filter"
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Date To Filter */}
                <div className="space-y-2">
                  <Label htmlFor="date-to-filter" className="text-xs text-muted-foreground">
                    Published to
                  </Label>
                  <Input
                    id="date-to-filter"
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show empty state if no filtered articles */}
        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
            <p className="text-muted-foreground text-lg">
              {searchTerm.trim()
                ? `No articles matching "${searchTerm}"`
                : `No ${classification?.toLowerCase()} articles found`}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {searchTerm.trim()
                ? 'Try a different search term'
                : classification === 'Starred'
                ? 'Star some articles to see them here'
                : 'Run your Python script to fetch and classify more articles'}
            </p>
          </div>
        ) : (
          <>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-32">
                  <button
                    onClick={() => handleSort('classification')}
                    className="flex items-center hover:text-foreground"
                  >
                    Classification
                    <SortIcon field="classification" />
                  </button>
                </TableHead>
                <TableHead className="w-12 text-center">
                  <IconStar className="size-4 mx-auto" />
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center hover:text-foreground"
                  >
                    Title
                    <SortIcon field="title" />
                  </button>
                </TableHead>
                <TableHead className="w-40">
                  <button
                    onClick={() => handleSort('date_published')}
                    className="flex items-center hover:text-foreground"
                  >
                    Date Published
                    <SortIcon field="date_published" />
                  </button>
                </TableHead>
                <TableHead className="w-32">
                  <button
                    onClick={() => handleSort('source')}
                    className="flex items-center hover:text-foreground"
                  >
                    Source
                    <SortIcon field="source" />
                  </button>
                </TableHead>
                <TableHead className="w-16">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedArticles.map((article) => (
              <TableRow
                key={article.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedArticle(article)}
              >
                {/* Classification Badge */}
                <TableCell>
                  <ClassificationBadge classification={article.classification} />
                </TableCell>

                {/* Star Button */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => toggleStar(article.id, e)}
                    className="flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label={starredArticles[article.id] ? "Unstar article" : "Star article"}
                  >
                    {starredArticles[article.id] ? (
                      <IconStarFilled className="size-5 text-yellow-500" />
                    ) : (
                      <IconStar className="size-5 text-muted-foreground hover:text-yellow-500" />
                    )}
                  </button>
                </TableCell>

                {/* Article Title */}
                <TableCell>
                  <div className="font-medium line-clamp-2">{article.title}</div>
                </TableCell>

                {/* Published Date */}
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {article.date_published
                      ? new Date(article.date_published).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Unknown'}
                  </span>
                </TableCell>

                {/* Source */}
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {article.source || 'Unknown'}
                  </span>
                </TableCell>

                {/* External Link */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    asChild
                  >
                    <Link
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open article"
                    >
                      <IconExternalLink className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls - Bottom */}
      {pageSize !== -1 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      )}
          </>
        )}
    </div>

      {/* Article Detail Modal */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0">
          <div className="px-6 pt-6">
            <DialogHeader>
              <DialogTitle className="text-xl pr-8">
                {selectedArticle?.title}
              </DialogTitle>
              <DialogDescription>
                Published: {selectedArticle?.date_published
                  ? new Date(selectedArticle.date_published).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Unknown'}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Classification */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Classification</h3>
              <ClassificationBadge classification={selectedArticle?.classification || ''} />
            </div>

            {/* Advice */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Advice</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedArticle?.advice || 'No advice available'}
              </p>
            </div>

            {/* Explanation */}
            {selectedArticle?.explanation && (
              <div>
                <h3 className="text-sm font-semibold mb-2">LLM Explanation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedArticle.explanation}
                </p>
              </div>
            )}

            {/* Reasoning */}
            {selectedArticle?.reasoning && (
              <div>
                <h3 className="text-sm font-semibold mb-2">LLM Reasoning</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.reasoning}
                </p>
              </div>
            )}
          </div>

          {/* Sticky bottom section - Source and Link */}
          <div className="border-t bg-background px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Source: <span className="font-medium">{selectedArticle?.source || 'Unknown'}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <IconDownload className="size-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={selectedArticle?.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconExternalLink className="size-4 mr-2" />
                  Read Full Article
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Helper component to display classification badge with appropriate styling
 */
function ClassificationBadge({
  classification,
}: {
  classification: Article['classification']
}) {
  // Map classifications to colors and labels
  const config = {
    Threat: {
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      label: 'Threat',
    },
    Opportunity: {
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      label: 'Opportunity',
    },
    Neutral: {
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      label: 'Neutral',
    },
    'Error: Unknown': {
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      label: 'Error',
    },
    '': {
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      label: 'Pending',
    },
  }

  const { className, label } = config[classification] || config['']

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}
