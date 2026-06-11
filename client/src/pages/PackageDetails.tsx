import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, Loader2, LogIn, MapPin, UsersRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getPackage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import BookingForm from '../components/BookingForm'
import PackageReviews from '../components/reviews/PackageReviews'
import DataState from '../components/ui/DataState'
import StatusBadge from '../components/ui/StatusBadge'
import type { Package } from '../types'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400'

export default function PackageDetails() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [pkg, setPkg] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [booked, setBooked] = useState(false)
  const packageId = Number(id)

  useEffect(() => {
    let active = true

    async function loadPackage() {
      try {
        const data = await getPackage(packageId)
        if (!active) return
        setPkg(data)
        setBooked(false)
        setError(null)
      } catch {
        if (!active) return
        setPkg(null)
        setError('Tour package not found.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPackage()
    return () => { active = false }
  }, [packageId])

  const detailFacts = useMemo(() => {
    if (!pkg) return []
    return [
      { label: 'Destination', value: pkg.destination, icon: <MapPin size={18} aria-hidden /> },
      { label: 'Duration', value: `${pkg.durationDays} days`, icon: <CalendarDays size={18} aria-hidden /> },
      { label: 'Group size', value: '1-100 travelers', icon: <UsersRound size={18} aria-hidden /> },
    ]
  }, [pkg])

  const stalePackage = pkg != null && pkg.id !== packageId
  if (loading || stalePackage) {
    return (
      <div className="page">
        <div className="container">
          <DataState icon={<Loader2 className="spin" size={28} />} message="Loading tour..." />
        </div>
      </div>
    )
  }

  if (error || !pkg) {
    return (
      <div className="page">
        <div className="container">
          <DataState
            tone="error"
            title="Tour unavailable"
            message={error ?? 'Not found'}
            action={<Link to="/explore" className="btn-primary icon-text"><ArrowLeft size={17} /> Back to tours</Link>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="page detail-page">
      <div className="container">
        <Link to="/explore" className="back-link icon-text">
          <ArrowLeft size={17} aria-hidden />
          Back to tours
        </Link>

        <section className="detail-shell">
          <div className="detail-media">
            <img src={pkg.imageUrl || FALLBACK_IMG} alt={pkg.title} />
            <div className="detail-media-badge">
              {pkg.isAvailable ? <StatusBadge status="Available" /> : <StatusBadge status="Unavailable" />}
            </div>
          </div>

          <div className="detail-content">
            <div className="detail-main">
              <p className="eyebrow">Tour package</p>
              <h1>{pkg.title}</h1>
              <p className="detail-description">{pkg.description}</p>

              <div className="detail-facts">
                {detailFacts.map((fact) => (
                  <div className="detail-fact" key={fact.label}>
                    {fact.icon}
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </div>
                ))}
              </div>

              <div className="detail-price-row">
                <span className="price">${pkg.price.toLocaleString()}</span>
                <span className="muted">per booking request</span>
              </div>
            </div>

            <aside className="booking-panel" id="booking-panel" aria-label="Booking panel">
              {booked ? (
                <div className="form-card booking-success">
                  <CheckCircle2 size={30} aria-hidden />
                  <h2>Booking received</h2>
                  <p className="muted">
                    Thanks for booking <strong>{pkg.title}</strong>. We will email you to confirm the details shortly.
                  </p>
                  <button className="btn-ghost icon-text" onClick={() => setBooked(false)}>
                    Book again
                  </button>
                </div>
              ) : !user ? (
                <div className="form-card">
                  <h2>Log in to book</h2>
                  <p className="muted">Create or access your account to reserve <strong>{pkg.title}</strong>.</p>
                  <Link
                    to="/auth"
                    state={{ from: `/packages/${pkg.id}` }}
                    className="btn-cta icon-text stretch-action"
                  >
                    <LogIn size={17} aria-hidden />
                    Log in or register
                  </Link>
                </div>
              ) : pkg.isAvailable ? (
                <BookingForm packageId={pkg.id} onBooked={() => setBooked(true)} />
              ) : (
                <div className="form-card">
                  <h2>Not available</h2>
                  <p className="muted">This tour is currently sold out. Please check back later.</p>
                </div>
              )}
            </aside>
          </div>
        </section>

        <PackageReviews packageId={pkg.id} />
      </div>
    </div>
  )
}
