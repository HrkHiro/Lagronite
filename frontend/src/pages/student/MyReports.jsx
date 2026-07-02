import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentReportDetailModal } from '../../components/student/ReportDetailModal.jsx'
import {
  MdSearch,
  MdFilterList,
  MdInsertChart,
  MdReportProblem,
  MdCheckCircle,
  MdAssignmentReturn,
  MdInsights,
  MdChat,
} from 'react-icons/md'

const statusOptions = ['All', 'Lost', 'Found', 'Claimed', 'Returned']

function getStatusClass(status) {
  switch (status) {
    case 'Lost': return 'border-rose-400/20 bg-rose-500/10 text-rose-200'
    case 'Found': return 'border-sky-400/20 bg-sky-500/10 text-sky-200'
    case 'Claimed': return 'border-amber-400/20 bg-amber-500/10 text-amber-200'
    case 'Returned': return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
    default: return 'border-white/10 bg-white/5 text-slate-200'
  }
}

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-2">
        <Icon className={`text-lg ${color}`} />
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">{label}</p>
      </div>
      <h3 className={`mt-1 text-2xl font-bold ${color}`}>{value}</h3>
    </div>
  )
}

function ReportCard({ report, onClick }) {
  return (
    <button
      onClick={() => onClick(report)}
      className="group w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur-xl transition hover:border-emerald-400/30 hover:bg-white/[0.08]"
    >
      <div className="flex gap-3">
        <img
          src={report.image}
          alt={report.itemName}
          className="h-14 w-14 rounded-xl object-cover border border-white/10"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors truncate">
              {report.itemName}
            </h3>
            <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${getStatusClass(report.status)}`}>
              {report.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {report.category} • {report.color}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <MdChat className="text-slate-500" />
            {report.location}
          </p>
          {/* Status progress bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{
                width:
                  report.status === 'Lost' ? '25%' :
                  report.status === 'Found' ? '50%' :
                  report.status === 'Claimed' ? '75%' : '100%',
              }}
            />
          </div>
        </div>
      </div>
    </button>
  )
}

export function StudentMyReports() {
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [messageCount, setMessageCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    const fetchReports = async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status !== 'All') params.set('status', status)

      try {
        const res = await fetch(
          `http://localhost:5000/api/reports?${params.toString()}`,
          { credentials: 'include' }
        )
        const data = await res.json()
        if (!cancelled) {
          setReports(data.reports || [])
        }
      } catch (err) {
        console.error('Fetch failed:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchReports()

    return () => {
      cancelled = true
    }
  }, [search, status])

  // KPI calculations
  const total = reports.length
  const lost = reports.filter((r) => r.status === 'Lost').length
  const found = reports.filter((r) => r.status === 'Found').length
  const returned = reports.filter((r) => r.status === 'Returned').length

  const fetchChatCount = async (report) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chats/${report.reportType}/${report.id}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Unable to load chat')
      setMessageCount(data.chat.messages?.length || 0)
    } catch {
      setMessageCount(0)
    }
  }

  const handleOpenReport = async (report) => {
    setSelectedReport(report)
    await fetchChatCount(report)
  }

  const handleCloseReport = () => {
    setSelectedReport(null)
    setMessageCount(0)
  }

  const handleOpenChat = () => {
    if (!selectedReport) return
    navigate(`/student/chat/${selectedReport.reportType}/${selectedReport.id}`)
  }

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
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
      <div className="glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[160px]" />
      <div className="glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header card - smaller */}
        <div className="anim-rise overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-5">
          <div className="p-5 lg:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Student Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
              My Reports
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-400">
              Track your lost and found items in real‑time. Use filters to quickly find specific reports.
            </p>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* KPI Cards - compact with icons */}
        <div className="grid gap-3 mb-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total Reports" value={total} icon={MdInsertChart} color="text-white" />
          <KpiCard label="Lost Items" value={lost} icon={MdReportProblem} color="text-rose-300" />
          <KpiCard label="Found Items" value={found} icon={MdCheckCircle} color="text-sky-300" />
          <KpiCard label="Returned" value={returned} icon={MdAssignmentReturn} color="text-emerald-300" />
        </div>

        {/* Smart Insight Banner - smaller with icon */}
        <div className="anim-rise mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3.5 backdrop-blur-sm flex items-center gap-2">
          <MdInsights className="text-emerald-300 text-lg shrink-0" />
          <p className="text-emerald-200 text-xs font-medium">Smart Insight: You have {lost} active lost items. Check matching suggestions for possible recovery.</p>
        </div>

        {/* Filter Bar - compact with icons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 placeholder:text-slate-500"
            />
          </div>
          <div className="relative sm:w-44">
            <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 appearance-none text-white"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Cards */}
        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
            <p className="ml-3 text-sm text-slate-400">Loading reports...</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => handleOpenReport(report)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedReport && (
        <StudentReportDetailModal
          report={selectedReport}
          messageCount={messageCount}
          onClose={handleCloseReport}
          onOpenChat={handleOpenChat}
        />
      )}
    </section>
  )
}