interface Props {
  value: number
  // When provided, the stars become clickable (input mode).
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
}

const FULL = '★'
const EMPTY = '☆'

// Read-only star display by default; an interactive picker when onChange is set.
export default function StarRating({ value, onChange, size = 'md' }: Props) {
  const interactive = typeof onChange === 'function'

  return (
    <span
      className={`stars stars-${size}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) =>
        interactive ? (
          <button
            key={n}
            type="button"
            className="star-btn"
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={n <= value}
            onClick={() => onChange!(n)}
          >
            {n <= value ? FULL : EMPTY}
          </button>
        ) : (
          <span key={n} aria-hidden="true">
            {n <= Math.round(value) ? FULL : EMPTY}
          </span>
        ),
      )}
    </span>
  )
}
