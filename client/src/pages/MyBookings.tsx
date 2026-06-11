import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyBookings } from '../api/client'
import CancelBookingButton from '../components/CancelBookingButton'
import type { Booking, BookingStatus } from '../types'

function badgeClass(status: BookingStatus) {
  return `badge badge-${status.toLowerCase()}`
}

// The signed-in user's own bookings (filtered server-side by the JWT user id).
export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getMyBookings()
      .then((data) => { if (active) setBookings(data) })
      .catch(() => { if (active) setError('Could not load your bookings. Is the API running?') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  // Flip the row to Cancelled locally after a successful cancel (no refetch).
  function markCancelled(id: number) {
    setBookings((prev) =>
      prev.map((b): Booking => (b.id === id ? { ...b, status: 'Cancelled' } : b)),
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="toolbar">
          <h1>My Bookings</h1>
          <Link to="/explore" className="btn-primary btn-sm">Book another tour</Link>
        </div>

        {loading && <p className="center-msg">Loading…</p>}
        {error && <div className="notice notice-error">{error}</div>}
        {!loading && !error && bookings.length === 0 && (
          <p className="center-msg">You haven't booked any tours yet.</p>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tour</th><th>Destination</th><th>Travel date</th>
                  <th>Travelers</th><th>Status</th><th>Booked on</th><th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.packageTitle}</td>
                    <td>{b.packageDestination}</td>
                    <td>{new Date(b.travelDate).toLocaleDateString()}</td>
                    <td>{b.numberOfTravelers}</td>
                    <td><span className={badgeClass(b.status)}>{b.status}</span></td>
                    <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td><CancelBookingButton booking={b} onCancelled={markCancelled} /></td>
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
