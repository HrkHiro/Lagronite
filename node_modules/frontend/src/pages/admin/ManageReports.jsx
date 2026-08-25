import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
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
  MdError,
  MdSearchOff,
  MdAssignment,
} from 'react-icons/md'

const statusStyles = {
  Lost: {
    dark: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
    light: 'border-rose-400/30 bg-rose-50 text-rose-700',
  },
  Found: {
    dark: 'border-sky-400/20 bg-sky-500/10 text-sky-200',
    light: 'border-sky-400/30 bg-sky-50 text-sky-700',
  },
  Claimed: {
    dark: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
    light: 'border-amber-400/30 bg-amber-50 text-amber-700',
  },
  Returned: {
    dark: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
    light: 'border-emerald-400/30 bg-emerald-50 text-emerald-700',
  },
}

export function AdminReports() {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { theme } = useOutletContext() || {}
  
  const isDark = theme === undefined ? true : theme === 'dark'

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

  const getStatusClass = (status) => {
    const style = statusStyles[status] || { dark: 'border-white/10 bg-white/5 text-slate-200', light: 'border-gray-200 bg-gray-50 text-gray-600' }
    return isDark ? style.dark : style.light
  }

  return (
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
        .dot-grid-dark {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
        .dot-grid-light {
          background-image: radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      {/* Background decorations */}
      <div className={`pointer-events-none absolute inset-0 ${isDark ? 'dot-grid-dark' : 'dot-grid-light'}`} />
      <div className={`glow-a absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.12]'} blur-[140px]`} />
      <div className={`glow-b absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.12]'} blur-[140px]`} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        {/* Header */}
        <div className={`anim-rise mb-8 overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg`}>
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-2">
              <MdAssignment className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Admin Reports
              </p>
            </div>
            <h2 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Incoming lost & found reports
            </h2>
            <p className={`mt-3 max-w-xl text-base leading-6 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Browse submitted reports and open details or chat with the student reporter.
            </p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Content states */}
        {loading ? (
          <div className={`flex h-48 items-center justify-center rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
            <div className={`h-10 w-10 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-emerald-400' : 'border-gray-200 border-t-emerald-500'}`} />
            <p className={`ml-4 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Loading reports...
            </p>
          </div>
        ) : error ? (
          <div className={`rounded-xl border ${isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-100' : 'border-rose-400/30 bg-rose-50 text-rose-800'} p-8 backdrop-blur-xl`}>
            <div className="flex items-center gap-3 mb-3">
              <MdError className="text-3xl" />
              <h3 className="text-xl font-bold">Error</h3>
            </div>
            <p className="text-base">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-12 text-center backdrop-blur-xl`}>
            <MdSearchOff className={`text-6xl mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              No reports found
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {reports.map((item) => (
              <div
                key={item.id}
                className={`anim-rise rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-6 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}
              >
                {/* Item Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.itemName}
                    </h3>
                    <p className={`mt-1.5 text-sm flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1.5">
                        <MdCategory className="text-lg" />
                        {item.category}
                      </span>
                      <span className={isDark ? 'text-slate-600' : 'text-gray-300'}>•</span>
                      <span className="flex items-center gap-1.5">
                        <MdColorLens className="text-lg" />
                        {item.color}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold uppercase ${getStatusClass(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Description */}
                <p className={`mt-3 line-clamp-2 text-sm flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  <MdDescription className="text-lg mt-0.5 shrink-0" />
                  {item.description}
                </p>

                {/* Reporter & Date */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-gray-50'} px-4 py-3`}>
                    <p className={`text-sm font-medium uppercase tracking-[0.2em] flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      <MdPerson className="text-lg" />
                      Reporter
                    </p>
                    <p className={`mt-1.5 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.reporter?.name || 'Unknown'}
                    </p>
                    <p className={`text-sm truncate ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      {item.reporter?.email || ''}
                    </p>
                  </div>
                  <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-gray-50'} px-4 py-3`}>
                    <p className={`text-sm font-medium uppercase tracking-[0.2em] flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      <MdCalendarToday className="text-lg" />
                      Posted
                    </p>
                    <p className={`mt-1.5 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleViewReport(item)}
                    className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-base font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      isDark
                        ? 'border-white/10 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
                        : 'border-emerald-400/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <MdVisibility className="text-xl" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMessage(item)}
                    className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-base font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      isDark
                        ? 'border-sky-400/20 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20'
                        : 'border-sky-400/30 bg-sky-50 text-sky-700 hover:bg-sky-100'
                    }`}
                  >
                    <MdChat className="text-xl" />
                    Message
                  </button>
                  <button
                    type="button"
                    onClick={() => markAsClaimed(item)}
                    className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-base font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      isDark
                        ? 'border-amber-400/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                        : 'border-amber-400/30 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    <MdCheckCircle className="text-xl" />
                    Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-base font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      isDark
                        ? 'border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
                        : 'border-rose-400/30 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <MdDelete className="text-xl" />
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
          isDark={isDark}
        />
      )}
    </section>
  )
}