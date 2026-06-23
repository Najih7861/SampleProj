import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastOptions {
  tone?: ToastTone
  title?: string
  /** Auto-dismiss after this many ms. Pass 0 to keep until dismissed. Default 4500. */
  duration?: number
}

export interface ToastItem {
  id: string
  tone: ToastTone
  title?: string
  message: string
  duration: number
  leaving?: boolean
}

export interface ToastApi {
  show: (message: string, opts?: ToastOptions) => string
  success: (message: string, opts?: Omit<ToastOptions, 'tone'>) => string
  error: (message: string, opts?: Omit<ToastOptions, 'tone'>) => string
  info: (message: string, opts?: Omit<ToastOptions, 'tone'>) => string
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
