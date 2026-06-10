import { useState } from 'react'
import type { Package, PackageInput } from '../types'

interface Props {
  initial?: Package
  onSubmit: (input: PackageInput) => Promise<void>
  onCancel: () => void
}

export default function PackageForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [destination, setDestination] = useState(initial?.destination ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price ?? 0)
  const [durationDays, setDurationDays] = useState(initial?.durationDays ?? 1)
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        title, destination, description, price, durationDays,
        imageUrl: imageUrl || null, isAvailable,
      })
    } catch {
      setError('Could not save the package. Please try again.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{initial ? 'Edit Package' : 'New Package'}</h2>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label htmlFor="title">Title</label>
        <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="dest">Destination</label>
        <input id="dest" required value={destination} onChange={(e) => setDestination(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="desc">Description</label>
        <textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="price">Price (USD)</label>
          <input id="price" type="number" min={0} step="0.01" required value={price}
            onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
        <div className="form-row">
          <label htmlFor="duration">Duration (days)</label>
          <input id="duration" type="number" min={1} max={365} required value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))} />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="img">Image URL (optional)</label>
        <input id="img" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…" />
      </div>
      <div className="form-row" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
        <input id="avail" type="checkbox" style={{ width: 'auto' }} checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)} />
        <label htmlFor="avail" style={{ margin: 0 }}>Available for booking</label>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
