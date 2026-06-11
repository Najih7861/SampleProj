import { useState } from 'react'
import { createReview } from '../../api/reviews'
import type { Review } from '../../types'
import StarRating from './StarRating'

interface Props {
  packageId: number
  onSubmitted: (review: Review) => void
}

// Lets a signed-in user submit a star rating + comment. The server enforces the
// "must have a confirmed booking" and "one review per package" rules; this form
// surfaces whatever message it returns.
export default function ReviewForm({ packageId, onSubmitted }: Props) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (rating < 1) {
      setError('Please pick a star rating.')
      return
    }
    setSubmitting(true)
    try {
      const review = await createReview({
        tourPackageId: packageId,
        rating,
        comment: comment || undefined,
      })
      onSubmitted(review)
      setRating(0)
      setComment('')
    } catch (err) {
      const data =
        typeof err === 'object' && err && 'response' in err
          ? (err as { response?: { data?: unknown } }).response?.data
          : null
      setError(
        typeof data === 'string' && data
          ? data
          : 'Could not submit your review. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form-card review-form" onSubmit={handleSubmit}>
      <h3>Write a review</h3>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label>Your rating</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="form-row">
        <label htmlFor="review-comment">Comment (optional)</label>
        <textarea
          id="review-comment"
          rows={3}
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you love about this tour?"
        />
      </div>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
