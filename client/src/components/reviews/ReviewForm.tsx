import { useState } from 'react'
import { Send } from 'lucide-react'
import { createReview } from '../../api/reviews'
import { authErrorMessage } from '../../api/auth'
import { useToast } from '../ui/toast/useToast'
import Button from '../ui/Button'
import FormActions from '../ui/FormActions'
import Textarea from '../ui/Textarea'
import StarRating from './StarRating'
import type { Review } from '../../types'

interface ReviewFormProps {
  packageId: number
  onSubmitted: (review: Review) => void
}

export default function ReviewForm({ packageId, onSubmitted }: ReviewFormProps) {
  const toast = useToast()
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
      toast.success('Thanks! Your review has been posted.')
      onSubmitted(review)
    } catch (err) {
      const status = typeof err === 'object' && err && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined

      if (status === 403) {
        setError('Admins cannot submit package reviews.')
      } else {
        setError(authErrorMessage(err, 'Could not submit your review. Please try again.'))
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

      <Textarea
        id="review-comment"
        label="Comment"
        rows={4}
        maxLength={1000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Tell other travelers what stood out."
        hint={`${comment.length}/1000 characters`}
      />

      <FormActions align="start">
        <Button type="submit" variant="cta" icon={<Send size={17} aria-hidden />} loading={submitting}>
          Post review
        </Button>
      </FormActions>
    </form>
  )
}
