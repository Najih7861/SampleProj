import { useState } from 'react'
import { ArrowLeft, ArrowRight, Link as LinkIcon, Save, Trash2, Upload } from 'lucide-react'
import { uploadImage } from '../api/uploads'
import FormActions from './ui/FormActions'
import type { Place, PlaceInput } from '../types'

interface Props {
  initial?: Place
  onSubmit: (input: PlaceInput) => Promise<void>
  onCancel: () => void
}

export default function PlaceForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
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
      event.target.value = ''
    }
  }

  function addByUrl() {
    const url = window.prompt('Paste an image URL')
    if (url && url.trim()) setImageUrls((prev) => [...prev, url.trim()])
  }

  function removeAt(index: number) {
    setImageUrls((prev) => prev.filter((_, current) => current !== index))
  }

  function move(index: number, dir: -1 | 1) {
    setImageUrls((prev) => {
      const nextIndex = index + dir
      if (nextIndex < 0 || nextIndex >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
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
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label htmlFor="place-name">Name</label>
        <input
          id="place-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Bali, Indonesia"
        />
      </div>
      <div className="form-row">
        <label htmlFor="place-desc">Detailed description</label>
        <textarea
          id="place-desc"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="form-row">
        <label>Gallery photos ({imageUrls.length}) - at least 5</label>
        <div className="gallery-grid">
          {imageUrls.map((url, index) => (
            <div className="gallery-item" key={`${url}-${index}`}>
              <img src={url} alt={`Gallery ${index + 1}`} />
              <div className="gallery-item-actions">
                <button type="button" title="Move left" aria-label="Move photo left" onClick={() => move(index, -1)}>
                  <ArrowLeft size={14} aria-hidden />
                </button>
                <button type="button" title="Remove" aria-label="Remove photo" onClick={() => removeAt(index)}>
                  <Trash2 size={14} aria-hidden />
                </button>
                <button type="button" title="Move right" aria-label="Move photo right" onClick={() => move(index, 1)}>
                  <ArrowRight size={14} aria-hidden />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="upload-actions">
          <label className="btn-ghost btn-sm icon-text file-button">
            <Upload size={15} aria-hidden />
            {uploading ? 'Uploading...' : 'Upload photos'}
            <input type="file" accept="image/*" multiple hidden onChange={handleFiles} disabled={uploading} />
          </label>
          <button type="button" className="btn-ghost btn-sm icon-text" onClick={addByUrl}>
            <LinkIcon size={15} aria-hidden />
            Add by URL
          </button>
        </div>
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
