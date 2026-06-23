import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Compass,
  MapPinned,
  Plus,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAdminStats } from '../api/adminStats'
import { getBookings } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import StarRating from '../components/reviews/StarRating'
import { LinkButton } from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import PageHeader from '../components/ui/PageHeader'
import Skeleton from '../components/ui/Skeleton'
import Spinner from '../components/ui/Spinner'
import StatusBadge from '../components/ui/StatusBadge'
import { useAsync } from '../hooks/useAsync'
import { formatDate } from '../lib/format'
import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  iconClass?: string
  value: number | string
  label: string
  to: string
  linkLabel?: string
}

function StatCard({ icon, iconClass, value, label, to, linkLabel = 'View' }: StatCardProps) {
  return (
    <Link to={to} className="card stat-card">
      <span className="stat-card-top">
        <span className="stat-value">{value}</span>
        <span className={`stat-icon ${iconClass ?? ''}`.trim()} aria-hidden>
          {icon}
        </span>
      </span>
      <span className="stat-label">{label}</span>
      <span className="stat-card-link">
        {linkLabel} <ArrowRight size={14} aria-hidden />
      </span>
    </Link>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const {
    data: stats,
    loading,
    error,
    reload,
  } = useAsync(() => getAdminStats(), [], { errorMessage: 'Could not load dashboard stats.' })

  const {
    data: bookings,
    loading: bookingsLoading,
    error: bookingsError,
  } = useAsync(() => getBookings(), [], { errorMessage: 'Could not load recent bookings.' })

  const recent = [...(bookings ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          eyebrow="Admin"
          title="Dashboard"
          description={`Welcome back, ${user?.username ?? 'admin'}. Here's what's happening across Wanderlust Tours.`}
          actions={
            <LinkButton to="/admin/packages" variant="ghost" size="sm" icon={<Plus size={16} aria-hidden />}>
              New package
            </LinkButton>
          }
        />

        {loading && (
          <div className="stat-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card card-static stat-card">
                <Skeleton width="45%" height="2rem" />
                <Skeleton width="70%" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <ErrorMessage
            title="Dashboard unavailable"
            message={error}
            action={
              <button type="button" className="btn-primary" onClick={reload}>
                Retry
              </button>
            }
          />
        )}

        {stats && !loading && !error && (
          <>
            <div className="stat-grid">
              <StatCard
                icon={<Compass size={20} />}
                value={stats.totalPackages}
                label="Tour packages"
                to="/admin/packages"
                linkLabel="Manage"
              />
              <StatCard
                icon={<MapPinned size={20} />}
                value={stats.totalPlaces}
                label="Destinations"
                to="/admin/places"
                linkLabel="Manage"
              />
              <StatCard
                icon={<CalendarCheck size={20} />}
                value={stats.totalBookings}
                label="Total bookings"
                to="/admin/bookings"
                linkLabel="View all"
              />
              <StatCard
                icon={<Clock3 size={20} />}
                iconClass="stat-icon-pending"
                value={stats.pendingBookings}
                label="Pending bookings"
                to="/admin/bookings?status=Pending"
                linkLabel="Review"
              />
              <StatCard
                icon={<CheckCircle2 size={20} />}
                iconClass="stat-icon-confirmed"
                value={stats.confirmedBookings}
                label="Confirmed bookings"
                to="/admin/bookings?status=Confirmed"
              />
              <StatCard
                icon={<XCircle size={20} />}
                iconClass="stat-icon-cancelled"
                value={stats.cancelledBookings}
                label="Cancelled bookings"
                to="/admin/bookings?status=Cancelled"
              />
            </div>

            <div className="dashboard-columns">
              <Card as="section" className="dashboard-panel">
                <h2>Recent bookings</h2>
                {bookingsLoading && <Spinner label="Loading recent bookings" />}
                {bookingsError && !bookingsLoading && <ErrorMessage inline message={bookingsError} />}
                {!bookingsLoading && !bookingsError && recent.length === 0 && (
                  <EmptyState message="No bookings have been made yet." />
                )}
                {!bookingsLoading && !bookingsError && recent.length > 0 && (
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Tour</th>
                        <th>Travel date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((booking) => (
                        <tr key={booking.id}>
                          <td data-label="Customer">{booking.customerName}</td>
                          <td data-label="Tour">{booking.packageTitle}</td>
                          <td data-label="Travel date">{formatDate(booking.travelDate)}</td>
                          <td data-label="Status">
                            <StatusBadge status={booking.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>

              <Card as="section" className="dashboard-panel">
                <h2>Traveler ratings</h2>
                <div className="dashboard-rating">
                  <span className="dashboard-rating-value">{stats.averageRating.toFixed(1)}</span>
                  <div>
                    <StarRating value={stats.averageRating} />
                    <p className="muted" style={{ marginBottom: 0 }}>
                      {stats.totalReviews} review{stats.totalReviews === 1 ? '' : 's'} across all tours
                    </p>
                  </div>
                </div>
                <p className="muted" style={{ marginTop: '1rem', marginBottom: 0 }}>
                  Ratings come from verified travelers after their trips.
                </p>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
