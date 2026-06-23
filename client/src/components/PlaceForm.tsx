import { useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, Save, Trash2, Upload } from 'lucide-react'
import { uploadImage } from '../api/uploads'
import { useForm } from '../hooks/useForm'
import { required } from '../lib/validators'
import Button from './ui/Button'
import FormActions from './ui/FormActions'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import type { Place, PlaceInput } from '../types'

interface Props {
  initial?: Place
  onSubmit: (input: PlaceInput) => Promise<void>
  onCancel: () => void
}

interface PlaceFormValues {
  name: string
  description: string
}

export default function PlaceForm({ initial, onSubmit, onCancel }: Props) {
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.images ?? [])
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const form = useForm<PlaceFormValues>(
    {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
    },
    {
      name: required(),
    },
  )

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return
    setUploadError(null)
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file))
      }
      setImageUrls((prev) => [...prev, ...uploaded])
    } catch {
      setUploadError('Could not upload one or more images. Please try again.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  function addByUrl() {
    const url = urlInput.trim()
    if (!url) return
    setImageUrls((prev) => [...prev, url])
    setUrlInput('')
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

  const handleSubmit = form.handleSubmit(async (values) => {
    setPhotoError(null)
    if (imageUrls.length < 5) {
      setPhotoError('Please add at least 5 photos for the slideshow.')
      return
    }
    await onSubmit({ name: values.name, description: values.description, imageUrls })
  })

  return (
    <form onSubmit={handleSubmit}>
      {form.submitError && <p className="notice notice-error">{form.submitError}</p>}
      {uploadError && <p className="notice notice-error">{uploadError}</p>}
      {photoError && <p className="notice notice-error">{photoError}</p>}

      <Input
        id="place-name"
        label="Name"
        required
        value={form.values.name}
        onChange={(event) => form.setField('name', event.target.value)}
        onBlur={() => form.handleBlur('name')}
        error={form.errors.name}
        placeholder="Bali, Indonesia"
      />
      <Textarea
        id="place-desc"
        label="Detailed description"
        rows={4}
        value={form.values.description}
        onChange={(event) => form.setField('description', event.target.value)}
        onBlur={() => form.handleBlur('description')}
        error={form.errors.description}
      />

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
        </div>
        <div className="cover-input-row">
          <input
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            placeholder="Paste an image URL"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus size={15} aria-hidden />}
            onClick={addByUrl}
          >
            Add
          </Button>
        </div>
      </div>

      <FormActions>
        <Button variant="ghost" onClick={onCancel} disabled={form.submitting}>Cancel</Button>
        <Button
          type="submit"
          variant="primary"
          icon={<Save size={16} aria-hidden />}
          loading={form.submitting}
          disabled={uploading}
        >
          Save
        </Button>
      </FormActions>
    </form>
  )
}
