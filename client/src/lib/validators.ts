// Composable, dependency-free field validators. Each returns `undefined` when
// the value is valid, or an error message string when it is not. Combine with
// `compose(...)` — the first failing validator wins.

export type Validator<T = string> = (value: T) => string | undefined

export const required = (msg = 'This field is required.'): Validator<string> =>
  (value) => (value != null && String(value).trim() !== '' ? undefined : msg)

export const email = (msg = 'Enter a valid email address.'): Validator<string> =>
  (value) => (!value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : msg)

// Phone is optional by convention: blank passes. When present it must look like
// a phone number (digits with optional + ( ) - and spaces, at least 6 chars).
export const phone = (msg = 'Enter a valid phone number.'): Validator<string> =>
  (value) => {
    if (!value || value.trim() === '') return undefined
    return /^[+\d][\d\s()-]{5,}$/.test(value.trim()) ? undefined : msg
  }

export const minLength = (n: number, msg?: string): Validator<string> =>
  (value) => ((value ?? '').trim().length >= n ? undefined : msg ?? `Must be at least ${n} characters.`)

export const maxLength = (n: number, msg?: string): Validator<string> =>
  (value) => ((value ?? '').length <= n ? undefined : msg ?? `Must be ${n} characters or fewer.`)

export const numberRange = (min: number, max: number, msg?: string): Validator<number> =>
  (value) =>
    typeof value === 'number' && !Number.isNaN(value) && value >= min && value <= max
      ? undefined
      : msg ?? `Enter a number between ${min} and ${max}.`

export const compose = <T>(...validators: Validator<T>[]): Validator<T> =>
  (value) => {
    for (const validate of validators) {
      const result = validate(value)
      if (result) return result
    }
    return undefined
  }
