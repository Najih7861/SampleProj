import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: ReactNode
  hint?: string
  error?: string
  id?: string
  /** 'row' = stacked form field (.form-row); 'field' = compact filter field (.field). */
  layout?: 'row' | 'field'
}

export default function Input({
  label,
  hint,
  error,
  id,
  layout = 'row',
  className = '',
  ...rest
}: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const describedBy =
    [hint ? `${inputId}-hint` : '', error ? `${inputId}-error` : ''].filter(Boolean).join(' ') || undefined

  return (
    <div className={layout === 'field' ? 'field' : 'form-row'}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        className={[error ? 'input-invalid' : '', className].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && !error && (
        <span className="field-hint" id={`${inputId}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field-error" id={`${inputId}-error`}>
          {error}
        </span>
      )}
    </div>
  )
}
