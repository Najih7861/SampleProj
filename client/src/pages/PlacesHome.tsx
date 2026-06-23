import { useMemo } from 'react'
import { ArrowRight, Compass, MapPinned, PlaneTakeoff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPlaces } from '../api/places'
import PlaceCard from '../components/PlaceCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import PageHero from '../components/ui/PageHero'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useAsync } from '../hooks/useAsync'

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800'

export default function PlacesHome() {
  const { data, loading, error, reload } = useAsync(() => getPlaces(), [])
  const places = useMemo(() => data ?? [], [data])

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
            <div className="place-list">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
          {!loading && error && (
            <ErrorMessage
              title="Destinations unavailable"
              message={error}
              action={<button className="btn-primary" onClick={reload}>Retry</button>}
            />
          )}
          {!loading && !error && places.length === 0 && (
            <EmptyState
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
