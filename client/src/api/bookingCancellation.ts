// Self-service cancellation of the signed-in user's own booking.
// Separate module (additive) so the existing client.ts stays untouched.
import { http as api } from './http'

export async function cancelMyBooking(id: number): Promise<void> {
  await api.post(`/bookings/${id}/cancel`)
}
