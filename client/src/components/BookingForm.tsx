import { useState } from 'react'
import { CalendarDays, Mail, Phone, Send, UserRound, UsersRound } from 'lucide-react'
import { createBooking } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import FormActions from './ui/FormActions'
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
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

  const today = new Date().toISOString().split('T')[0]

  return (
    <form className="form-card booking-form" onSubmit={handleSubmit}>
      <h2>Book this tour</h2>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label htmlFor="name"><UserRound size={15} aria-hidden /> Full name</label>
        <input
          id="name"
          required
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          placeholder="Jane Traveler"
        />
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="email"><Mail size={15} aria-hidden /> Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@example.com"
          />
        </div>
        <div className="form-row">
          <label htmlFor="phone"><Phone size={15} aria-hidden /> Phone</label>
          <input
            id="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+1 555 123 4567"
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="date"><CalendarDays size={15} aria-hidden /> Travel date</label>
          <input
            id="date"
            type="date"
            required
            min={today}
            value={travelDate}
            onChange={(event) => setTravelDate(event.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="travelers"><UsersRound size={15} aria-hidden /> Travelers</label>
          <input
            id="travelers"
            type="number"
            min={1}
            max={100}
            required
            value={numberOfTravelers}
            onChange={(event) => setNumberOfTravelers(Number(event.target.value))}
          />
        </div>
      </div>

      <FormActions align="stretch">
        <button type="submit" className="btn-cta icon-text" disabled={submitting}>
          <Send size={17} aria-hidden />
          {submitting ? 'Submitting...' : 'Book Now'}
        </button>
      </FormActions>
    </form>
  )
}
