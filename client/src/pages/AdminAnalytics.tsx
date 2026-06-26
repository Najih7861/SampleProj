import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  DollarSign,
  Info,
  Percent,
  RefreshCw,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { getAnalyticsDashboard } from '../api/analytics'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import PageHeader from '../components/ui/PageHeader'
import Skeleton from '../components/ui/Skeleton'
import { useAsync } from '../hooks/useAsync'
import { formatCurrency, formatDateTime } from '../lib/format'
import type { Insight, InsightLevel } from '../types/analytics'
import './AdminAnalytics.css'

const INSIGHT_ICON: Record<InsightLevel, ReactNode> = {
  critical: <AlertTriangle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
  success: <CheckCircle2 size={18} />,
}

const pct = (value: number) => `${(value * 100).toFixed(1)}%`

function DeltaBadge({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return <span className="kpi-delta kpi-delta-flat">— no baseline</span>
  }
  const positive = value >= 0
  const cls = value === 0 ? 'kpi-delta-flat' : positive ? 'kpi-delta-up' : 'kpi-delta-down'
  return (
    <span className={`kpi-delta ${cls}`}>
      {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {positive ? '+' : ''}
      {value}% vs last mo.
    </span>
  )
}

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  delta?: number | null
  danger?: boolean
}

function KpiCard({ icon, label, value, hint, delta, danger }: KpiCardProps) {
  return (
    <Card className="kpi-card">
      <span className="kpi-card-top">
        <span className="kpi-value">{value}</span>
        <span className={`kpi-icon ${danger ? 'kpi-icon-danger' : ''}`.trim()} aria-hidden>
          {icon}
        </span>
      </span>
      <span className="kpi-label">{label}</span>
      {delta !== undefined ? <DeltaBadge value={delta} /> : hint && <span className="kpi-hint">{hint}</span>}
      {delta !== undefined && hint && <span className="kpi-hint">{hint}</span>}
    </Card>
  )
}

interface ChartPanelProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  /** A matplotlib chart rendered server-side, as a PNG data URI. */
  src: string
  alt: string
  full?: boolean
}

function ChartPanel({ title, subtitle, icon, src, alt, full }: ChartPanelProps) {
  return (
    <Card as="section" className={`chart-panel ${full ? 'chart-panel-full' : ''}`.trim()}>
      <div className="chart-panel-head">
        <h2>
          {icon}
          {title}
        </h2>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      <img className="analytics-chart-img" src={src} alt={alt} loading="lazy" />
    </Card>
  )
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className={`insight-card insight-${insight.level}`}>
      <span className="insight-card-icon" aria-hidden>
        {INSIGHT_ICON[insight.level]}
      </span>
      <div>
        <p className="insight-card-title">{insight.title}</p>
        <p className="insight-card-detail">{insight.detail}</p>
      </div>
    </div>
  )
}

