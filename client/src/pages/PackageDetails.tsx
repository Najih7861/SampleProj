import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPackage } from '../api/client'
import BookingForm from '../components/BookingForm'
import type { Package } from '../types'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200'

export default function PackageDetails() {
  const { id } = useParams<{ id: string }>()
  const [pkg, setPkg] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [booked, setBooked] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getPackage(Number(id))
      .then((data) => { if (active) setPkg(data) })
      .catch(() => { if (active) setError('Tour package not found.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <div className="page"><div className="container"><p className="center-msg">Loading…</p></div></div>
  if (error || !pkg) {
    return (
      <div className="page"><div className="container">
        <div className="notice notice-error">{error ?? 'Not found'}</div>
        <Link to="/">← Back to all tours</Link>
      </div></div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <Link to="/">← Back to all tours</Link>

        <div className="detail-hero" style={{ margin: '1rem 0' }}>
          <img src={pkg.imageUrl || FALLBACK_IMG} alt={pkg.title} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>{pkg.title}</h1>
            <p className="destination" style={{ fontSize: '1rem' }}>📍 {pkg.destination}</p>
            <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
              <span className="price" style={{ fontSize: '1.5rem' }}>${pkg.price.toLocaleString()}</span>
              <span className="duration">{pkg.durationDays} days</span>
              {!pkg.isAvailable && <span className="badge badge-cancelled">Sold out</span>}
            </div>
            <p style={{ lineHeight: 1.6 }}>{pkg.description}</p>
          </div>

          <div>
            {booked ? (
              <div className="form-card">
                <h3>🎉 Booking received!</h3>
                <p className="muted">
                  Thanks for booking <strong>{pkg.title}</strong>. We'll email you to confirm
                  the details shortly.
                </p>
                <button className="btn-ghost" onClick={() => setBooked(false)}>Book again</button>
              </div>
            ) : pkg.isAvailable ? (
              <BookingForm packageId={pkg.id} onBooked={() => setBooked(true)} />
            ) : (
              <div className="form-card">
                <h3>Not available</h3>
                <p className="muted">This tour is currently sold out. Please check back later.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
