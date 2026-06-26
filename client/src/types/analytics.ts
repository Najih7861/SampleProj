// Typed contract for the analytics dashboard payload. Mirrors the Pydantic
// response models in client/analytics-service/app/schemas.py — keep the two in
// sync when a shape changes.
//
// Charts are rendered server-side with matplotlib and delivered as PNG data
// URIs (see `ChartImages`), so the frontend just displays them as <img>.

export interface AnalyticsKpis {
  realizedRevenue: number
  /** % change vs last month; null when there is no prior-month baseline. */
  realizedRevenueDelta: number | null
  pipelineRevenue: number
  totalBookings: number
  totalBookingsDelta: number | null
  avgBookingValue: number
  totalTravelers: number
  /** 0..1 — confirmed / all bookings. */
  conversionRate: number
  /** 0..1 — cancelled / all bookings. */
  cancellationRate: number
  avgRating: number
  totalReviews: number
  newUsersThisMonth: number
  newUsersDelta: number | null
  activePackages: number
  totalPackages: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
}

/** Each field is a rendered matplotlib chart as a `data:image/png;base64,...` URI. */
export interface ChartImages {
  revenueTrend: string
  statusBreakdown: string
  topPackages: string
  destinationPerformance: string
  ratingDistribution: string
  signups: string
  seasonality: string
}

export interface DeadPackage {
  id: number
  title: string
  destination: string
  price: number
  bookings: number
}

export interface LowRatedPackage {
  id: number
  title: string
  avgRating: number
  reviews: number
}

export type InsightLevel = 'critical' | 'warning' | 'info' | 'success'

export interface Insight {
  level: InsightLevel
  title: string
  detail: string
}

export interface AnalyticsDashboard {
  generatedAt: string
  kpis: AnalyticsKpis
  charts: ChartImages
  deadInventory: DeadPackage[]
  lowestRated: LowRatedPackage[]
  insights: Insight[]
}
