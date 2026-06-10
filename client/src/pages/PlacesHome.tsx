import { useEffect, useState } from 'react'
import { getPlaces } from '../api/places'
import PlaceCard from '../components/PlaceCard'
import type { Place } from '../types'

// User Home: a showcase of destinations, each with an auto-advancing photo
// slideshow, a detailed description, and a Book Now button.
export default function PlacesHome() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getPlaces()
      .then((data) => { if (active) setPlaces(data) })
      .catch(() => { if (active) setError('Could not load destinations. Is the API running?') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <>
      <section className="hero-banner">
        <div className="container">
          <h1>Explore breathtaking destinations</h1>
          <p>Browse our handpicked places, then book the tour that's right for you.</p>
        </div>
      </section>

      <div className="page">
        <div className="container">
          {loading && <p className="center-msg">Loading destinations…</p>}
          {error && <div className="notice notice-error">{error}</div>}
          {!loading && !error && places.length === 0 && (
            <p className="center-msg">No destinations yet. Check back soon.</p>
          )}

          <div className="place-list">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
