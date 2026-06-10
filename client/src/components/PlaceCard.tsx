import { useNavigate } from 'react-router-dom'
import PlaceSlideshow from './PlaceSlideshow'
import type { Place } from '../types'

// A place on the user Home: auto-slideshow + detailed description + Book Now
// (which opens Explore filtered to this place's packages).
export default function PlaceCard({ place }: { place: Place }) {
  const navigate = useNavigate()
  const bookable = place.packages.some((p) => p.isAvailable)

  return (
    <article className="place-card">
      <PlaceSlideshow images={place.images} alt={place.name} />
      <div className="place-card-body">
        <h2>{place.name}</h2>
        <p className="place-desc">{place.description}</p>
        <div className="place-card-footer">
          <span className="muted">
            {place.packages.length} tour{place.packages.length === 1 ? '' : 's'} available
          </span>
          <button
            type="button"
            className="btn-cta"
            disabled={!bookable}
            onClick={() => navigate(`/explore?placeId=${place.id}`)}
          >
            {bookable ? 'Book Now' : 'Coming soon'}
          </button>
        </div>
      </div>
    </article>
  )
}
