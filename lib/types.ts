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

// Criticality score details (breakdown of individual scores)
export interface CriticalityScoreDetail {
  correctness_factual_soundness: number
  relevance_alignment: number
  reasoning_transparency: number
  practical_usefulness_actionability: number
  clarity_communication_quality: number
  safety_bias_appropriateness: number
  correctness_factual_soundness_explanation: string | null
  relevance_alignment_explanation: string | null
  reasoning_transparency_explanation: string | null
  practical_usefulness_actionability_explanation: string | null
  clarity_communication_quality_explanation: string | null
  safety_bias_appropriateness_explanation: string | null
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
  classification_summary: string | null
  date_published: string | null
  classification_date: string | null
  status: string
  starred: boolean
  criti_score: number | null
  criti_explanation: string | null
  criti_status: string
  criticality_detail: CriticalityScoreDetail | null
  user_rating?: number | null
  user_review?: string | null
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
  reviewedThreatsOpps: number
  newThreatsOpps: number
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
