import { useEffect, useState } from 'react'
import { ImageUp, Link as LinkIcon, Save } from 'lucide-react'
import { getPlaces } from '../api/places'
import { uploadImage } from '../api/uploads'
import FormActions from './ui/FormActions'
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
    let active = true

    async function loadPlaces() {
      try {
        const data = await getPlaces()
        if (active) setPlaces(data)
      } catch {
        if (active) setPlaces([])
      }
    }

    void loadPlaces()
    return () => { active = false }
  }, [])

  async function handleCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      setImageUrl(await uploadImage(file))
    } catch {
      setError('Could not upload the cover image.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        title,
        destination,
        description,
        price,
        durationDays,
        imageUrl: imageUrl || null,
        isAvailable,
        placeId: placeId ? Number(placeId) : null,
      })
    } catch {
      setError('Could not save the package. Please try again.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label htmlFor="title">Title</label>
        <input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="dest">Destination</label>
        <input id="dest" required value={destination} onChange={(event) => setDestination(event.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="desc">Description</label>
        <textarea id="desc" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="price">Price (USD)</label>
          <input
            id="price"
            type="number"
            min={0}
            step="0.01"
            required
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
          />
        </div>
        <div className="form-row">
          <label htmlFor="duration">Duration (days)</label>
          <input
            id="duration"
            type="number"
            min={1}
            max={365}
            required
            value={durationDays}
            onChange={(event) => setDurationDays(Number(event.target.value))}
          />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="place">Place</label>
        <select id="place" value={placeId} onChange={(event) => setPlaceId(event.target.value)}>
          <option value="">None</option>
          {places.map((place) => (
            <option key={place.id} value={place.id}>{place.name}</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="img">Cover image</label>
        <div className="cover-input-row">
          <input
            id="img"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://... or upload a photo"
          />
          {imageUrl && <img src={imageUrl} alt="Cover preview" className="cover-preview" />}
        </div>
        <div className="upload-actions">
          <label className="btn-ghost btn-sm icon-text file-button">
            <ImageUp size={15} aria-hidden />
            {uploading ? 'Uploading...' : 'Upload photo'}
            <input type="file" accept="image/*" hidden onChange={handleCover} disabled={uploading} />
          </label>
          <span className="field-hint icon-text"><LinkIcon size={14} aria-hidden /> Direct image URLs are supported.</span>
        </div>
      </div>
      <div className="form-row checkbox-row">
        <input
          id="avail"
          type="checkbox"
          checked={isAvailable}
          onChange={(event) => setIsAvailable(event.target.checked)}
        />
        <label htmlFor="avail">Available for booking</label>
      </div>

      <FormActions>
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn-primary icon-text" disabled={saving || uploading}>
          <Save size={16} aria-hidden />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </FormActions>
    </form>
  )
}