export default function AdminAnalytics() {
  const { data, loading, error, reload } = useAsync(() => getAnalyticsDashboard(), [], {
    errorMessage: 'Could not load analytics. Make sure the analytics service is running on :8000.',
  })

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          eyebrow="Admin"
          title="Analytics"
          description="Revenue, demand, and quality signals across Wanderlust Tours — and the drawbacks worth acting on."
          actions={
            <button type="button" className="btn-ghost btn-sm icon-text" onClick={reload} disabled={loading}>
              <RefreshCw size={16} aria-hidden />
              Refresh
            </button>
          }
        />

        {loading && (
          <div className="analytics-kpi-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card card-static kpi-card">
                <Skeleton width="55%" height="2rem" />
                <Skeleton width="75%" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <ErrorMessage
            title="Analytics unavailable"
            message={error}
            action={
              <button type="button" className="btn-primary" onClick={reload}>
                Retry
              </button>
            }
          />
        )}

        {data && !loading && !error && (
          <>
            <p className="analytics-meta">Last updated {formatDateTime(data.generatedAt)}</p>

            {/* KPI cards */}
            <div className="analytics-kpi-grid">
              <KpiCard
                icon={<Wallet size={20} />}
                label="Realized revenue"
                value={formatCurrency(data.kpis.realizedRevenue)}
                delta={data.kpis.realizedRevenueDelta}
                hint="Confirmed bookings"
              />
              <KpiCard
                icon={<Clock3 size={20} />}
                label="Pipeline revenue"
                value={formatCurrency(data.kpis.pipelineRevenue)}
                hint={`${data.kpis.pendingBookings} pending`}
              />
              <KpiCard
                icon={<CalendarCheck size={20} />}
                label="Total bookings"
                value={String(data.kpis.totalBookings)}
                delta={data.kpis.totalBookingsDelta}
                hint={`${data.kpis.totalTravelers} travelers`}
              />
              <KpiCard
                icon={<DollarSign size={20} />}
                label="Avg booking value"
                value={formatCurrency(data.kpis.avgBookingValue)}
                hint="Per confirmed booking"
              />
              <KpiCard
                icon={<Percent size={20} />}
                label="Conversion rate"
                value={pct(data.kpis.conversionRate)}
                hint="Confirmed / all bookings"
              />
              <KpiCard
                icon={<XCircle size={20} />}
                label="Cancellation rate"
                value={pct(data.kpis.cancellationRate)}
                hint="Cancelled / all bookings"
                danger={data.kpis.cancellationRate >= 0.2}
              />
              <KpiCard
                icon={<Star size={20} />}
                label="Avg rating"
                value={`${data.kpis.avgRating.toFixed(1)} / 5`}
                hint={`${data.kpis.totalReviews} reviews`}
              />
              <KpiCard
                icon={<Users size={20} />}
                label="New users"
                value={String(data.kpis.newUsersThisMonth)}
                delta={data.kpis.newUsersDelta}
                hint="This month"
              />
            </div>

            {/* Insights / alerts */}
            <Card as="section" className="chart-panel chart-panel-full">
              <div className="chart-panel-head">
                <h2>
                  <AlertTriangle size={18} />
                  Insights & alerts
                </h2>
                <p className="muted">Auto-detected business drawbacks and wins</p>
              </div>
              <div className="insight-grid">
                {data.insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            </Card>

            {/* Charts (rendered server-side with matplotlib) */}
            <ChartPanel
              title="Revenue & bookings — last 12 months"
              subtitle="Realized revenue (area) against booking volume (line)"
              icon={<TrendingUp size={18} />}
              src={data.charts.revenueTrend}
              alt="Line chart of revenue and bookings over the last 12 months"
              full
            />

            <div className="analytics-grid-2">
              <ChartPanel
                title="Booking status"
                subtitle="Where bookings end up"
                icon={<CheckCircle2 size={18} />}
                src={data.charts.statusBreakdown}
                alt="Donut chart of booking status breakdown"
              />
              <ChartPanel
                title="Top packages by revenue"
                subtitle="Realized revenue per package"
                icon={<TrendingUp size={18} />}
                src={data.charts.topPackages}
                alt="Bar chart of top packages by revenue"
              />
            </div>

            <div className="analytics-grid-2">
              <ChartPanel
                title="Revenue by destination"
                subtitle="Realized revenue per place"
                icon={<TrendingUp size={18} />}
                src={data.charts.destinationPerformance}
                alt="Bar chart of revenue by destination"
              />
              <ChartPanel
                title="Rating distribution"
                subtitle="Traveler reviews by star"
                icon={<Star size={18} />}
                src={data.charts.ratingDistribution}
                alt="Bar chart of review rating distribution"
              />
            </div>

            <div className="analytics-grid-2">
              <ChartPanel
                title="New users — last 12 months"
                subtitle="Account signups over time"
                icon={<Users size={18} />}
                src={data.charts.signups}
                alt="Line chart of new user signups over the last 12 months"
              />
              <ChartPanel
                title="Upcoming demand"
                subtitle="Travelers & bookings by travel-date month (next 6)"
                icon={<CalendarCheck size={18} />}
                src={data.charts.seasonality}
                alt="Grouped bar chart of upcoming travelers and bookings"
              />
            </div>

            {/* Drawback tables */}
            <div className="analytics-grid-2">
              <Card as="section" className="chart-panel">
                <div className="chart-panel-head">
                  <h2>
                    <AlertTriangle size={18} />
                    Dead inventory
                  </h2>
                  <p className="muted">Available packages with no bookings</p>
                </div>
                {data.deadInventory.length === 0 ? (
                  <EmptyState message="Every available package has bookings. 🎉" />
                ) : (
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Package</th>
                        <th>Destination</th>
                        <th className="analytics-num">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.deadInventory.map((p) => (
                        <tr key={p.id}>
                          <td data-label="Package">{p.title}</td>
                          <td data-label="Destination">{p.destination}</td>
                          <td data-label="Price" className="analytics-num">{formatCurrency(p.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>

              <Card as="section" className="chart-panel">
                <div className="chart-panel-head">
                  <h2>
                    <Star size={18} />
                    Lowest-rated packages
                  </h2>
                  <p className="muted">Averaging below 3 stars</p>
                </div>
                {data.lowestRated.length === 0 ? (
                  <EmptyState message="No packages are rated below 3 stars." />
                ) : (
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Package</th>
                        <th className="analytics-num">Avg rating</th>
                        <th className="analytics-num">Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowestRated.map((p) => (
                        <tr key={p.id}>
                          <td data-label="Package">{p.title}</td>
                          <td data-label="Avg rating" className="analytics-num">{p.avgRating.toFixed(1)} ★</td>
                          <td data-label="Reviews" className="analytics-num">{p.reviews}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
