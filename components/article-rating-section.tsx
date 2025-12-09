/**
 * Article Rating Section Component
 *
 * Allows users to rate and review article classifications
 * Loads existing ratings and allows updates
 */

"use client"

import * as React from "react"
import { IconStar, IconStarFilled } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ArticleRatingSectionProps {
  articleId: number
}

export function ArticleRatingSection({ articleId }: ArticleRatingSectionProps) {
  const [rating, setRating] = React.useState(0)
  const [hoverRating, setHoverRating] = React.useState(0)
  const [reviewText, setReviewText] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasExistingRating, setHasExistingRating] = React.useState(false)

  // Load existing rating on mount
  React.useEffect(() => {
    loadExistingRating()
  }, [articleId])

  const loadExistingRating = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/articles/ratings?articleId=${articleId}`)

      if (response.ok) {
        const data = await response.json()
        if (data.rating) {
          setRating(data.rating.rating)
          setReviewText(data.rating.review || '')
          setHasExistingRating(true)
        } else {
          setRating(0)
          setReviewText('')
          setHasExistingRating(false)
        }
      } else {
        setRating(0)
        setReviewText('')
        setHasExistingRating(false)
      }
    } catch (error) {
      console.error('Error loading rating:', error)
      setRating(0)
      setReviewText('')
      setHasExistingRating(false)
    } finally {
      setIsLoading(false)
    }
  }

  const submitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/articles/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          rating,
          review: reviewText.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit rating')
      }

      setHasExistingRating(true)
      toast.success('Rating submitted successfully!')
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('Failed to submit rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading rating...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-semibold mb-4">
          {hasExistingRating ? 'Your Rating' : 'Rate This Classification'}
        </h3>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating (out of 10)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  disabled={isSubmitting}
                >
                  {(hoverRating >= star || rating >= star) ? (
                    <IconStarFilled className="size-7 text-yellow-500" />
                  ) : (
                    <IconStar className="size-7 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                You rated: {rating} out of 10
              </p>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review-text" className="text-sm font-medium">
              Explain shortly why this classification was (not) useful
            </Label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Optional: Share your feedback about this classification..."
              className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={submitRating}
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : hasExistingRating ? 'Update Rating' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
