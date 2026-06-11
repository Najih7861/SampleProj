import { useEffect, useMemo, useState } from 'react'
import { Filter, Loader2, RotateCcw, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getPackages } from '../api/client'
import PackageCard from '../components/PackageCard'
import DataState from '../components/ui/DataState'
import PageHero from '../components/ui/PageHero'
import type { Package, PackageFilters } from '../types'

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

  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [destination, setDestination] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  async function fetchPackages(filters: PackageFilters, busy = true) {
    if (busy) setLoading(true)
    setError(null)
    try {
      setPackages(await getPackages(filters))
    } catch {
      setError('Could not load tour packages. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialPackages() {
      try {
        const data = await getPackages()
        if (!active) return
        setPackages(data)
        setError(null)
      } catch {
        if (active) setError('Could not load tour packages. Is the API running?')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadInitialPackages()
    return () => { active = false }
  }, [])

  function handleFilter(event: React.FormEvent) {
    event.preventDefault()
    void fetchPackages(toFilters(destination, minPrice, maxPrice))
  }

  function clearFilters() {
    setDestination('')
    setMinPrice('')
    setMaxPrice('')
    void fetchPackages({})
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
            <div className="field field-grow">
              <label htmlFor="f-dest">Destination</label>
              <input
                id="f-dest"
                value={destination}
                placeholder="Greece"
                onChange={(event) => setDestination(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="f-min">Min price</label>
              <input
                id="f-min"
                type="number"
                min={0}
                value={minPrice}
                placeholder="0"
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="f-max">Max price</label>
              <input
                id="f-max"
                type="number"
                min={0}
                value={maxPrice}
                placeholder="5000"
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </div>
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

          {loading && (
            <DataState
              icon={<Loader2 className="spin" size={28} />}
              message="Loading tours..."
            />
          )}
          {error && (
            <DataState
              tone="error"
              title="Tours unavailable"
              message={error}
            />
          )}
          {!loading && !error && visible.length === 0 && (
            <DataState
              title="No tours match your search"
              message="Try clearing the filters or choosing another destination."
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
