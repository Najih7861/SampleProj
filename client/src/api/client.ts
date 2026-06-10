import type {
  Booking,
  BookingInput,
  BookingStatus,
  Package,
  PackageFilters,
  PackageInput,
} from '../types'
// Shared axios instance: proxied to the .NET backend (/api -> :5169) and
// configured with the Bearer-token + 401 interceptors.
import { http as api } from './http'

// ---- Packages ----
export async function getPackages(filters: PackageFilters = {}): Promise<Package[]> {
  const params: Record<string, string | number> = {}
  if (filters.destination) params.destination = filters.destination
  if (filters.minPrice != null) params.minPrice = filters.minPrice
  if (filters.maxPrice != null) params.maxPrice = filters.maxPrice
  const { data } = await api.get<Package[]>('/packages', { params })
  return data
}

export async function getPackage(id: number): Promise<Package> {
  const { data } = await api.get<Package>(`/packages/${id}`)
  return data
}

export async function createPackage(input: PackageInput): Promise<Package> {
  const { data } = await api.post<Package>('/packages', input)
  return data
}

export async function updatePackage(id: number, input: PackageInput): Promise<void> {
  await api.put(`/packages/${id}`, input)
}

export async function deletePackage(id: number): Promise<void> {
  await api.delete(`/packages/${id}`)
}

// ---- Bookings ----
export async function createBooking(input: BookingInput): Promise<Booking> {
  const { data } = await api.post<Booking>('/bookings', input)
  return data
}

export async function getBookings(status?: BookingStatus): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>('/bookings', {
    params: status ? { status } : {},
  })
  return data
}

// The signed-in user's own bookings (server filters by the JWT user id).
export async function getMyBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>('/bookings/mine')
  return data
}

export async function updateBookingStatus(id: number, status: BookingStatus): Promise<void> {
  await api.put(`/bookings/${id}/status`, { status })
}
