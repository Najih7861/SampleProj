import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const rounded = Math.round(value)

  return (
    <span className="star-rating" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded
        if (!onChange) {
          return (
            <Star
              key={star}
              size={18}
              aria-hidden
              className={filled ? 'star-filled' : 'star-empty'}
            />
          )
        }

        return (
          <button
            key={star}
            type="button"
            className={`star-button ${filled ? 'star-filled' : 'star-empty'}`}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onClick={() => onChange(star)}
          >
            <Star size={20} aria-hidden />
          </button>
        )
      })}
    </span>
  )
}
