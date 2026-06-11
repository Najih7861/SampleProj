import type { Review } from '../../types'
import StarRating from './StarRating'

interface Props {
  reviews: Review[]
  // Whether the current user may delete a given review (own review, or admin).
  canDelete?: (review: Review) => boolean
  onDelete?: (id: number) => void
}

export default function ReviewList({ reviews, canDelete, onDelete }: Props) {
  if (reviews.length === 0) {
    return <p className="muted">No reviews yet. Be the first to share your experience!</p>
  }

  return (
    <ul className="review-list">
      {reviews.map((r) => (
        <li key={r.id} className="review-item">
          <div className="review-head">
            <strong>{r.username || 'Traveler'}</strong>
            <StarRating value={r.rating} size="sm" />
            <span className="muted review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
            {canDelete?.(r) && onDelete && (
              <button className="btn-ghost btn-sm review-delete" onClick={() => onDelete(r.id)}>
                Delete
              </button>
            )}
          </div>
          {r.comment && <p className="review-comment">{r.comment}</p>}
        </li>
      ))}
    </ul>
  )
}
