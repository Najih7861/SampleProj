export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled'

export interface Package {
  id: number
  title: string
  destination: string
  description: string
  price: number
  durationDays: number
  imageUrl?: string | null
  isAvailable: boolean
  createdAt: string
}

export interface Booking {
  id: number
  tourPackageId: number
  packageTitle: string
  customerName: string
  email: string
  phone?: string | null
  travelDate: string
  numberOfTravelers: number
  status: BookingStatus
  createdAt: string
}

export interface PackageInput {
  title: string
  destination: string
  description: string
  price: number
  durationDays: number
  imageUrl?: string | null
  isAvailable: boolean
}

export interface BookingInput {
  tourPackageId: number
  customerName: string
  email: string
  phone?: string
  travelDate: string
  numberOfTravelers: number
}

export interface PackageFilters {
  destination?: string
  minPrice?: number
  maxPrice?: number
}
