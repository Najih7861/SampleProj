// Shared formatting helpers so currency/date display is consistent everywhere
// (replaces inline `$${n.toLocaleString()}` / `new Date(x).toLocaleDateString()`).

const currencyCache = new Map<string, Intl.NumberFormat>()

function currencyFormatter(currency: string): Intl.NumberFormat {
  let formatter = currencyCache.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    currencyCache.set(currency, formatter)
  }
  return formatter
}

/** e.g. 1299 -> "$1,299", 1299.5 -> "$1,299.5". */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return currencyFormatter(currency).format(amount)
}

/** e.g. "Jun 23, 2026" (short) or "June 23, 2026" (long). Falls back to the raw string. */
export function formatDate(iso: string, style: 'short' | 'long' = 'short'): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(
    'en-US',
    style === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' },
  )
}

/** e.g. "Jun 23, 2026, 4:05 PM". Falls back to the raw string. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
