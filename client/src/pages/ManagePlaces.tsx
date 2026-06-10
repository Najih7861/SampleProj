import { useEffect, useState } from 'react'
import { createPlace, deletePlace, getPlaces, updatePlace } from '../api/places'
import PlaceForm from '../components/PlaceForm'
import type { Place, PlaceInput } from '../types'

export default function ManagePlaces() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Place | undefined>(undefined)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setPlaces(await getPlaces())
    } catch {
      setError('Could not load places. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

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
          <h1>Manage Places</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Place</button>
        </div>

        {loading && <p className="center-msg">Loading…</p>}
        {error && <div className="notice notice-error">{error}</div>}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Place</th><th>Photos</th><th>Tours</th><th></th>
                </tr>
              </thead>
              <tbody>
                {places.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.name}<br />
                      <span className="muted" style={{ fontSize: '0.8rem' }}>
                        {p.description.length > 80 ? `${p.description.slice(0, 80)}…` : p.description}
                      </span>
                    </td>
                    <td>{p.images.length}</td>
                    <td>{p.packages.length}</td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <button className="btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>{' '}
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {places.length === 0 && (
                  <tr><td colSpan={4} className="muted" style={{ textAlign: 'center' }}>No places yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <PlaceForm
              initial={editing}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
