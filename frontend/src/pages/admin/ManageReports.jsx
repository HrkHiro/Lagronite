import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportDetailModal } from '../../components/admin/ReportDetailModal.jsx'
import { fetchAdminReports, deleteReport, updateReportStatus } from '../../services/reportsService.js'

const statusStyles = {
  Lost: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
  Found: 'border-sky-400/20 bg-sky-500/10 text-sky-200',
  Claimed: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
  Returned: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
}

export function AdminReports() {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const data = await fetchAdminReports()
      setReports(data.reports || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!active) return
      await fetchReports()
    })()

    return () => {
      active = false
    }
  }, [fetchReports])

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this report permanently?')) return

    try {
      await deleteReport(item.reportType, item.id)
      await fetchReports()
    } catch (err) {
      alert(err.message)
    }
  }

  const markAsClaimed = async (item) => {
    const claimerName = window.prompt('Enter the student name who claimed the item:')
    if (!claimerName || !claimerName.trim()) {
      return
    }

    try {
      const payload = {
        status: 'Claimed',
        claimerName: claimerName.trim(),
        itemName: item.itemName,
        category: item.category,
        color: item.color,
        description: item.description,
        image: item.image,
        date: item.date,
        location: item.location,
      }
      
      await updateReportStatus(item.reportType, item.id, payload)
      await fetchReports()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleViewReport = async (report) => {
    setSelectedReport(report)
  }

  const handleMessage = (report) => {
    navigate(`/admin/chat/${report.reportType}/${report.id}`)
  }

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.8)] backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Admin Reports</p>
        <h2 className="mt-3 text-3xl font-semibold">Incoming lost & found reports</h2>
        <p className="mt-2 text-slate-400">Browse submitted reports and open details or chat with the student reporter.</p>
      </div>

      {loading ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center text-slate-400">Loading reports...</div>
      ) : error ? (
        <div className="rounded-[1.75rem] border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100">{error}</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {reports.map((item) => (
            <div key={item.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.75)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{item.itemName}</h3>
                  <p className="mt-2 text-sm text-slate-400">{item.category} • {item.color}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusStyles[item.status] || 'border-white/10 bg-white/5 text-slate-200'}`}>
                  {item.status}
                </span>
              </div>

              <p className="mt-4 text-slate-300 line-clamp-3">{item.description}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Reporter</p>
                  <p className="mt-2 text-sm text-white">{item.reporter?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{item.reporter?.email || ''}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Posted</p>
                  <p className="mt-2 text-sm text-white">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleViewReport(item)}
                  className="rounded-2xl border border-white/10 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
                >
                  View details
                </button>
                <button
                  type="button"
                  onClick={() => handleMessage(item)}
                  className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/15"
                >
                  Message
                </button>
                <button
                  type="button"
                  onClick={() => markAsClaimed(item)}
                  className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/15"
                >
                  Mark as claimed
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onMessage={() => handleMessage(selectedReport)}
          onClaimed={() => markAsClaimed(selectedReport)}
        />
      )}
    </div>
  )
}
