import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const rounded = Math.round(value)

  // Read-only display: fill class goes on the <Star> SVG so `fill: currentColor`
  // overrides lucide's fill="none" attribute.
  if (!onChange) {
    return (
      <span className="star-rating" aria-label={`${value.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            aria-hidden
            className={star <= rounded ? 'star-filled' : 'star-empty'}
          />
        ))}
      </span>
    )
  }

  // Interactive: the fill class must sit on the SVG (not the button) for the star
  // to actually fill. Hovering previews the rating.
  const active = hovered || rounded

  return (
    <span className="star-rating" role="radiogroup" aria-label="Select a rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="star-button"
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          aria-pressed={star <= rounded}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(0)}
        >
          <Star size={20} aria-hidden className={star <= active ? 'star-filled' : 'star-empty'} />
        </button>
      ))}
    </span>
  )
}
