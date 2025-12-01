/**
 * Dashboard Mini Table Component
 *
 * Displays a compact table with classification badges and titles
 * Used for preview tables on the main dashboard
 */

'use client'

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Article } from "@/lib/types"

interface DashboardMiniTableProps {
  articles: Article[]
  limit?: number
  viewAllHref: string
}

/**
 * Helper component to display classification badge with appropriate styling
 */
function ClassificationBadge({ classification }: { classification: string | null }) {
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
    '': {
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      label: 'Pending',
    },
  }

  const { className, label } = config[classification || ''] || config['']

  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}

export function DashboardMiniTable({ articles, limit = 3, viewAllHref }: DashboardMiniTableProps) {
  const displayArticles = articles.slice(0, limit)

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No articles found</p>
        <Button variant="default" size="sm" asChild className="mt-4 w-full">
          <Link href={viewAllHref}>View All</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable table container */}
      <div className="flex-1 overflow-y-auto border rounded-lg">
        <Table>
          <TableHeader className="sticky top-0 bg-muted z-10">
            <TableRow>
              <TableHead className="w-32">Classification</TableHead>
              <TableHead>Title</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayArticles.map((article) => (
              <TableRow
                key={article.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  window.location.href = `/dashboard/articles/${article.id}`
                }}
              >
                <TableCell>
                  <ClassificationBadge classification={article.classification} />
                </TableCell>
                <TableCell>
                  <div className="font-medium line-clamp-2">{article.title}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View All Button */}
      <div className="pt-3 px-4">
        <Button variant="default" size="sm" asChild className="w-full">
          <Link href={viewAllHref}>View All</Link>
        </Button>
      </div>
    </div>
  )
}
