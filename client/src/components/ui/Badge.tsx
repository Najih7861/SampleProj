import type { ReactNode } from 'react'

export type BadgeTone = 'pending' | 'confirmed' | 'available' | 'cancelled' | 'unavailable' | 'neutral'

interface BadgeProps {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
}

/** Generic pill badge. For booking/availability status use StatusBadge instead. */
export default function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon}
      {children}
    </span>
  )
}
