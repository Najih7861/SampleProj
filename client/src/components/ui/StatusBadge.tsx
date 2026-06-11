import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
import type { BookingStatus } from '../../types'

interface StatusBadgeProps {
  status: BookingStatus | 'Available' | 'Unavailable'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase()
  const Icon =
    status === 'Confirmed' || status === 'Available'
      ? CheckCircle2
      : status === 'Cancelled' || status === 'Unavailable'
        ? XCircle
        : Clock3

  return (
    <span className={`badge badge-${normalized}`}>
      <Icon size={14} aria-hidden />
      {status}
    </span>
  )
}
