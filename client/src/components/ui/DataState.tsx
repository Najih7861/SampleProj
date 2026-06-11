import type { ReactNode } from 'react'

interface DataStateProps {
  title?: string
  message: string
  icon?: ReactNode
  tone?: 'neutral' | 'error'
  action?: ReactNode
}

export default function DataState({
  title,
  message,
  icon,
  tone = 'neutral',
  action,
}: DataStateProps) {
  return (
    <div className={`data-state data-state-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {icon && <div className="data-state-icon" aria-hidden>{icon}</div>}
      {title && <h2>{title}</h2>}
      <p>{message}</p>
      {action && <div className="data-state-action">{action}</div>}
    </div>
  )
}
