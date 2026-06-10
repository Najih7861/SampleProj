import { Link } from 'react-router-dom'
import type { Package } from '../types'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'

export default function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <Link to={`/packages/${pkg.id}`} className="card">
      <img src={pkg.imageUrl || FALLBACK_IMG} alt={pkg.title} />
      <div className="card-body">
        <h3>{pkg.title}</h3>
        <span className="destination">📍 {pkg.destination}</span>
        <div className="card-meta">
          <span className="price">${pkg.price.toLocaleString()}</span>
          <span className="duration">{pkg.durationDays} days</span>
        </div>
      </div>
    </Link>
  )
}
