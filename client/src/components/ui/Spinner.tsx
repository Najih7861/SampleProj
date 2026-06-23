import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: number
  label?: string
}

export default function Spinner({ size = 28, label = 'Loading' }: SpinnerProps) {
  return (
    <span className="icon-text" role="status">
      <Loader2 className="spin" size={size} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  )
}
