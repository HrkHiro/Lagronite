import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportDetailModal } from '../../components/admin/ReportDetailModal.jsx'
import { fetchAdminReports, deleteReport, updateReportStatus } from '../../services/reportsService.js'
import {
  MdVisibility,
  MdChat,
  MdCheckCircle,
  MdDelete,
  MdPerson,
  MdCalendarToday,
  MdCategory,
  MdColorLens,
  MdDescription,
} from 'react-icons/md'

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
    if (!claimerName || !claimerName.trim()) return

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

  const handleViewReport = (report) => {
    setSelectedReport(report)
  }

  const handleMessage = (report) => {
    navigate(`/admin/chat/${report.reportType}/${report.id}`)
  }

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .anim-rise { animation: riseIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="glow-a absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
      <div className="glow-b absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header - smaller, emerald accent */}
        <div className="anim-rise mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="p-5 lg:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Admin Reports
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Incoming lost & found reports
            </h2>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-400">
              Browse submitted reports and open details or chat with the student reporter.
            </p>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Content states */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
            <p className="ml-3 text-sm text-slate-400">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-100 backdrop-blur-xl">
            <h3 className="text-base font-semibold">Error</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {reports.map((item) => (
              <div
                key={item.id}
                className="anim-rise rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_20px_50px_-25px_rgba(0,0,0,0.75)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{item.itemName}</h3>
                    <p className="mt-0.5 text-xs text-slate-400 flex items-center gap-2">
                      <MdCategory className="text-slate-500" />
                      {item.category}
                      <span className="text-slate-600">•</span>
                      <MdColorLens className="text-slate-500" />
                      {item.color}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                      statusStyles[item.status] || 'border-white/10 bg-white/5 text-slate-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-xs text-slate-300 flex items-start gap-1.5">
                  <MdDescription className="text-slate-500 mt-0.5 shrink-0" />
                  {item.description}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1">
                      <MdPerson className="text-slate-500" />
                      Reporter
                    </p>
                    <p className="mt-1 text-sm text-white">{item.reporter?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{item.reporter?.email || ''}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1">
                      <MdCalendarToday className="text-slate-500" />
                      Posted
                    </p>
                    <p className="mt-1 text-sm text-white">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewReport(item)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                  >
                    <MdVisibility className="text-base" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMessage(item)}
                    className="flex items-center gap-1.5 rounded-xl border border-sky-400/20 bg-sky-500/10 px-3.5 py-1.5 text-xs font-medium text-sky-200 transition hover:bg-sky-500/20"
                  >
                    <MdChat className="text-base" />
                    Message
                  </button>
                  <button
                    type="button"
                    onClick={() => markAsClaimed(item)}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20"
                  >
                    <MdCheckCircle className="text-base" />
                    Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <MdDelete className="text-base" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onMessage={() => handleMessage(selectedReport)}
          onClaimed={() => markAsClaimed(selectedReport)}
        />
      )}
    </section>
  )
}