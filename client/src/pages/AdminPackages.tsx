import { useEffect, useState } from 'react'
import {
  createPackage,
  deletePackage,
  getPackages,
  updatePackage,
} from '../api/client'
import PackageForm from '../components/PackageForm'
import type { Package, PackageInput } from '../types'

export default function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Package | undefined>(undefined)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setPackages(await getPackages())
    } catch {
      setError('Could not load packages. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

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
          <h1>Manage Packages</h1>
          <button className="btn-primary" onClick={openCreate}>+ New Package</button>
        </div>

        {loading && <p className="center-msg">Loading…</p>}
        {error && <div className="notice notice-error">{error}</div>}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th><th>Destination</th><th>Price</th>
                  <th>Duration</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.destination}</td>
                    <td>${p.price.toLocaleString()}</td>
                    <td>{p.durationDays} days</td>
                    <td>
                      {p.isAvailable
                        ? <span className="badge badge-confirmed">Available</span>
                        : <span className="badge badge-cancelled">Unavailable</span>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <button className="btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>{' '}
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {packages.length === 0 && (
                  <tr><td colSpan={6} className="muted" style={{ textAlign: 'center' }}>No packages yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <PackageForm
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
