import { useCallback, useMemo, useState } from 'react'
import { authErrorMessage } from '../api/auth'
import type { Validator } from '../lib/validators'

export type FieldSchema<V> = { [K in keyof V]?: Validator<V[K]> }
type Errors<V> = Partial<Record<keyof V, string>>
type Touched<V> = Partial<Record<keyof V, boolean>>

export interface UseFormResult<V> {
  values: V
  /** Errors that should currently be shown (field touched or submit attempted). */
  errors: Errors<V>
  touched: Touched<V>
  submitting: boolean
  submitError: string | null
  /** True when every field passes its validator, regardless of touched state. */
  isValid: boolean
  setField: <K extends keyof V>(key: K, value: V[K]) => void
  handleBlur: (key: keyof V) => void
  handleSubmit: (onValid: (values: V) => Promise<void> | void) => (e: React.FormEvent) => void
  reset: (next?: Partial<V>) => void
  setSubmitError: (message: string | null) => void
}

function computeErrors<V extends object>(values: V, schema: FieldSchema<V>): Errors<V> {
  const result: Errors<V> = {}
  ;(Object.keys(schema) as (keyof V)[]).forEach((key) => {
    const validate = schema[key]
    if (!validate) return
    const message = validate(values[key])
    if (message) result[key] = message
  })
  return result
}

/**
 * Typed form state with per-field validation and an async submit wrapper.
 * Field errors surface only after the field is blurred or a submit is attempted;
 * submit failures are normalised to a readable message via authErrorMessage.
 */
export function useForm<V extends object>(
  initial: V,
  schema: FieldSchema<V> = {},
): UseFormResult<V> {
  const [values, setValues] = useState<V>(initial)
  const [touched, setTouched] = useState<Touched<V>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const errors = useMemo(() => computeErrors(values, schema), [values, schema])
  const isValid = Object.keys(errors).length === 0

  const setField = useCallback(<K extends keyof V>(key: K, value: V[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }) as V)
  }, [])

  const handleBlur = useCallback((key: keyof V) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }, [])

  const handleSubmit = useCallback(
    (onValid: (values: V) => Promise<void> | void) => async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitAttempted(true)
      setSubmitError(null)

      const currentErrors = computeErrors(values, schema)
      if (Object.keys(currentErrors).length > 0) {
        const allTouched: Touched<V> = {}
        ;(Object.keys(values) as (keyof V)[]).forEach((key) => {
          allTouched[key] = true
        })
        setTouched(allTouched)
        return
      }

      setSubmitting(true)
      try {
        await onValid(values)
      } catch (err) {
        setSubmitError(authErrorMessage(err, 'Something went wrong. Please try again.'))
      } finally {
        setSubmitting(false)
      }
    },
    [schema, values],
  )

  const reset = useCallback(
    (next?: Partial<V>) => {
      setValues((prev) => ({ ...prev, ...(next ?? initial) }) as V)
      setTouched({})
      setSubmitAttempted(false)
      setSubmitError(null)
    },
    [initial],
  )

  const visibleErrors = useMemo<Errors<V>>(() => {
    const result: Errors<V> = {}
    ;(Object.keys(errors) as (keyof V)[]).forEach((key) => {
      if (submitAttempted || touched[key]) result[key] = errors[key]
    })
    return result
  }, [errors, touched, submitAttempted])

  return {
    values,
    errors: visibleErrors,
    touched,
    submitting,
    submitError,
    isValid,
    setField,
    handleBlur,
    handleSubmit,
    reset,
    setSubmitError,
  }
}
