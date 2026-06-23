import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from './ui/StatusBadge'
import { formatCurrency } from '../lib/format'
import type { Package } from '../types'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900'

export default function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <Link to={`/packages/${pkg.id}`} className="card package-card">
      <span className="package-card-media">
        <img src={pkg.imageUrl || FALLBACK_IMG} alt={pkg.title} loading="lazy" />
        {!pkg.isAvailable && <span className="package-card-status"><StatusBadge status="Unavailable" /></span>}
      </span>
      <span className="card-body">
        <span className="destination"><MapPin size={15} aria-hidden /> {pkg.destination}</span>
        <span className="package-card-title">{pkg.title}</span>
        <span className="card-meta">
          <span className="price">{formatCurrency(pkg.price)}</span>
          <span className="duration"><CalendarDays size={14} aria-hidden /> {pkg.durationDays} days</span>
        </span>
        <span className="card-link">
          View details <ArrowRight size={16} aria-hidden />
        </span>
      </span>
    </Link>
  )
}
