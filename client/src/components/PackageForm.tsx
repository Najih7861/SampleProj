import { useEffect, useState } from 'react'
import { ImageUp, Link as LinkIcon, Save } from 'lucide-react'
import { getPlaces } from '../api/places'
import { uploadImage } from '../api/uploads'
import { useForm } from '../hooks/useForm'
import { numberRange, required } from '../lib/validators'
import Button from './ui/Button'
import FormActions from './ui/FormActions'
import Input from './ui/Input'
import Select from './ui/Select'
import Spinner from './ui/Spinner'
import Textarea from './ui/Textarea'
import type { Package, PackageInput, Place } from '../types'

interface Props {
  initial?: Package
  onSubmit: (input: PackageInput) => Promise<void>
  onCancel: () => void
}

interface PackageFormValues {
  title: string
  destination: string
  description: string
  price: number
  durationDays: number
}

export default function PackageForm({ initial, onSubmit, onCancel }: Props) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true)
  const [placeId, setPlaceId] = useState<string>(initial?.placeId != null ? String(initial.placeId) : '')
  const [places, setPlaces] = useState<Place[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const form = useForm<PackageFormValues>(
    {
      title: initial?.title ?? '',
      destination: initial?.destination ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? 0,
      durationDays: initial?.durationDays ?? 1,
    },
    {
      title: required(),
      destination: required(),
      price: numberRange(0, 1000000, 'Price must be 0 or more'),
      durationDays: numberRange(1, 365),
    },
  )

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
    setUploadError(null)
    setUploading(true)
    try {
      setImageUrl(await uploadImage(file))
    } catch {
      setUploadError('Could not upload the cover image.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      destination: values.destination,
      description: values.description,
      price: values.price,
      durationDays: values.durationDays,
      imageUrl: imageUrl || null,
      isAvailable,
      placeId: placeId ? Number(placeId) : null,
    })
  })

  return (
    <form onSubmit={handleSubmit}>
      {form.submitError && <p className="notice notice-error">{form.submitError}</p>}
      {uploadError && <p className="notice notice-error">{uploadError}</p>}

      <Input
        id="title"
        label="Title"
        required
        value={form.values.title}
        onChange={(event) => form.setField('title', event.target.value)}
        onBlur={() => form.handleBlur('title')}
        error={form.errors.title}
      />
      <Input
        id="dest"
        label="Destination"
        required
        value={form.values.destination}
        onChange={(event) => form.setField('destination', event.target.value)}
        onBlur={() => form.handleBlur('destination')}
        error={form.errors.destination}
      />
      <Textarea
        id="desc"
        label="Description"
        rows={3}
        value={form.values.description}
        onChange={(event) => form.setField('description', event.target.value)}
        onBlur={() => form.handleBlur('description')}
        error={form.errors.description}
      />
      <div className="form-grid">
        <Input
          id="price"
          label="Price (USD)"
          type="number"
          min={0}
          step="0.01"
          required
          value={form.values.price}
          onChange={(event) => form.setField('price', Number(event.target.value))}
          onBlur={() => form.handleBlur('price')}
          error={form.errors.price}
        />
        <Input
          id="duration"
          label="Duration (days)"
          type="number"
          min={1}
          max={365}
          required
          value={form.values.durationDays}
          onChange={(event) => form.setField('durationDays', Number(event.target.value))}
          onBlur={() => form.handleBlur('durationDays')}
          error={form.errors.durationDays}
        />
      </div>
      <Select
        id="place"
        label="Place"
        value={placeId}
        onChange={(event) => setPlaceId(event.target.value)}
      >
        <option value="">None</option>
        {places.map((place) => (
          <option key={place.id} value={place.id}>{place.name}</option>
        ))}
      </Select>
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
          {uploading && <Spinner size={16} label="Uploading" />}
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
