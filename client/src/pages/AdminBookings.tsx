import { useMemo, useState } from 'react'
import { MapPin, Search, ShieldCheck, XCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getBookings, updateBookingStatus } from '../api/client'
import { authErrorMessage } from '../api/auth'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import { formatDate } from '../lib/format'
import { useToast } from '../components/ui/toast/useToast'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import type { Booking, BookingStatus } from '../types'

const STATUSES: BookingStatus[] = ['Pending', 'Confirmed', 'Cancelled']

const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  ...STATUSES.map((status) => ({ value: status, label: status })),
]

const STATUS_OPTIONS = STATUSES.map((status) => ({ value: status, label: status }))

function isBookingStatus(value: string): value is BookingStatus {
  return STATUSES.includes(value as BookingStatus)
}

export default function AdminBookings() {
  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get('status')
  const [filter, setFilter] = useState<BookingStatus | ''>(
    initialStatus && isBookingStatus(initialStatus) ? initialStatus : '',
  )

  const { data, loading, error, reload } = useAsync(
    () => getBookings(filter || undefined),
    [filter],
    { errorMessage: 'Could not load bookings. Is the API running?' },
  )
  const toast = useToast()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const [pendingCancel, setPendingCancel] = useState<Booking | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const bookings = useMemo(() => data ?? [], [data])

  const groups = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    const filtered = term
      ? bookings.filter((booking) => {
          const haystack = `${booking.customerName} ${booking.email} ${booking.packageTitle}`.toLowerCase()
          return haystack.includes(term)
        })
      : bookings
    const map = new Map<string, Booking[]>()
    for (const booking of filtered) {
      const key = booking.packageDestination || 'Unspecified place'
      const list = map.get(key)
      if (list) list.push(booking)
      else map.set(key, [booking])
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [bookings, debouncedSearch])

  async function handleStatusChange(booking: Booking, status: BookingStatus) {
    try {
      await updateBookingStatus(booking.id, status)
      toast.success(`Booking marked ${status}`)
      reload()
    } catch (err) {
      toast.error(authErrorMessage(err, 'Could not update booking status.'))
    }
  }

  async function confirmCancel() {
    if (!pendingCancel) return
    setCancelling(true)
    try {
      await updateBookingStatus(pendingCancel.id, 'Cancelled')
      toast.success('Booking cancelled')
      setPendingCancel(null)
      reload()
    } catch (err) {
      toast.error(authErrorMessage(err, 'Could not cancel booking.'))
    } finally {
      setCancelling(false)
    }
  }

  const hasResults = groups.length > 0

  return (
    <div className="page">
      <div className="container">
        <PageHeader eyebrow="Admin" title="Bookings" />

        {!loading && !error && (
          <div className="admin-controls">
            <div className="input-with-icon field field-search">
              <Search size={16} aria-hidden />
              <Input
                layout="field"
                type="search"
                placeholder="Search by customer, email, or tour"
                aria-label="Search bookings"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select
              layout="field"
              label={<><ShieldCheck size={15} aria-hidden /> Filter by status</>}
              value={filter}
              onChange={(event) => setFilter(event.target.value as BookingStatus | '')}
              options={FILTER_OPTIONS}
            />
          </div>
        )}

        {loading && <Spinner label="Loading bookings..." />}

        {error && (
          <ErrorMessage
            title="Bookings unavailable"
            message={error}
            action={
              <Button variant="ghost" onClick={reload}>
                Retry
              </Button>
            }
          />
        )}

        {!loading && !error && !hasResults && (
          <EmptyState
            title="No bookings found"
            message="Bookings will appear here after customers reserve tours."
          />
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
                      <td data-label="Travel date">{formatDate(booking.travelDate)}</td>
                      <td data-label="Travelers">{booking.numberOfTravelers}</td>
                      <td data-label="Status"><StatusBadge status={booking.status} /></td>
                      <td data-label="Set status">
                        <Select
                          layout="field"
                          aria-label={`Set status for ${booking.customerName}`}
                          value={booking.status}
                          onChange={(event) => handleStatusChange(booking, event.target.value as BookingStatus)}
                          options={STATUS_OPTIONS}
                        />
                      </td>
                      <td data-label="Actions" className="cell-actions">
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<XCircle size={15} aria-hidden />}
                          disabled={booking.status === 'Cancelled'}
                          onClick={() => setPendingCancel(booking)}
                        >
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <ConfirmDialog
        open={!!pendingCancel}
        title="Cancel booking"
        tone="danger"
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        loading={cancelling}
        message={
          pendingCancel
            ? `Cancel ${pendingCancel.customerName}'s booking for "${pendingCancel.packageTitle}"?`
            : ''
        }
        onConfirm={confirmCancel}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  )
}
