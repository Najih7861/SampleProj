import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Toast from './Toast'
import { ToastContext } from './useToast'
import type { ToastApi, ToastItem, ToastOptions } from './useToast'

// Module-level counter for stable unique ids (no Math.random / Date.now needed).
let counter = 0
const EXIT_MS = 160

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    // Mark as leaving for the exit animation, then remove from the list.
    setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, EXIT_MS)
  }, [])

  const show = useCallback(
    (message: string, opts?: ToastOptions) => {
      counter += 1
      const id = `toast-${counter}`
      const duration = opts?.duration ?? 4500
      const item: ToastItem = {
        id,
        tone: opts?.tone ?? 'info',
        title: opts?.title,
        message,
        duration,
      }
      setToasts((prev) => [...prev, item])
      if (duration > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), duration))
      }
      return id
    },
    [dismiss],
  )

  const api: ToastApi = useMemo(
    () => ({
      show,
      success: (message, opts) => show(message, { ...opts, tone: 'success' }),
      error: (message, opts) => show(message, { ...opts, tone: 'error' }),
      info: (message, opts) => show(message, { ...opts, tone: 'info' }),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" role="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
