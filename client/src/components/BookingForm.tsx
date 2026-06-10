import { useState } from 'react'
import { createBooking } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import type { Booking } from '../types'

interface Props {
  packageId: number
  onBooked: (booking: Booking) => void
}

export default function BookingForm({ packageId, onBooked }: Props) {
  const { user } = useAuth()
  const [customerName, setCustomerName] = useState(user?.username ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [numberOfTravelers, setNumberOfTravelers] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const booking = await createBooking({
        tourPackageId: packageId,
        customerName,
        email,
        phone: phone || undefined,
        travelDate,
        numberOfTravelers,
      })
      onBooked(booking)
    } catch (err) {
      const msg =
        (typeof err === 'object' && err && 'response' in err
          ? (err as { response?: { data?: unknown } }).response?.data
          : null) ?? 'Could not submit your booking. Please try again.'
      setError(typeof msg === 'string' ? msg : 'Could not submit your booking.')
    } finally {
      setSubmitting(false)
    }
  }

  // Restrict travel date to today onward
  const today = new Date().toISOString().split('T')[0]

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>Book this tour</h3>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label htmlFor="name">Full name</label>
        <input id="name" required value={customerName}
          onChange={(e) => setCustomerName(e.target.value)} placeholder="Jane Traveler" />
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
        </div>
        <div className="form-row">
          <label htmlFor="phone">Phone (optional)</label>
          <input id="phone" value={phone}
            onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="date">Travel date</label>
          <input id="date" type="date" required min={today} value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="travelers">Travelers</label>
          <input id="travelers" type="number" min={1} max={100} required value={numberOfTravelers}
            onChange={(e) => setNumberOfTravelers(Number(e.target.value))} />
        </div>
      </div>

      <button type="submit" className="btn-cta" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Book Now'}
      </button>
    </form>
  )
}
