import { useEffect, useState } from 'react'
import { getPlaces } from '../api/places'
import { uploadImage } from '../api/uploads'
import type { Package, PackageInput, Place } from '../types'

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
  const [placeId, setPlaceId] = useState<string>(initial?.placeId != null ? String(initial.placeId) : '')
  const [places, setPlaces] = useState<Place[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPlaces().then(setPlaces).catch(() => setPlaces([]))
  }, [])

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      setImageUrl(await uploadImage(file))
    } catch {
      setError('Could not upload the cover image.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        title, destination, description, price, durationDays,
        imageUrl: imageUrl || null, isAvailable,
        placeId: placeId ? Number(placeId) : null,
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
        <label htmlFor="place">Place</label>
        <select id="place" value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
          <option value="">— None —</option>
          {places.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="img">Cover image</label>
        <input id="img" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://… or upload a photo" />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
          <label className="btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            {uploading ? 'Uploading…' : '+ Upload photo'}
            <input type="file" accept="image/*" hidden onChange={handleCover} disabled={uploading} />
          </label>
          {imageUrl && <img src={imageUrl} alt="cover preview" className="cover-preview" />}
        </div>
      </div>
      <div className="form-row" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
        <input id="avail" type="checkbox" style={{ width: 'auto' }} checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)} />
        <label htmlFor="avail" style={{ margin: 0 }}>Available for booking</label>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
