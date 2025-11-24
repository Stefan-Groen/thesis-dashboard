/**
 * Criticality Score Circle Component
 *
 * Displays a circular progress indicator showing the criticality score.
 * On hover, shows a tooltip with detailed breakdown of all scores and explanation.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { IconDownload, IconInfoCircle } from '@tabler/icons-react'
import { jsPDF } from 'jspdf'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import type { CriticalityScoreDetail } from '@/lib/types'

interface CriticalityScoreCircleProps {
  score: number | null
  explanation: string | null
  detail: CriticalityScoreDetail | null
  articleTitle?: string
  size?: number
}

// Mini circle component for individual scores
function MiniCircle({ score, size = 32 }: { score: number; size?: number }) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fillPercentage = Math.max(0, Math.min(100, score))
  const offset = circumference - (fillPercentage / 100) * circumference

  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 75) return '#10b981' // green-500
    if (score >= 50) return '#f59e0b' // amber-500
    if (score >= 25) return '#f97316' // orange-500
    return '#ef4444' // red-500
  }

  const color = getColor(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {/* Score text in the center */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ fontSize: size / 3 }}
      >
        <span className="font-bold text-[10px]" style={{ color }}>
          {Math.round(score)}
        </span>
      </div>
    </div>
  )
}

export function CriticalityScoreCircle({
  score,
  explanation,
  detail,
  articleTitle,
  size = 60,
}: CriticalityScoreCircleProps) {
  // PDF download handler
  const handleDownloadPDF = () => {
    if (!detail || score === null) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPos = 20

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize)
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y)
      return y + (lines.length * fontSize * 0.5)
    }

    // Title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Criticality Score Report', margin, yPos)
    yPos += 10

    // Article title if provided
    if (articleTitle) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      yPos = addWrappedText(`Article: ${articleTitle}`, margin, yPos, pageWidth - 2 * margin, 12)
      yPos += 5
    }

    // Overall score
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Overall Criticality Score: ${Math.round(score)}`, margin, yPos)
    yPos += 10

    // Detailed breakdown
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Detailed Breakdown', margin, yPos)
    yPos += 8

    const categories = [
      { name: 'Correctness & Factual Soundness', score: detail.correctness_factual_soundness, explanation: detail.correctness_factual_soundness_explanation },
      { name: 'Relevance & Alignment', score: detail.relevance_alignment, explanation: detail.relevance_alignment_explanation },
      { name: 'Reasoning Transparency', score: detail.reasoning_transparency, explanation: detail.reasoning_transparency_explanation },
      { name: 'Practical Usefulness & Actionability', score: detail.practical_usefulness_actionability, explanation: detail.practical_usefulness_actionability_explanation },
      { name: 'Clarity & Communication Quality', score: detail.clarity_communication_quality, explanation: detail.clarity_communication_quality_explanation },
      { name: 'Safety, Bias & Appropriateness', score: detail.safety_bias_appropriateness, explanation: detail.safety_bias_appropriateness_explanation },
    ]

    categories.forEach((category) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      // Category name and score
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`${category.name}: ${category.score}`, margin, yPos)
      yPos += 6

      // Explanation
      if (category.explanation) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        yPos = addWrappedText(category.explanation, margin + 5, yPos, pageWidth - 2 * margin - 5, 9)
        yPos += 8
      } else {
        yPos += 3
      }
    })

    // Save the PDF
    const fileName = articleTitle
      ? `criticality-score-${articleTitle.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.pdf`
      : `criticality-score-${Date.now()}.pdf`
    doc.save(fileName)
  }

  // If no score, show a gray circle with "N/A"
  if (score === null || score === undefined) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xs font-semibold"
        style={{ width: size, height: size }}
      >
        N/A
      </div>
    )
  }

  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fillPercentage = Math.max(0, Math.min(100, score)) // Clamp between 0-100
  const offset = circumference - (fillPercentage / 100) * circumference

  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 75) return '#10b981' // green-500
    if (score >= 50) return '#f59e0b' // amber-500
    if (score >= 25) return '#f97316' // orange-500
    return '#ef4444' // red-500
  }

  const color = getColor(score)

  // Format field names for display
  const formatFieldName = (field: string): string => {
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative cursor-help" style={{ width: size, height: size }}>
            {/* Background circle */}
            <svg
              className="transform -rotate-90"
              width={size}
              height={size}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            >
              {/* Background track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
              />
              {/* Progress fill */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.5s ease-in-out',
                }}
              />
            </svg>
            {/* Score text in the center */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ fontSize: size / 3.5 }}
            >
              <span className="font-bold" style={{ color }}>
                {Math.round(score)}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          className="max-w-2xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg max-h-[600px] overflow-y-auto"
          onWheel={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="space-y-3">
            {/* Header with actions */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  Criticality Score: {Math.round(score)}
                </h4>
                <div className="flex items-center gap-2">
                  {/* Info link */}
                  <Link href="/dashboard/criticality_score" target="_blank">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Learn more about criticality scores"
                    >
                      <IconInfoCircle className="h-4 w-4" />
                    </Button>
                  </Link>
                  {/* Download PDF */}
                  {detail && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleDownloadPDF}
                      title="Download as PDF"
                    >
                      <IconDownload className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed scores with individual explanations */}
            {detail && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Detailed Breakdown
                </p>
                <div className="space-y-3">
                  {/* Correctness & Factual Soundness */}
                  <div className="flex items-start gap-3">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.correctness_factual_soundness} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                        Correctness & Factual Soundness
                      </span>
                      {detail.correctness_factual_soundness_explanation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {detail.correctness_factual_soundness_explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Relevance & Alignment */}
                  <div className="flex items-start gap-3">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.relevance_alignment} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                        Relevance & Alignment
                      </span>
                      {detail.relevance_alignment_explanation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {detail.relevance_alignment_explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reasoning Transparency */}
                  <div className="flex items-start gap-3">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.reasoning_transparency} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                        Reasoning Transparency
                      </span>
                      {detail.reasoning_transparency_explanation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {detail.reasoning_transparency_explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Practical Usefulness & Actionability */}
                  <div className="flex items-start gap-3">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.practical_usefulness_actionability} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                        Practical Usefulness & Actionability
                      </span>
                      {detail.practical_usefulness_actionability_explanation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {detail.practical_usefulness_actionability_explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Clarity & Communication Quality */}
                  <div className="flex items-start gap-3">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.clarity_communication_quality} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                        Clarity & Communication Quality
                      </span>
                      {detail.clarity_communication_quality_explanation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {detail.clarity_communication_quality_explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Safety, Bias & Appropriateness */}
                  <div className="flex items-start gap-3">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.safety_bias_appropriateness} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                        Safety, Bias & Appropriateness
                      </span>
                      {detail.safety_bias_appropriateness_explanation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {detail.safety_bias_appropriateness_explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* If no detail available */}
            {!detail && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                No detailed breakdown available
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
