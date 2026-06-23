import type { ReactNode } from 'react'
import DataState from './DataState'

interface EmptyStateProps {
  title?: string
  message: string
  icon?: ReactNode
  action?: ReactNode
}

/** Neutral "nothing here yet" state — a thin preset over DataState. */
export default function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  return <DataState tone="neutral" title={title} message={message} icon={icon} action={action} />
}
