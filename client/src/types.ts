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
  placeId?: number | null
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
  packageDestination: string
}

export interface PackageInput {
  title: string
  destination: string
  description: string
  price: number
  durationDays: number
  imageUrl?: string | null
  isAvailable: boolean
  placeId?: number | null
}

// A package summary shown on the Home place cards ("Book Now").
export interface PlacePackage {
  id: number
  title: string
  price: number
  durationDays: number
  isAvailable: boolean
}

// A destination/place with its gallery (ordered image URLs) and grouped packages.
export interface Place {
  id: number
  name: string
  description: string
  createdAt: string
  images: string[]
  packages: PlacePackage[]
}

export interface PlaceInput {
  name: string
  description: string
  imageUrls: string[]
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
