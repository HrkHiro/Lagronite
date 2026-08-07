import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { MdArchive, MdSearchOff, MdError, MdRestoreFromTrash, MdDeleteForever } from 'react-icons/md'
import { fetchArchiveRecords, restoreArchiveRecord, deleteArchiveRecord, deleteArchiveRecords } from '../../services/adminService.js'

export function AdminArchive() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [restoringId, setRestoringId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const { theme } = useOutletContext() || {}

  const isDark = theme === undefined ? true : theme === 'dark'

  const loadArchive = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchArchiveRecords()
      setRecords(data.records || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArchive()
  }, [loadArchive])

  const selectedCount = selectedIds.length

  const allSelected = useMemo(() => {
    return records.length > 0 && selectedIds.length === records.length
  }, [records.length, selectedIds.length])

  const toggleRecordSelection = (recordId) => {
    setSelectedIds((current) => {
      if (current.includes(recordId)) {
        return current.filter((id) => id !== recordId)
      }

      return [...current, recordId]
    })
  }

  const toggleAllRecords = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(records.map((record) => record.id))
    }
  }

  const handleRestore = async (record) => {
    if (!window.confirm(`Restore "${record.itemName}" back to live reports?`)) return

    try {
      setRestoringId(record.id)
      await restoreArchiveRecord(record.id)
      await loadArchive()
    } catch (err) {
      alert(err.message)
    } finally {
      setRestoringId(null)
    }
  }

  const handleDelete = async (record) => {
    if (!window.confirm(`Permanently delete "${record.itemName}" from the archive? This cannot be undone.`)) return

    try {
      setDeletingId(record.id)
      await deleteArchiveRecord(record.id)
      setSelectedIds((current) => current.filter((recordId) => recordId !== record.id))
      await loadArchive()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return

    if (!window.confirm(`Permanently delete ${selectedIds.length} selected archive record(s)? This cannot be undone.`)) return

    try {
      setBulkDeleting(true)
      await deleteArchiveRecords(selectedIds)
      setSelectedIds([])
      await loadArchive()
    } catch (err) {
      alert(err.message)
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <div className={`mb-8 overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg`}>
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-2">
              <MdArchive className={`text-2xl ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
                Archive
              </p>
            </div>
            <h2 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Deleted report snapshots
            </h2>
            <p className={`mt-3 max-w-xl text-base leading-6 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Deleted reports and claimed records are kept here first. You can restore them back to live reports when needed.
            </p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 opacity-80" />
        </div>

        {!loading && !error && records.length > 0 && (
          <div className={`mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} px-5 py-4 backdrop-blur-xl`}>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-amber-500"
                  checked={allSelected}
                  onChange={toggleAllRecords}
                />
                <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>Select all</span>
              </label>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${isDark ? 'bg-white/8 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>{selectedCount} selected</span>
            </div>
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={selectedCount === 0 || bulkDeleting}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/80 px-4 py-2 text-sm font-bold text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdDeleteForever className="text-lg" />
              {bulkDeleting ? 'Deleting...' : 'Delete selected'}
            </button>
          </div>
        )}

        {loading ? (
          <div className={`flex h-48 items-center justify-center rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
            <div className={`h-10 w-10 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-amber-400' : 'border-gray-200 border-t-amber-500'}`} />
            <p className={`ml-4 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading archive...</p>
          </div>
        ) : error ? (
          <div className={`rounded-xl border ${isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-100' : 'border-rose-400/30 bg-rose-50 text-rose-800'} p-8 backdrop-blur-xl`}>
            <div className="flex items-center gap-3 mb-3">
              <MdError className="text-3xl" />
              <h3 className="text-xl font-bold">Error</h3>
            </div>
            <p className="text-base">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-12 text-center backdrop-blur-xl`}>
            <MdSearchOff className={`text-6xl mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No archived records found.</p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {records.map((record) => (
              <article key={record.id} className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-6 shadow-lg`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-amber-500"
                      checked={selectedIds.includes(record.id)}
                      onChange={() => toggleRecordSelection(record.id)}
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">{record.entityType}</p>
                      <h3 className={`mt-2 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.itemName}</h3>
                    </div>
                  </div>
                  <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                    {record.status || 'Archived'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-gray-50'} p-4`}>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Category</p>
                    <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.category || 'N/A'}</p>
                  </div>
                  <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-gray-50'} p-4`}>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Deleted At</p>
                    <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(record.deletedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className={`mt-4 rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-gray-50'} p-4`}>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Reporter</p>
                  <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.reporterName || 'Unknown'} ({record.reporterEmail || 'N/A'})</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    <MdRestoreFromTrash className="text-xl" />
                    <span className="text-sm font-medium">Ready for restore or audit review.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(record)}
                      disabled={deletingId === record.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-500/70 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MdDeleteForever className="text-lg" />
                      {deletingId === record.id ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRestore(record)}
                      disabled={restoringId === record.id}
                      className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {restoringId === record.id ? 'Restoring...' : 'Restore'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
