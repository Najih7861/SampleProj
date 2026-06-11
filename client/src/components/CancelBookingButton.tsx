import { useState } from 'react'
import { isAxiosError } from 'axios'
import { cancelMyBooking } from '../api/bookingCancellation'
import type { Booking } from '../types'

// Mirrors the server rule: cancellable while not already cancelled and the
// travel date is still in the future. The server stays authoritative.
export function isCancellable(b: Booking): boolean {
  return b.status !== 'Cancelled' && new Date(b.travelDate).getTime() > Date.now()
}

interface Props {
  booking: Booking
  onCancelled: (id: number) => void
}

// Cancel button for one booking row. Owns the confirm prompt, API call and
// busy state so the page only renders it and reacts to onCancelled.
export default function CancelBookingButton({ booking, onCancelled }: Props) {
  const [busy, setBusy] = useState(false)

  if (!isCancellable(booking)) return null

  async function handleClick() {
    if (!window.confirm(`Cancel your booking for "${booking.packageTitle}"?`)) return
    setBusy(true)
    try {
      await cancelMyBooking(booking.id)
      onCancelled(booking.id)
    } catch (err) {
      const message =
        isAxiosError(err) && typeof err.response?.data === 'string' && err.response.data
          ? err.response.data
          : 'Could not cancel this booking. Please try again.'
      window.alert(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button className="btn-danger btn-sm" onClick={handleClick} disabled={busy}>
      {busy ? 'Cancelling…' : 'Cancel'}
    </button>
  )
}
