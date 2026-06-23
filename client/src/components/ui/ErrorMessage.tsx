import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import DataState from './DataState'

interface ErrorMessageProps {
  message: string
  title?: string
  action?: ReactNode
  /** Render as a compact inline notice instead of a full-height state block. */
  inline?: boolean
}

export default function ErrorMessage({
  message,
  title = 'Something went wrong',
  action,
  inline = false,
}: ErrorMessageProps) {
  if (inline) {
    return (
      <p className="notice notice-error" role="alert">
        {message}
      </p>
    )
  }
  return (
    <DataState tone="error" title={title} message={message} icon={<AlertTriangle size={28} />} action={action} />
  )
}
