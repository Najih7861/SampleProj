import { useId } from 'react'
import type { ReactNode, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label?: ReactNode
  hint?: string
  error?: string
  id?: string
  layout?: 'row' | 'field'
}

export default function Textarea({
  label,
  hint,
  error,
  id,
  layout = 'row',
  className = '',
  ...rest
}: TextareaProps) {
  const autoId = useId()
  const textareaId = id ?? autoId
  const describedBy =
    [hint ? `${textareaId}-hint` : '', error ? `${textareaId}-error` : ''].filter(Boolean).join(' ') || undefined

  return (
    <div className={layout === 'field' ? 'field' : 'form-row'}>
      {label && <label htmlFor={textareaId}>{label}</label>}
      <textarea
        id={textareaId}
        className={[error ? 'input-invalid' : '', className].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && !error && (
        <span className="field-hint" id={`${textareaId}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field-error" id={`${textareaId}-error`}>
          {error}
        </span>
      )}
    </div>
  )
}
