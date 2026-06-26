"""Pydantic response models — the typed contract for the dashboard payload.

These mirror the TypeScript types in client/src/types/analytics.ts. Keep the two
in sync when changing a shape.
"""
from pydantic import BaseModel


class Kpis(BaseModel):
    realizedRevenue: float
    realizedRevenueDelta: float | None  # % vs last month; null when no baseline
    pipelineRevenue: float
    totalBookings: int
    totalBookingsDelta: float | None
    avgBookingValue: float
    totalTravelers: int
    conversionRate: float  # 0..1 (confirmed / all bookings)
    cancellationRate: float  # 0..1 (cancelled / all bookings)
    avgRating: float
    totalReviews: int
    newUsersThisMonth: int
    newUsersDelta: float | None
    activePackages: int
    totalPackages: int
    confirmedBookings: int
    pendingBookings: int
    cancelledBookings: int


class ChartImages(BaseModel):
    """Each field is a rendered matplotlib chart as a PNG data URI."""

    revenueTrend: str
    statusBreakdown: str
    topPackages: str
    destinationPerformance: str
    ratingDistribution: str
    signups: str
    seasonality: str


class DeadPackage(BaseModel):
    id: int
    title: str
    destination: str
    price: float
    bookings: int


class LowRatedPackage(BaseModel):
    id: int
    title: str
    avgRating: float
    reviews: int


class Insight(BaseModel):
    level: str  # critical | warning | info | success
    title: str
    detail: str


class AnalyticsDashboard(BaseModel):
    generatedAt: str
    kpis: Kpis
    # Charts are rendered server-side with matplotlib and delivered as PNG data
    # URIs inside this authenticated response.
    charts: ChartImages
    deadInventory: list[DeadPackage]
    lowestRated: list[LowRatedPackage]
    insights: list[Insight]
