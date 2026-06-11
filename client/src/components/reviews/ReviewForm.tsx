import { useState } from 'react'
import { Send } from 'lucide-react'
import { createReview } from '../../api/reviews'
import FormActions from '../ui/FormActions'
import StarRating from './StarRating'
import type { Review } from '../../types'

interface ReviewFormProps {
  packageId: number
  onSubmitted: (review: Review) => void
}

export default function ReviewForm({ packageId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const review = await createReview({
        tourPackageId: packageId,
        rating,
        comment: comment || undefined,
      })
      setComment('')
      setRating(5)
      onSubmitted(review)
    } catch (err) {
      const response = typeof err === 'object' && err && 'response' in err
        ? (err as { response?: { data?: unknown; status?: number } }).response
        : undefined

      if (response?.status === 403) {
        setError('Admins cannot submit package reviews.')
      } else if (typeof response?.data === 'string') {
        setError(response.data)
      } else {
        setError('Could not submit your review. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Share your review</h3>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label>Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="form-row">
        <label htmlFor="review-comment">Comment</label>
        <textarea
          id="review-comment"
          rows={4}
          maxLength={1000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell other travelers what stood out."
        />
        <span className="field-hint">{comment.length}/1000 characters</span>
      </div>

      <FormActions align="start">
        <button type="submit" className="btn-cta icon-text" disabled={submitting}>
          <Send size={17} aria-hidden />
          {submitting ? 'Submitting...' : 'Post review'}
        </button>
      </FormActions>
    </form>
  )
}
