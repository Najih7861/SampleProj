import type { ReactNode } from 'react'

interface FormActionsProps {
  children: ReactNode
  align?: 'start' | 'end' | 'stretch'
}

export default function FormActions({ children, align = 'end' }: FormActionsProps) {
  return <div className={`form-actions form-actions-${align}`}>{children}</div>
}
