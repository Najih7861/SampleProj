import { useEffect, useState } from 'react'
import { Compass, Edit3, Loader2, Plus, Trash2 } from 'lucide-react'
import {
  createPackage,
  deletePackage,
  getPackages,
  updatePackage,
} from '../api/client'
import PackageForm from '../components/PackageForm'
import DataState from '../components/ui/DataState'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import type { Package, PackageInput } from '../types'

export default function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Package | undefined>(undefined)

  async function load(busy = true) {
    if (busy) setLoading(true)
    setError(null)
    try {
      setPackages(await getPackages())
    } catch {
      setError('Could not load packages. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function loadPackages() {
      try {
        const data = await getPackages()
        if (!active) return
        setPackages(data)
        setError(null)
      } catch {
        if (active) setError('Could not load packages. Is the API running?')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPackages()
    return () => { active = false }
  }, [])

  function openCreate() {
    setEditing(undefined)
    setShowForm(true)
  }

  function openEdit(pkg: Package) {
    setEditing(pkg)
    setShowForm(true)
  }

  async function handleSubmit(input: PackageInput) {
    if (editing) {
      await updatePackage(editing.id, input)
    } else {
      await createPackage(input)
    }
    setShowForm(false)
    await load()
  }

  async function handleDelete(pkg: Package) {
    if (!window.confirm(`Delete "${pkg.title}"? This also removes its bookings.`)) return
    await deletePackage(pkg.id)
    await load()
  }

  return (
    <div className="page">
      <div className="container">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Manage Packages</h1>
          </div>
          <button className="btn-primary icon-text" onClick={openCreate}>
            <Plus size={17} aria-hidden />
            New Package
          </button>
        </div>

        {loading && (
          <DataState icon={<Loader2 className="spin" size={28} />} message="Loading packages..." />
        )}
        {error && (
          <DataState tone="error" title="Packages unavailable" message={error} />
        )}

        {!loading && !error && (
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
                {packages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td data-label="Title">
                      <div className="record-title"><Compass size={16} aria-hidden /> {pkg.title}</div>
                    </td>
                    <td data-label="Destination">{pkg.destination}</td>
                    <td data-label="Price">${pkg.price.toLocaleString()}</td>
                    <td data-label="Duration">{pkg.durationDays} days</td>
                    <td data-label="Status">
                      <StatusBadge status={pkg.isAvailable ? 'Available' : 'Unavailable'} />
                    </td>
                    <td data-label="Actions" className="cell-actions">
                      <button className="btn-ghost btn-sm icon-text" onClick={() => openEdit(pkg)}>
                        <Edit3 size={15} aria-hidden />
                        Edit
                      </button>
                      <button className="btn-danger btn-sm icon-text" onClick={() => handleDelete(pkg)}>
                        <Trash2 size={15} aria-hidden />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {packages.length === 0 && (
                  <tr><td colSpan={6}><span className="muted">No packages yet.</span></td></tr>
                )}
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
    </div>
  )
}
