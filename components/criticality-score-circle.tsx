/**
 * Criticality Score Circle Component
 *
 * Displays a circular progress indicator showing the criticality score.
 * On click, shows a modal dialog with detailed breakdown of all scores and explanation.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { IconDownload, IconInfoCircle } from '@tabler/icons-react'
import { jsPDF } from 'jspdf'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [isOpen, setIsOpen] = React.useState(false)

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
    <>
      <div
        className="relative cursor-pointer hover:opacity-80 transition-opacity"
        style={{ width: size, height: size }}
        onClick={() => setIsOpen(true)}
      >
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0">
          <div className="px-6 pt-6">
            <DialogHeader>
              <DialogTitle className="text-xl pr-8">
                Criticality Score: {Math.round(score)}
              </DialogTitle>
              <DialogDescription>
                {articleTitle || 'Detailed breakdown of the criticality score'}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="space-y-4">
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Info link */}
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/criticality_score" target="_blank">
                  <IconInfoCircle className="h-4 w-4 mr-2" />
                  Learn More
                </Link>
              </Button>
              {/* Download PDF */}
              {detail && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                >
                  <IconDownload className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>

            {/* Detailed scores with individual explanations */}
            {detail && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Detailed Breakdown</h3>
                <div className="space-y-4">
                  {/* Correctness & Factual Soundness */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.correctness_factual_soundness} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-sm font-semibold block">
                        Correctness & Factual Soundness
                      </span>
                      {detail.correctness_factual_soundness_explanation && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {detail.correctness_factual_soundness_explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Relevance & Alignment */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.relevance_alignment} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-sm font-semibold block">
                        Relevance & Alignment
                      </span>
                      {detail.relevance_alignment_explanation && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {detail.relevance_alignment_explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reasoning Transparency */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.reasoning_transparency} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-sm font-semibold block">
                        Reasoning Transparency
                      </span>
                      {detail.reasoning_transparency_explanation && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {detail.reasoning_transparency_explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Practical Usefulness & Actionability */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.practical_usefulness_actionability} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-sm font-semibold block">
                        Practical Usefulness & Actionability
                      </span>
                      {detail.practical_usefulness_actionability_explanation && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {detail.practical_usefulness_actionability_explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Clarity & Communication Quality */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.clarity_communication_quality} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-sm font-semibold block">
                        Clarity & Communication Quality
                      </span>
                      {detail.clarity_communication_quality_explanation && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {detail.clarity_communication_quality_explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Safety, Bias & Appropriateness */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    {/* Mini Circle */}
                    <div className="flex-shrink-0 pt-1">
                      <MiniCircle score={detail.safety_bias_appropriateness} />
                    </div>
                    {/* Factor and Explanation */}
                    <div className="flex-1 space-y-1">
                      <span className="text-sm font-semibold block">
                        Safety, Bias & Appropriateness
                      </span>
                      {detail.safety_bias_appropriateness_explanation && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
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
              <p className="text-sm text-muted-foreground italic">
                No detailed breakdown available
              </p>
            )}
          </div>
          </div>

          {/* Sticky bottom section - Close button */}
          <div className="border-t bg-background px-6 py-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
