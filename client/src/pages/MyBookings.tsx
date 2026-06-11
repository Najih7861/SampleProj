import { useEffect, useState } from 'react'
import { CalendarPlus, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyBookings } from '../api/client'
import DataState from '../components/ui/DataState'
import StatusBadge from '../components/ui/StatusBadge'
import type { Booking } from '../types'

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadBookings() {
      try {
        const data = await getMyBookings()
        if (!active) return
        setBookings(data)
        setError(null)
      } catch {
        if (active) setError('Could not load your bookings. Is the API running?')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadBookings()
    return () => { active = false }
  }, [])

  return (
    <div className="page">
      <div className="container">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Your trips</p>
            <h1>My Bookings</h1>
          </div>
          <Link to="/explore" className="btn-primary btn-sm icon-text">
            <CalendarPlus size={16} aria-hidden />
            Book another tour
          </Link>
        </div>

        {loading && (
          <DataState icon={<Loader2 className="spin" size={28} />} message="Loading bookings..." />
        )}
        {error && (
          <DataState tone="error" title="Bookings unavailable" message={error} />
        )}
        {!loading && !error && bookings.length === 0 && (
          <DataState
            title="No bookings yet"
            message="Your reserved tours will appear here after you book."
            action={<Link to="/explore" className="btn-cta icon-text"><CalendarPlus size={17} /> Browse tours</Link>}
          />
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="table-wrap">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>Destination</th>
                  <th>Travel date</th>
                  <th>Travelers</th>
                  <th>Status</th>
                  <th>Booked on</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td data-label="Tour">{booking.packageTitle}</td>
                    <td data-label="Destination">{booking.packageDestination}</td>
                    <td data-label="Travel date">{new Date(booking.travelDate).toLocaleDateString()}</td>
                    <td data-label="Travelers">{booking.numberOfTravelers}</td>
                    <td data-label="Status"><StatusBadge status={booking.status} /></td>
                    <td data-label="Booked on">{new Date(booking.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
