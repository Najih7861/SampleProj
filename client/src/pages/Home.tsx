import { useMemo, useState } from 'react'
import { Filter, RotateCcw, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getPackages } from '../api/client'
import PackageCard from '../components/PackageCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Input from '../components/ui/Input'
import PageHero from '../components/ui/PageHero'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import type { PackageFilters } from '../types'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1800'

function toFilters(destination: string, minPrice: string, maxPrice: string): PackageFilters {
  return {
    destination: destination || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  }
}

export default function Home() {
  const [searchParams] = useSearchParams()
  const placeId = searchParams.get('placeId')

  const [destination, setDestination] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Debounce the raw inputs so live filtering doesn't fire a request per keystroke.
  // The debounced values are the auto-trigger; the loader reads the live values so an
  // explicit Search (reload) fetches exactly what is currently typed.
  const debouncedDestination = useDebounce(destination)
  const debouncedMin = useDebounce(minPrice)
  const debouncedMax = useDebounce(maxPrice)

  const { data, loading, error, reload } = useAsync(
    () => getPackages(toFilters(destination, minPrice, maxPrice)),
    [debouncedDestination, debouncedMin, debouncedMax],
  )
  const packages = useMemo(() => data ?? [], [data])

  function handleFilter(event: React.FormEvent) {
    event.preventDefault()
    // Force an immediate refetch with the current (possibly not-yet-debounced) inputs.
    reload()
  }

  function clearFilters() {
    setDestination('')
    setMinPrice('')
    setMaxPrice('')
  }

  const visible = useMemo(
    () => (placeId ? packages.filter((pkg) => String(pkg.placeId) === placeId) : packages),
    [packages, placeId],
  )
  const placeName = placeId ? packages.find((pkg) => String(pkg.placeId) === placeId)?.destination : undefined

  return (
    <>
      <PageHero
        compact
        eyebrow="Tour catalog"
        title="Find your next adventure"
        description="Filter packages by destination and price, then choose the journey that fits your dates and travelers."
        backgroundImage={HERO_IMAGE}
      />

      <section className="page">
        <div className="container">
          <form className="filter-bar" onSubmit={handleFilter}>
            <div className="filter-title">
              <Filter size={19} aria-hidden />
              <span>Refine tours</span>
            </div>
            <Input
              layout="field"
              id="f-dest"
              label="Destination"
              value={destination}
              placeholder="Greece"
              onChange={(event) => setDestination(event.target.value)}
            />
            <Input
              layout="field"
              id="f-min"
              label="Min price"
              type="number"
              min={0}
              value={minPrice}
              placeholder="0"
              onChange={(event) => setMinPrice(event.target.value)}
            />
            <Input
              layout="field"
              id="f-max"
              label="Max price"
              type="number"
              min={0}
              value={maxPrice}
              placeholder="5000"
              onChange={(event) => setMaxPrice(event.target.value)}
            />
            <div className="filter-actions">
              <button type="submit" className="btn-primary icon-text">
                <Search size={17} aria-hidden />
                Search
              </button>
              <button type="button" className="btn-ghost icon-text" onClick={clearFilters}>
                <RotateCcw size={17} aria-hidden />
                Clear
              </button>
            </div>
          </form>

          {placeId && placeName && (
            <div className="notice notice-info">Showing tours in <strong>{placeName}</strong>.</div>
          )}

          {!loading && !error && (
            <p className="muted result-count">{visible.length} tours</p>
          )}

          {loading && (
            <div className="grid">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}
          {!loading && error && (
            <ErrorMessage
              title="Tours unavailable"
              message={error}
              action={<button className="btn-primary" onClick={reload}>Retry</button>}
            />
          )}
          {!loading && !error && visible.length === 0 && (
            <EmptyState
              title="No tours match your search"
              message="Try clearing the filters or choosing another destination."
              action={<button className="btn-primary" onClick={clearFilters}>Clear filters</button>}
            />
          )}

          {!loading && !error && visible.length > 0 && (
            <div className="grid">
              {visible.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
