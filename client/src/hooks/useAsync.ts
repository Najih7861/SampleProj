import { useCallback, useEffect, useState } from 'react'
import { authErrorMessage } from '../api/auth'

export interface UseAsyncResult<T> {
  data: T | undefined
  loading: boolean
  error: string | null
  /** Re-run the async function (e.g. after a mutation). */
  reload: () => void
  /** Update the cached data directly (optimistic updates). */
  setData: React.Dispatch<React.SetStateAction<T | undefined>>
}

/**
 * Runs an async loader and tracks { data, loading, error } with a cancellation
 * guard, so pages stop hand-rolling the same effect. Re-runs when `deps` change
 * or `reload()` is called. Resets data on dep change so a key switch (e.g. a new
 * package id) doesn't flash stale content. Errors are normalised via
 * authErrorMessage so any axios/API failure becomes a readable string.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList,
  options?: { errorMessage?: string },
): UseAsyncResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  useEffect(() => {
    let active = true

    // All state updates live inside the async loader (not the synchronous effect
    // body) so a fresh request, success, and failure each settle in their own tick.
    async function run() {
      setLoading(true)
      setError(null)
      setData(undefined)
      try {
        const result = await fn()
        if (active) setData(result)
      } catch (err) {
        if (active) {
          setError(authErrorMessage(err, options?.errorMessage ?? 'Something went wrong. Please try again.'))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void run()

    return () => {
      active = false
    }
    // fn/options are intentionally excluded — callers pass `deps` to control re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount])

  return { data, loading, error, reload, setData }
}
