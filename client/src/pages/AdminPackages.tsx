import { useMemo, useState } from 'react'
import { Compass, Edit3, Plus, Search, Trash2 } from 'lucide-react'
import {
  createPackage,
  deletePackage,
  getPackages,
  updatePackage,
} from '../api/client'
import { authErrorMessage } from '../api/auth'
import { useAsync } from '../hooks/useAsync'
import { useDebounce } from '../hooks/useDebounce'
import { formatCurrency } from '../lib/format'
import { useToast } from '../components/ui/toast/useToast'
import PackageForm from '../components/PackageForm'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import { SkeletonCard } from '../components/ui/Skeleton'
import type { Package, PackageInput } from '../types'

type Availability = 'all' | 'available' | 'unavailable'
type SortKey = 'newest' | 'priceAsc' | 'priceDesc' | 'titleAsc' | 'duration'

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Unavailable' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'priceAsc', label: 'Price ↑' },
  { value: 'priceDesc', label: 'Price ↓' },
  { value: 'titleAsc', label: 'Title A–Z' },
  { value: 'duration', label: 'Duration' },
]

export default function AdminPackages() {
  const { data, loading, error, reload } = useAsync(
    () => getPackages(),
    [],
    { errorMessage: 'Could not load packages. Is the API running?' },
  )
  const toast = useToast()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Package | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<Package | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState<Availability>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const debouncedSearch = useDebounce(search)

  const allPackages = useMemo(() => data ?? [], [data])

  const visible = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    let list = allPackages.filter((pkg) => {
      if (availability === 'available' && !pkg.isAvailable) return false
      if (availability === 'unavailable' && pkg.isAvailable) return false
      if (term) {
        const haystack = `${pkg.title} ${pkg.destination}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
    list = list.slice().sort((a, b) => {
      switch (sort) {
        case 'priceAsc':
          return a.price - b.price
        case 'priceDesc':
          return b.price - a.price
        case 'titleAsc':
          return a.title.localeCompare(b.title)
        case 'duration':
          return a.durationDays - b.durationDays
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    return list
  }, [allPackages, debouncedSearch, availability, sort])

  function openCreate() {
    setEditing(undefined)
    setShowForm(true)
  }

  function openEdit(pkg: Package) {
    setEditing(pkg)
    setShowForm(true)
  }

  async function handleSubmit(input: PackageInput) {
    try {
      if (editing) {
        await updatePackage(editing.id, input)
        toast.success('Package updated')
      } else {
        await createPackage(input)
        toast.success('Package created')
      }
      setShowForm(false)
      reload()
    } catch (err) {
      toast.error(authErrorMessage(err, 'Could not save package.'))
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deletePackage(pendingDelete.id)
      toast.success('Package deleted')
      setPendingDelete(null)
      reload()
    } catch (err) {
      toast.error(authErrorMessage(err, 'Could not delete package.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <PageHeader
          eyebrow="Admin"
          title="Manage Packages"
          actions={
            <Button icon={<Plus size={17} aria-hidden />} onClick={openCreate}>
              New Package
            </Button>
          }
        />

        {!loading && !error && (
          <>
            <div className="admin-controls">
              <div className="input-with-icon field field-search">
                <Search size={16} aria-hidden />
                <Input
                  layout="field"
                  type="search"
                  placeholder="Search by title or destination"
                  aria-label="Search packages"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <Select
                layout="field"
                label="Availability"
                value={availability}
                onChange={(event) => setAvailability(event.target.value as Availability)}
                options={AVAILABILITY_OPTIONS}
              />
              <Select
                layout="field"
                label="Sort by"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                options={SORT_OPTIONS}
              />
            </div>
            <p className="result-count">
              Showing {visible.length} of {allPackages.length} packages
            </p>
          </>
        )}

        {loading && (
          <div className="grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {error && (
          <ErrorMessage
            title="Packages unavailable"
            message={error}
            action={
              <Button variant="ghost" onClick={reload}>
                Retry
              </Button>
            }
          />
        )}

        {!loading && !error && allPackages.length === 0 && (
          <EmptyState
            title="No packages yet"
            message="Create your first tour package to get started."
            action={
              <Button icon={<Plus size={17} aria-hidden />} onClick={openCreate}>
                New Package
              </Button>
            }
          />
        )}

        {!loading && !error && allPackages.length > 0 && visible.length === 0 && (
          <EmptyState
            title="No matching packages"
            message="No packages match your search and filters. Try adjusting them."
          />
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="table-wrap">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Destination</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((pkg) => (
                  <tr key={pkg.id}>
                    <td data-label="Title">
                      <div className="record-title"><Compass size={16} aria-hidden /> {pkg.title}</div>
                    </td>
                    <td data-label="Destination">{pkg.destination}</td>
                    <td data-label="Price">{formatCurrency(pkg.price)}</td>
                    <td data-label="Duration">{pkg.durationDays} days</td>
                    <td data-label="Status">
                      <StatusBadge status={pkg.isAvailable ? 'Available' : 'Unavailable'} />
                    </td>
                    <td data-label="Actions" className="cell-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit3 size={15} aria-hidden />}
                        onClick={() => openEdit(pkg)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 size={15} aria-hidden />}
                        onClick={() => setPendingDelete(pkg)}
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
        <Modal title={editing ? 'Edit Package' : 'New Package'} onClose={() => setShowForm(false)}>
          <PackageForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete package"
        tone="danger"
        confirmLabel="Delete"
        loading={deleting}
        message={`Delete "${pendingDelete?.title}"? This also removes its bookings.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
