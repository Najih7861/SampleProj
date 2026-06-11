import { useEffect, useMemo, useState } from 'react'
import { Loader2, MapPin, ShieldCheck, XCircle } from 'lucide-react'
import { getBookings, updateBookingStatus } from '../api/client'
import DataState from '../components/ui/DataState'
import StatusBadge from '../components/ui/StatusBadge'
import type { Booking, BookingStatus } from '../types'

const STATUSES: BookingStatus[] = ['Pending', 'Confirmed', 'Cancelled']

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<BookingStatus | ''>('')

  async function load(status: BookingStatus | '' = filter, busy = true) {
    if (busy) setLoading(true)
    setError(null)
    try {
      setBookings(await getBookings(status || undefined))
    } catch {
      setError('Could not load bookings. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function loadBookings() {
      try {
        const data = await getBookings(filter || undefined)
        if (!active) return
        setBookings(data)
        setError(null)
      } catch {
        if (active) setError('Could not load bookings. Is the API running?')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadBookings()
    return () => { active = false }
  }, [filter])

  function handleFilterChange(status: BookingStatus | '') {
    setLoading(true)
    setFilter(status)
  }

  async function handleStatusChange(booking: Booking, status: BookingStatus) {
    await updateBookingStatus(booking.id, status)
    await load(filter)
  }

  async function handleCancel(booking: Booking) {
    if (!window.confirm(`Cancel ${booking.customerName}'s booking for "${booking.packageTitle}"?`)) return
    await updateBookingStatus(booking.id, 'Cancelled')
    await load(filter)
  }

  const groups = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const booking of bookings) {
      const key = booking.packageDestination || 'Unspecified place'
      const list = map.get(key)
      if (list) list.push(booking)
      else map.set(key, [booking])
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [bookings])

  return (
    <div className="page">
      <div className="container">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Bookings</h1>
          </div>
          <div className="field toolbar-field">
            <label htmlFor="status-filter"><ShieldCheck size={15} aria-hidden /> Filter by status</label>
            <select
              id="status-filter"
              value={filter}
              onChange={(event) => handleFilterChange(event.target.value as BookingStatus | '')}
            >
              <option value="">All</option>
              {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        </div>

        {loading && (
          <DataState icon={<Loader2 className="spin" size={28} />} message="Loading bookings..." />
        )}
        {error && (
          <DataState tone="error" title="Bookings unavailable" message={error} />
        )}
        {!loading && !error && bookings.length === 0 && (
          <DataState title="No bookings found" message="Bookings will appear here after customers reserve tours." />
        )}

        {!loading && !error && groups.map(([place, placeBookings]) => (
          <section key={place} className="booking-group">
            <h2 className="booking-group-title">
              <MapPin size={19} aria-hidden />
              {place}
              <span className="muted">({placeBookings.length})</span>
            </h2>
            <div className="table-wrap">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Tour</th>
                    <th>Travel date</th>
                    <th>Travelers</th>
                    <th>Status</th>
                    <th>Set status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {placeBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td data-label="Customer">
                        <div className="record-title">{booking.customerName}</div>
                        <span className="record-note">{booking.email}</span>
                      </td>
                      <td data-label="Tour">{booking.packageTitle}</td>
                      <td data-label="Travel date">{new Date(booking.travelDate).toLocaleDateString()}</td>
                      <td data-label="Travelers">{booking.numberOfTravelers}</td>
                      <td data-label="Status"><StatusBadge status={booking.status} /></td>
                      <td data-label="Set status">
                        <select
                          value={booking.status}
                          onChange={(event) => handleStatusChange(booking, event.target.value as BookingStatus)}
                        >
                          {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td data-label="Actions" className="cell-actions">
                        <button
                          className="btn-danger btn-sm icon-text"
                          disabled={booking.status === 'Cancelled'}
                          onClick={() => handleCancel(booking)}
                        >
                          <XCircle size={15} aria-hidden />
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
