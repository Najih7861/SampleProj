import { useId } from 'react'
import type { ReactNode, SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label?: ReactNode
  hint?: string
  error?: string
  id?: string
  layout?: 'row' | 'field'
  /** Provide options, or pass <option> children directly. */
  options?: SelectOption[]
}

export default function Select({
  label,
  hint,
  error,
  id,
  layout = 'row',
  options,
  className = '',
  children,
  ...rest
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  const describedBy =
    [hint ? `${selectId}-hint` : '', error ? `${selectId}-error` : ''].filter(Boolean).join(' ') || undefined

  return (
    <div className={layout === 'field' ? 'field' : 'form-row'}>
      {label && <label htmlFor={selectId}>{label}</label>}
      <select
        id={selectId}
        className={[error ? 'input-invalid' : '', className].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      {hint && !error && (
        <span className="field-hint" id={`${selectId}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field-error" id={`${selectId}-error`}>
          {error}
        </span>
      )}
    </div>
  )
}
