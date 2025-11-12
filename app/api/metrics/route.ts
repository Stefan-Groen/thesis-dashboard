/**
 * API Route: /api/metrics
 *
 * Returns dashboard metrics:
 * - backlog: Number of articles pending classification
 * - serviceLevel: Percentage of articles classified within 6 hours
 * - ownArticles: Count of user-uploaded articles
 */

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    // Backlog: Articles with empty classification or status PENDING (excluding OUTDATED)
    const backlogSql = `
      SELECT COUNT(*) as count
      FROM articles
      WHERE (classification = '' OR classification IS NULL OR status = 'PENDING')
      AND classification != 'OUTDATED' AND status != 'OUTDATED';
    `

    // Service Level: Percentage classified within 6 hours (excluding OUTDATED status)
    const serviceLevelSql = `
      SELECT
        COUNT(*) FILTER (
          WHERE classification_date IS NOT NULL
          AND date_published IS NOT NULL
          AND (classification_date - date_published) <= INTERVAL '6 hours'
        ) as within_sla,
        COUNT(*) FILTER (
          WHERE classification_date IS NOT NULL
          AND date_published IS NOT NULL
        ) as total_classified
      FROM articles
      WHERE status != 'OUTDATED' AND classification != 'OUTDATED';
    `

    // Own Articles: Articles with source 'imported', 'uploaded', or 'uploaded by {username}' (excluding OUTDATED)
    const ownArticlesSql = `
      SELECT COUNT(*) as count
      FROM articles
      WHERE (source IN ('imported', 'uploaded') OR source LIKE 'uploaded by %')
      AND classification != 'OUTDATED' AND status != 'OUTDATED';
    `

    const [backlogResult, serviceLevelResult, ownArticlesResult] = await Promise.all([
      query(backlogSql),
      query(serviceLevelSql),
      query(ownArticlesSql)
    ])

    const backlog = Number(backlogResult.rows[0]?.count || 0)
    const withinSla = Number(serviceLevelResult.rows[0]?.within_sla || 0)
    const totalClassified = Number(serviceLevelResult.rows[0]?.total_classified || 0)
    const serviceLevel = totalClassified > 0 ? (withinSla / totalClassified) * 100 : 0
    const ownArticles = Number(ownArticlesResult.rows[0]?.count || 0)

    return NextResponse.json({
      backlog,
      serviceLevel: Math.round(serviceLevel * 10) / 10, // Round to 1 decimal
      ownArticles,
    })

  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
