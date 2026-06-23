import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'cta' | 'ghost' | 'danger' | 'link'

function buildClasses(
  variant: ButtonVariant,
  size: 'md' | 'sm',
  fullWidth: boolean,
  extra: string,
): string {
  return [
    variant === 'link' ? 'btn-link' : `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : '',
    'icon-text',
    fullWidth ? 'btn-block' : '',
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'md' | 'sm'
  icon?: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buildClasses(variant, size, fullWidth, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="spin" size={16} aria-hidden /> : icon}
      {children}
    </button>
  )
}

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant
  size?: 'md' | 'sm'
  icon?: ReactNode
  fullWidth?: boolean
}

/** Same button styling applied to a react-router Link (for navigation CTAs). */
export function LinkButton({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link className={buildClasses(variant, size, fullWidth, className)} {...rest}>
      {icon}
      {children}
    </Link>
  )
}
