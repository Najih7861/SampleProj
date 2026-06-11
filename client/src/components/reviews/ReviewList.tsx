import StarRating from './StarRating'
import type { Review } from '../../types'

interface ReviewListProps {
  reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="muted review-empty">No reviews yet. Be the first traveler to share one.</p>
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <article className="review-card" key={review.id}>
          <div className="review-card-header">
            <div>
              <h3>{review.username}</h3>
              <span className="muted">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <StarRating value={review.rating} />
          </div>
          {review.comment && <p>{review.comment}</p>}
        </article>
      ))}
    </div>
  )
}
