import { useEffect, useState } from 'react'
import { getBookings, updateBookingStatus } from '../api/client'
import type { Booking, BookingStatus } from '../types'

const STATUSES: BookingStatus[] = ['Pending', 'Confirmed', 'Cancelled']

function badgeClass(status: BookingStatus) {
  return `badge badge-${status.toLowerCase()}`
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<BookingStatus | ''>('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setBookings(await getBookings(filter || undefined))
    } catch {
      setError('Could not load bookings. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function handleStatusChange(b: Booking, status: BookingStatus) {
    await updateBookingStatus(b.id, status)
    await load()
  }

  return (
    <div className="page">
      <div className="container">
        <div className="toolbar">
          <h1>Bookings</h1>
          <div className="field">
            <label htmlFor="status-filter">Filter by status</label>
            <select id="status-filter" value={filter}
              onChange={(e) => setFilter(e.target.value as BookingStatus | '')}>
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading && <p className="center-msg">Loading…</p>}
        {error && <div className="notice notice-error">{error}</div>}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th><th>Tour</th><th>Travel date</th>
                  <th>Travelers</th><th>Status</th><th>Set status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      {b.customerName}<br />
                      <span className="muted" style={{ fontSize: '0.8rem' }}>{b.email}</span>
                    </td>
                    <td>{b.packageTitle}</td>
                    <td>{new Date(b.travelDate).toLocaleDateString()}</td>
                    <td>{b.numberOfTravelers}</td>
                    <td><span className={badgeClass(b.status)}>{b.status}</span></td>
                    <td>
                      <select value={b.status}
                        onChange={(e) => handleStatusChange(b, e.target.value as BookingStatus)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={6} className="muted" style={{ textAlign: 'center' }}>No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
