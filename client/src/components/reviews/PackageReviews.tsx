import { useEffect, useState } from 'react'
import { Loader2, LogIn, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPackageReviews, getPackageReviewSummary } from '../../api/reviews'
import { useAuth } from '../../auth/AuthContext'
import DataState from '../ui/DataState'
import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'
import StarRating from './StarRating'
import type { Review, ReviewSummary } from '../../types'

interface PackageReviewsProps {
  packageId: number
}

export default function PackageReviews({ packageId }: PackageReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<ReviewSummary>({ averageRating: 0, reviewCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadReviews() {
      try {
        const [list, nextSummary] = await Promise.all([
          getPackageReviews(packageId),
          getPackageReviewSummary(packageId),
        ])
        if (!active) return
        setReviews(list)
        setSummary(nextSummary)
        setError(null)
      } catch {
        if (active) setError('Could not load reviews right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadReviews()
    return () => { active = false }
  }, [packageId])

  function handleSubmitted(review: Review) {
    setReviews((prev) => [review, ...prev])
    setSummary((prev) => {
      const count = prev.reviewCount + 1
      const average = (prev.averageRating * prev.reviewCount + review.rating) / count
      return { reviewCount: count, averageRating: Math.round(average * 10) / 10 }
    })
  }

  const isAdmin = user?.role === 'Admin'

  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <div>
          <p className="eyebrow">Traveler reviews</p>
          <h2>What people are saying</h2>
        </div>
        {summary.reviewCount > 0 && (
          <div className="reviews-summary">
            <StarRating value={summary.averageRating} />
            <strong>{summary.averageRating.toFixed(1)}</strong>
            <span className="muted">({summary.reviewCount})</span>
          </div>
        )}
      </div>

      {loading && (
        <DataState icon={<Loader2 className="spin" size={26} />} message="Loading reviews..." />
      )}
      {error && (
        <DataState tone="error" title="Reviews unavailable" message={error} />
      )}
      {!loading && !error && <ReviewList reviews={reviews} />}

      {!loading && !error && (
        <div className="review-submit-panel">
          {!user && (
            <div className="review-gate">
              <h3>Want to leave a review?</h3>
              <p className="muted">Log in with a traveler account to rate this package.</p>
              <Link to="/auth" state={{ from: `/packages/${packageId}` }} className="btn-primary icon-text">
                <LogIn size={17} aria-hidden />
                Log in to review
              </Link>
            </div>
          )}
          {user && isAdmin && (
            <div className="review-gate review-gate-admin">
              <ShieldAlert size={24} aria-hidden />
              <div>
                <h3>Admin reviews are disabled</h3>
                <p className="muted">Admins can read traveler reviews but cannot submit them.</p>
              </div>
            </div>
          )}
          {user && !isAdmin && <ReviewForm packageId={packageId} onSubmitted={handleSubmitted} />}
        </div>
      )}
    </section>
  )
}
