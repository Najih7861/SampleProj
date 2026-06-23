import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import type { ToastItem, ToastTone } from './useToast'

const icons: Record<ToastTone, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

interface ToastProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = icons[toast.tone]
  return (
    <div
      className={`toast toast-${toast.tone} ${toast.leaving ? 'toast--leaving' : ''}`.trim()}
      role={toast.tone === 'error' ? 'alert' : 'status'}
    >
      <span className="toast-icon" aria-hidden>
        <Icon size={18} />
      </span>
      <div className="toast-content">
        {toast.title && <span className="toast-title">{toast.title}</span>}
        <span className="toast-message">{toast.message}</span>
      </div>
      <button
        type="button"
        className="toast-close"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <X size={15} />
      </button>
    </div>
  )
}
