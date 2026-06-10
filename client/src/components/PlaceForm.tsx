import { useState } from 'react'
import { uploadImage } from '../api/uploads'
import type { Place, PlaceInput } from '../types'

interface Props {
  initial?: Place
  onSubmit: (input: PlaceInput) => Promise<void>
  onCancel: () => void
}

// Admin form to create/edit a place and manage its gallery. Photos can be
// uploaded (saved to wwwroot/uploads) or added by URL; at least 5 are required
// so the Home slideshow always has enough images.
export default function PlaceForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file))
      }
      setImageUrls((prev) => [...prev, ...uploaded])
    } catch {
      setError('Could not upload one or more images. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function addByUrl() {
    const url = window.prompt('Paste an image URL')
    if (url && url.trim()) setImageUrls((prev) => [...prev, url.trim()])
  }

  function removeAt(i: number) {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== i))
  }

  function move(i: number, dir: -1 | 1) {
    setImageUrls((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (imageUrls.length < 5) {
      setError('Please add at least 5 photos for the slideshow.')
      return
    }
    setSaving(true)
    try {
      await onSubmit({ name, description, imageUrls })
    } catch {
      setError('Could not save the place. Please try again.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{initial ? 'Edit Place' : 'New Place'}</h2>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label htmlFor="place-name">Name</label>
        <input id="place-name" required value={name}
          onChange={(e) => setName(e.target.value)} placeholder="e.g. Bali, Indonesia" />
      </div>
      <div className="form-row">
        <label htmlFor="place-desc">Detailed description</label>
        <textarea id="place-desc" rows={4} value={description}
          onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="form-row">
        <label>Gallery photos ({imageUrls.length}) — at least 5</label>
        <div className="gallery-grid">
          {imageUrls.map((url, i) => (
            <div className="gallery-item" key={`${url}-${i}`}>
              <img src={url} alt={`Gallery ${i + 1}`} />
              <div className="gallery-item-actions">
                <button type="button" title="Move left" onClick={() => move(i, -1)}>←</button>
                <button type="button" title="Remove" onClick={() => removeAt(i)}>✕</button>
                <button type="button" title="Move right" onClick={() => move(i, 1)}>→</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
          <label className="btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            {uploading ? 'Uploading…' : '+ Upload photos'}
            <input type="file" accept="image/*" multiple hidden onChange={handleFiles} disabled={uploading} />
          </label>
          <button type="button" className="btn-ghost btn-sm" onClick={addByUrl}>+ Add by URL</button>
        </div>
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
