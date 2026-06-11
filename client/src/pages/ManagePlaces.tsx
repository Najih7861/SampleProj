import { useEffect, useState } from 'react'
import { Edit3, Image, Loader2, MapPinned, Plus, Trash2 } from 'lucide-react'
import { createPlace, deletePlace, getPlaces, updatePlace } from '../api/places'
import PlaceForm from '../components/PlaceForm'
import DataState from '../components/ui/DataState'
import Modal from '../components/ui/Modal'
import type { Place, PlaceInput } from '../types'

export default function ManagePlaces() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Place | undefined>(undefined)

  async function load(busy = true) {
    if (busy) setLoading(true)
    setError(null)
    try {
      setPlaces(await getPlaces())
    } catch {
      setError('Could not load places. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function loadPlaces() {
      try {
        const data = await getPlaces()
        if (!active) return
        setPlaces(data)
        setError(null)
      } catch {
        if (active) setError('Could not load places. Is the API running?')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPlaces()
    return () => { active = false }
  }, [])

  function openCreate() {
    setEditing(undefined)
    setShowForm(true)
  }

  function openEdit(place: Place) {
    setEditing(place)
    setShowForm(true)
  }

  async function handleSubmit(input: PlaceInput) {
    if (editing) {
      await updatePlace(editing.id, input)
    } else {
      await createPlace(input)
    }
    setShowForm(false)
    await load()
  }

  async function handleDelete(place: Place) {
    if (!window.confirm(`Delete "${place.name}"? Its packages will be unlinked (not deleted).`)) return
    await deletePlace(place.id)
    await load()
  }

  return (
    <div className="page">
      <div className="container">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Manage Places</h1>
          </div>
          <button className="btn-primary icon-text" onClick={openCreate}>
            <Plus size={17} aria-hidden />
            New Place
          </button>
        </div>

        {loading && (
          <DataState icon={<Loader2 className="spin" size={28} />} message="Loading places..." />
        )}
        {error && (
          <DataState tone="error" title="Places unavailable" message={error} />
        )}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Photos</th>
                  <th>Tours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr key={place.id}>
                    <td data-label="Place">
                      <div className="record-title"><MapPinned size={16} aria-hidden /> {place.name}</div>
                      <span className="record-note">
                        {place.description.length > 90 ? `${place.description.slice(0, 90)}...` : place.description}
                      </span>
                    </td>
                    <td data-label="Photos"><span className="icon-text"><Image size={16} aria-hidden /> {place.images.length}</span></td>
                    <td data-label="Tours">{place.packages.length}</td>
                    <td data-label="Actions" className="cell-actions">
                      <button className="btn-ghost btn-sm icon-text" onClick={() => openEdit(place)}>
                        <Edit3 size={15} aria-hidden />
                        Edit
                      </button>
                      <button className="btn-danger btn-sm icon-text" onClick={() => handleDelete(place)}>
                        <Trash2 size={15} aria-hidden />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {places.length === 0 && (
                  <tr><td colSpan={4}><span className="muted">No places yet.</span></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? 'Edit Place' : 'New Place'} onClose={() => setShowForm(false)}>
          <PlaceForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  )
}
