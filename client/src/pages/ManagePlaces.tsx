import { useMemo, useState } from 'react'
import { Edit3, Image, MapPinned, Plus, Search, Trash2 } from 'lucide-react'
import { createPlace, deletePlace, getPlaces, updatePlace } from '../api/places'
import { authErrorMessage } from '../api/auth'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import { useToast } from '../components/ui/toast/useToast'
import PlaceForm from '../components/PlaceForm'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import type { Place, PlaceInput } from '../types'

export default function ManagePlaces() {
  const { data, loading, error, reload } = useAsync(
    () => getPlaces(),
    [],
    { errorMessage: 'Could not load places. Is the API running?' },
  )
  const toast = useToast()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Place | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<Place | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const allPlaces = useMemo(() => data ?? [], [data])

  const visible = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    if (!term) return allPlaces
    return allPlaces.filter((place) => place.name.toLowerCase().includes(term))
  }, [allPlaces, debouncedSearch])

  function openCreate() {
    setEditing(undefined)
    setShowForm(true)
  }

  function openEdit(place: Place) {
    setEditing(place)
    setShowForm(true)
  }

  async function handleSubmit(input: PlaceInput) {
    try {
      if (editing) {
        await updatePlace(editing.id, input)
        toast.success('Place updated')
      } else {
        await createPlace(input)
        toast.success('Place created')
      }
      setShowForm(false)
      reload()
    } catch (err) {
      toast.error(authErrorMessage(err, 'Could not save place.'))
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deletePlace(pendingDelete.id)
      toast.success('Place deleted')
      setPendingDelete(null)
      reload()
    } catch (err) {
      toast.error(authErrorMessage(err, 'Could not delete place.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          eyebrow="Admin"
          title="Manage Places"
          actions={
            <Button icon={<Plus size={17} aria-hidden />} onClick={openCreate}>
              New Place
            </Button>
          }
        />

        {!loading && !error && allPlaces.length > 0 && (
          <>
            <div className="admin-controls">
              <div className="input-with-icon field field-search">
                <Search size={16} aria-hidden />
                <Input
                  layout="field"
                  type="search"
                  placeholder="Search by name"
                  aria-label="Search places"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <p className="result-count">
              Showing {visible.length} of {allPlaces.length} places
            </p>
          </>
        )}

        {loading && <Spinner label="Loading places..." />}

        {error && (
          <ErrorMessage
            title="Places unavailable"
            message={error}
            action={
              <Button variant="ghost" onClick={reload}>
                Retry
              </Button>
            }
          />
        )}

        {!loading && !error && allPlaces.length === 0 && (
          <EmptyState
            title="No places yet"
            message="Add your first destination to start grouping tour packages."
            action={
              <Button icon={<Plus size={17} aria-hidden />} onClick={openCreate}>
                New Place
              </Button>
            }
          />
        )}

        {!loading && !error && allPlaces.length > 0 && visible.length === 0 && (
          <EmptyState
            title="No matching places"
            message="No places match your search. Try a different name."
          />
        )}

        {!loading && !error && visible.length > 0 && (
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
                {visible.map((place) => (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit3 size={15} aria-hidden />}
                        onClick={() => openEdit(place)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 size={15} aria-hidden />}
                        onClick={() => setPendingDelete(place)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
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

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete place"
        tone="danger"
        confirmLabel="Delete"
        loading={deleting}
        message={`Delete "${pendingDelete?.name}"? Its packages will be unlinked (not deleted).`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
