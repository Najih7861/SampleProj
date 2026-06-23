import { CalendarPlus } from 'lucide-react'
import { getMyBookings } from '../api/client'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import Spinner from '../components/ui/Spinner'
import StatusBadge from '../components/ui/StatusBadge'
import { LinkButton } from '../components/ui/Button'
import { useAsync } from '../hooks/useAsync'
import { formatDate } from '../lib/format'

export default function MyBookings() {
  const { data, loading, error, reload } = useAsync(() => getMyBookings(), [], {
    errorMessage: 'Could not load your bookings.',
  })
  const bookings = data ?? []

  return (
    <div className="page">
      <div className="container">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Your trips</p>
            <h1>My Bookings</h1>
          </div>
          <LinkButton to="/explore" size="sm" icon={<CalendarPlus size={16} aria-hidden />}>
            Book another tour
          </LinkButton>
        </div>

        {loading && <Spinner label="Loading bookings..." />}
        {!loading && error && (
          <ErrorMessage
            title="Bookings unavailable"
            message={error}
            action={<button className="btn-primary" onClick={reload}>Retry</button>}
          />
        )}
        {!loading && !error && bookings.length === 0 && (
          <EmptyState
            title="No bookings yet"
            message="Your reserved tours will appear here after you book."
            action={<LinkButton to="/explore" variant="cta" icon={<CalendarPlus size={17} />}>Browse tours</LinkButton>}
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
                    <td data-label="Travel date">{formatDate(booking.travelDate)}</td>
                    <td data-label="Travelers">{booking.numberOfTravelers}</td>
                    <td data-label="Status"><StatusBadge status={booking.status} /></td>
                    <td data-label="Booked on">{formatDate(booking.createdAt)}</td>
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
