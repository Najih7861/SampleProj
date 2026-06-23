import { ArrowRight, Camera, Compass, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PlaceSlideshow from './PlaceSlideshow'
import { formatCurrency } from '../lib/format'
import type { Place } from '../types'

function fromPrice(place: Place) {
  const prices = place.packages
    .filter((pkg) => pkg.isAvailable)
    .map((pkg) => pkg.price)

  if (prices.length === 0) return null
  return Math.min(...prices)
}

export default function PlaceCard({ place }: { place: Place }) {
  const navigate = useNavigate()
  const bookable = place.packages.some((pkg) => pkg.isAvailable)
  const lowestPrice = fromPrice(place)

  return (
    <article className="place-card">
      <PlaceSlideshow images={place.images} alt={place.name} />
      <div className="place-card-body">
        <div className="place-card-kicker">
          <span><MapPin size={15} aria-hidden /> Featured destination</span>
          <span><Camera size={15} aria-hidden /> {place.images.length} photos</span>
        </div>
        <h2>{place.name}</h2>
        <p className="place-desc">{place.description}</p>

        <div className="place-card-summary">
          <span><Compass size={16} aria-hidden /> {place.packages.length} tour{place.packages.length === 1 ? '' : 's'}</span>
          {lowestPrice != null && <span>From {formatCurrency(lowestPrice)}</span>}
        </div>

        <div className="place-card-footer">
          <button
            type="button"
            className="btn-cta icon-text"
            disabled={!bookable}
            onClick={() => navigate(`/explore?placeId=${place.id}`)}
          >
            {bookable ? 'Book Now' : 'Coming soon'}
            {bookable && <ArrowRight size={17} aria-hidden />}
          </button>
        </div>
      </div>
    </article>
  )
}
