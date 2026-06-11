import { useEffect, useState } from 'react'
import { deleteReview, getPackageRatingSummary, getPackageReviews } from '../../api/reviews'
import { useAuth } from '../../auth/AuthContext'
import type { RatingSummary, Review } from '../../types'
import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'
import StarRating from './StarRating'

interface Props {
  packageId: number
}

// Self-contained reviews section for the package details page: rating summary,
// list, and (for signed-in users) the submit form. Additive — drops into
// PackageDetails with a single tag.
export default function PackageReviews({ packageId }: Props) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<RatingSummary>({ averageRating: 0, reviewCount: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([getPackageReviews(packageId), getPackageRatingSummary(packageId)])
      .then(([list, sum]) => {
        if (active) {
          setReviews(list)
          setSummary(sum)
        }
      })
      .catch(() => {
        /* reviews are non-critical to the page; fail quietly */
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [packageId])

  function handleSubmitted(review: Review) {
    setReviews((prev) => [review, ...prev])
    setSummary((prev) => {
      const count = prev.reviewCount + 1
      const avg = (prev.averageRating * prev.reviewCount + review.rating) / count
      return { averageRating: Math.round(avg * 10) / 10, reviewCount: count }
    })
  }

  function handleDelete(id: number) {
    if (!window.confirm('Delete this review?')) return
    const removed = reviews.find((r) => r.id === id)
    deleteReview(id)
      .then(() => {
        setReviews((prev) => prev.filter((r) => r.id !== id))
        if (!removed) return
        setSummary((prev) => {
          const count = Math.max(0, prev.reviewCount - 1)
          const avg =
            count === 0 ? 0 : (prev.averageRating * prev.reviewCount - removed.rating) / count
          return { averageRating: Math.round(avg * 10) / 10, reviewCount: count }
        })
      })
      .catch(() => window.alert('Could not delete the review. Please try again.'))
  }

  const isAdmin = user?.role === 'Admin'
  const canDelete = (r: Review) => isAdmin || (user != null && r.userId === user.id)

  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <h2>Reviews</h2>
        {summary.reviewCount > 0 && (
          <span className="reviews-summary">
            <StarRating value={summary.averageRating} />
            <strong>{summary.averageRating.toFixed(1)}</strong>
            <span className="muted">({summary.reviewCount})</span>
          </span>
        )}
      </div>

      {loading ? (
        <p className="center-msg">Loading reviews…</p>
      ) : (
        <ReviewList reviews={reviews} canDelete={canDelete} onDelete={handleDelete} />
      )}

      {user && <ReviewForm packageId={packageId} onSubmitted={handleSubmitted} />}
    </section>
  )
}
