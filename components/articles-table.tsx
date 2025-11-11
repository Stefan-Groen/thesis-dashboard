/**
 * ArticlesTable Component
 *
 * Displays a table of classified articles.
 * Simpler version focused on article data.
 *
 * This component receives articles as props and displays them in a table.
 *
 * Python equivalent:
 * ```python
 * def articles_table(articles: List[Article]):
 *     return render_template('table.html', articles=articles)
 * ```
 */

"use client"

import * as React from "react"
import { IconAlertTriangle, IconSparkles, IconCircle, IconExternalLink } from "@tabler/icons-react"
import type { Article } from "@/lib/types"

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

interface ArticlesTableProps {
  articles: Article[]
}

export function ArticlesTable({ articles }: ArticlesTableProps) {
  // If no articles, show a message
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-muted-foreground text-lg">No articles found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Run your Python script to fetch and classify articles
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-12">Classification</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-32">Source</TableHead>
            <TableHead className="w-40">Published</TableHead>
            <TableHead className="w-16">Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id} className="hover:bg-muted/50">
              {/* Classification Badge */}
              <TableCell>
                <ClassificationBadge classification={article.classification} />
              </TableCell>

              {/* Article Title & Summary */}
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="font-medium line-clamp-2">{article.title}</div>
                  {article.summary && (
                    <div className="text-muted-foreground text-sm line-clamp-2">
                      {article.summary}
                    </div>
                  )}
                  {article.explanation && (
                    <div className="text-muted-foreground text-xs italic mt-1 line-clamp-2">
                      LLM: {article.explanation}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Source */}
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {article.source || 'Unknown'}
                </span>
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

              {/* External Link */}
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  asChild
                >
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open article"
                  >
                    <IconExternalLink className="size-4" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
  // Map classifications to colors and icons
  const config = {
    Threat: {
      icon: IconAlertTriangle,
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      label: 'Threat',
    },
    Opportunity: {
      icon: IconSparkles,
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      label: 'Opportunity',
    },
    Neutral: {
      icon: IconCircle,
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      label: 'Neutral',
    },
    'Error: Unknown': {
      icon: IconCircle,
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      label: 'Error',
    },
    '': {
      icon: IconCircle,
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      label: 'Pending',
    },
  }

  const { icon: Icon, className, label } = config[classification] || config['']

  return (
    <Badge variant="secondary" className={className}>
      <Icon className="size-3 mr-1" />
      {label}
    </Badge>
  )
}
