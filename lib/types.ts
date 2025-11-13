/**
 * TypeScript Type Definitions
 *
 * These define the shape of our data (like Python's dataclasses or TypedDicts)
 *
 * Python equivalent:
 * ```python
 * from dataclasses import dataclass
 *
 * @dataclass
 * class Stats:
 *     total: int
 *     threats: int
 *     opportunities: int
 *     neutral: int
 *     unclassified: int
 * ```
 */

// Dashboard statistics
export interface Stats {
  total: number
  threats: number
  opportunities: number
  neutral: number
  unclassified: number
  articlesToday: number
  starred: number
}

// Article from database
export interface Article {
  id: number
  title: string
  link: string
  summary: string | null
  source: string | null
  classification: 'Threat' | 'Opportunity' | 'Neutral' | 'Error: Unknown' | ''
  explanation: string | null
  reasoning: string | null
  advice: string | null
  date_published: string | null
  classification_date: string | null
  status: string
  starred: boolean
}

// Chart data point (for bar chart - threats, opportunities, and neutral)
export interface ChartDataPoint {
  date: string
  threats: number
  opportunities: number
  neutral: number
}

// Activity data point (for line chart - published vs classified)
export interface ActivityDataPoint {
  date: string
  published: number
  classified: number
}

// Dashboard metrics
export interface Metrics {
  backlog: number
  serviceLevel: number
  ownArticles: number
}

// API response types
export interface ArticlesResponse {
  articles: Article[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}
