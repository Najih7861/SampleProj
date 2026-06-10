import { useEffect, useState } from 'react'
import { getPackages } from '../api/client'
import PackageCard from '../components/PackageCard'
import type { Package } from '../types'

export default function Home() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // filter inputs
  const [destination, setDestination] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await getPackages({
        destination: destination || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      })
      setPackages(data)
    } catch {
      setError('Could not load tour packages. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFilter(e: React.FormEvent) {
    e.preventDefault()
    load()
  }

  function clearFilters() {
    setDestination('')
    setMinPrice('')
    setMaxPrice('')
    setTimeout(load, 0)
  }

  return (
    <>
      <section className="hero-banner">
        <div className="container">
          <h1>Find your next adventure</h1>
          <p>Handpicked tour packages to the world's most beautiful destinations.</p>
        </div>
      </section>

      <div className="page">
        <div className="container">
          <form className="filter-bar" onSubmit={handleFilter}>
            <div className="field field-grow">
              <label htmlFor="f-dest">Destination</label>
              <input id="f-dest" value={destination} placeholder="e.g. Greece"
                onChange={(e) => setDestination(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="f-min">Min price</label>
              <input id="f-min" type="number" min={0} value={minPrice} placeholder="0"
                onChange={(e) => setMinPrice(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="f-max">Max price</label>
              <input id="f-max" type="number" min={0} value={maxPrice} placeholder="5000"
                onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary">Search</button>
            <button type="button" className="btn-ghost" onClick={clearFilters}>Clear</button>
          </form>

          {loading && <p className="center-msg">Loading tours…</p>}
          {error && <div className="notice notice-error">{error}</div>}
          {!loading && !error && packages.length === 0 && (
            <p className="center-msg">No tours match your search. Try clearing the filters.</p>
          )}

          <div className="grid">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
