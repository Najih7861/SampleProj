import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Compass, Loader2, MapPinned, PlaneTakeoff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPlaces } from '../api/places'
import PlaceCard from '../components/PlaceCard'
import DataState from '../components/ui/DataState'
import PageHero from '../components/ui/PageHero'
import type { Place } from '../types'

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800'

export default function PlacesHome() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadPlaces() {
      try {
        const data = await getPlaces()
        if (!active) return
        setPlaces(data)
        setError(null)
      } catch {
        if (active) setError('Could not load destinations. Is the API running?')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPlaces()
    return () => { active = false }
  }, [])

  const heroImage = places.find((place) => place.images.length > 0)?.images[0] ?? FALLBACK_HERO
  const availableTours = useMemo(
    () => places.reduce((total, place) => total + place.packages.filter((pkg) => pkg.isAvailable).length, 0),
    [places],
  )

  return (
    <>
      <PageHero
        eyebrow="Curated journeys"
        title="Wanderlust Tours"
        description="Explore image-rich destinations, compare handpicked tour packages, and reserve the trip that fits your next escape."
        backgroundImage={heroImage}
        actions={(
          <>
            <Link to="/explore" className="btn-cta icon-text">
              Browse Tours <ArrowRight size={17} aria-hidden />
            </Link>
            <a href="#destinations" className="btn-ghost hero-secondary-action icon-text">
              View Destinations <MapPinned size={17} aria-hidden />
            </a>
          </>
        )}
        stats={(
          <>
            <span><Compass size={18} aria-hidden /> {places.length || 5} destinations</span>
            <span><PlaneTakeoff size={18} aria-hidden /> {availableTours || 5} bookable tours</span>
          </>
        )}
      />

      <section className="page" id="destinations">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Start with a place</p>
            <h2>Choose where the story begins</h2>
          </div>

          {loading && (
            <DataState
              icon={<Loader2 className="spin" size={28} />}
              message="Loading destinations..."
            />
          )}
          {error && (
            <DataState
              tone="error"
              title="Destinations unavailable"
              message={error}
            />
          )}
          {!loading && !error && places.length === 0 && (
            <DataState
              title="No destinations yet"
              message="Check back soon for new tour places."
            />
          )}

          {!loading && !error && places.length > 0 && (
            <div className="place-list">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
