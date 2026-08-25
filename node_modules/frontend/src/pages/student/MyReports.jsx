import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { apiUrl, getAuthHeaders } from '../../services/api.js'
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

function getStatusClass(status, isDark) {
  switch (status) {
    case 'Lost': 
      return isDark 
        ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' 
        : 'border-rose-400/30 bg-rose-50 text-rose-700'
    case 'Found': 
      return isDark 
        ? 'border-sky-400/20 bg-sky-500/10 text-sky-200' 
        : 'border-sky-400/30 bg-sky-50 text-sky-700'
    case 'Claimed': 
      return isDark 
        ? 'border-amber-400/20 bg-amber-500/10 text-amber-200' 
        : 'border-amber-400/30 bg-amber-50 text-amber-700'
    case 'Returned': 
      return isDark 
        ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200' 
        : 'border-emerald-400/30 bg-emerald-50 text-emerald-700'
    default: 
      return isDark 
        ? 'border-white/10 bg-white/5 text-slate-200' 
        : 'border-gray-200 bg-gray-50 text-gray-700'
  }
}

function KpiCard({ label, value, icon: Icon, color, isDark }) {
  return (
    <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-6 backdrop-blur-xl shadow-lg`}>
      <div className="flex items-center gap-3">
        <Icon className={`text-2xl ${color}`} />
        <p className={`text-sm font-medium uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {label}
        </p>
      </div>
      <h3 className={`mt-2 text-3xl font-bold sm:text-4xl ${color}`}>
        {value}
      </h3>
    </div>
  )
}

function ReportCard({ report, onClick, isDark }) {
  return (
    <button
      onClick={() => onClick(report)}
      className={`group w-full rounded-xl border p-5 text-left backdrop-blur-xl transition-all duration-200 hover:shadow-lg ${
        isDark 
          ? 'border-white/10 bg-white/[0.04] hover:border-emerald-400/30 hover:bg-white/[0.08]' 
          : 'border-gray-200 bg-white hover:border-emerald-400/50 hover:bg-gray-50'
      }`}
    >
      <div className="flex gap-4">
        <img
          src={report.image}
          alt={report.itemName}
          className={`h-20 w-20 rounded-xl object-cover border ${isDark ? 'border-white/10' : 'border-gray-200'}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className={`font-semibold text-base sm:text-lg truncate ${
              isDark 
                ? 'text-white group-hover:text-emerald-300' 
                : 'text-gray-900 group-hover:text-emerald-600'
            } transition-colors`}>
              {report.itemName}
            </h3>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${getStatusClass(report.status, isDark)}`}>
              {report.status}
            </span>
          </div>
          <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {report.category} • {report.color}
          </p>
          <p className={`text-sm mt-1.5 flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
            <MdChat className="text-lg" />
            {report.location}
          </p>
          {/* Status progress bar */}
          <div className={`mt-3 h-2 w-full rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
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
  const { theme } = useOutletContext() // Get theme from layout

  const isDark = theme === 'dark'

  useEffect(() => {
    let cancelled = false

    const fetchReports = async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status !== 'All') params.set('status', status)

      try {
        const res = await fetch(apiUrl(`/api/reports?${params.toString()}`), {
          credentials: 'include',
          headers: getAuthHeaders(),
        })
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
      const res = await fetch(apiUrl(`/api/chats/${report.reportType}/${report.id}`), {
        credentials: 'include',
        headers: getAuthHeaders(),
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
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
      <div className={`glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.15]'} blur-[160px]`} />
      <div className={`glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.15]'} blur-[160px]`} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        {/* Header card - INCREASED padding and fonts */}
        <div className={`anim-rise overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg mb-8`}>
          <div className="p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Student Dashboard
            </p>
            <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Reports
            </h1>
            <p className={`mt-3 max-w-xl text-base leading-6 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Track your lost and found items in real‑time. Use filters to quickly find specific reports.
            </p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* KPI Cards - INCREASED sizes and spacing */}
        <div className="grid gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total Reports" value={total} icon={MdInsertChart} color={isDark ? 'text-white' : 'text-gray-900'} isDark={isDark} />
          <KpiCard label="Lost Items" value={lost} icon={MdReportProblem} color={isDark ? 'text-rose-300' : 'text-rose-600'} isDark={isDark} />
          <KpiCard label="Found Items" value={found} icon={MdCheckCircle} color={isDark ? 'text-sky-300' : 'text-sky-600'} isDark={isDark} />
          <KpiCard label="Returned" value={returned} icon={MdAssignmentReturn} color={isDark ? 'text-emerald-300' : 'text-emerald-600'} isDark={isDark} />
        </div>

        {/* Smart Insight Banner - INCREASED size */}
        <div className={`anim-rise mb-8 rounded-xl border ${isDark ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-emerald-400/30 bg-emerald-50'} p-5 backdrop-blur-sm flex items-center gap-3`}>
          <MdInsights className={`text-2xl shrink-0 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} />
          <p className={`text-base font-medium ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
            Smart Insight: You have {lost} active lost items. Check matching suggestions for possible recovery.
          </p>
        </div>

        {/* Filter Bar - INCREASED sizes */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MdSearch className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className={`w-full pl-12 pr-4 py-3.5 text-base rounded-xl border outline-none transition-all duration-200 placeholder:text-base ${
                isDark
                  ? 'bg-slate-900/60 border-white/10 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 placeholder:text-slate-500'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 placeholder:text-gray-400'
              }`}
            />
          </div>
          <div className="relative sm:w-52">
            <MdFilterList className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full pl-12 pr-10 py-3.5 text-base rounded-xl border outline-none transition-all duration-200 appearance-none cursor-pointer ${
                isDark
                  ? 'bg-slate-900/60 border-white/10 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                  : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s} className={isDark ? 'bg-slate-900' : 'bg-white'}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Cards */}
        {loading ? (
          <div className={`flex h-48 items-center justify-center rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-white/10 border-t-emerald-400" />
            <p className={`ml-4 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Loading reports...
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {reports.length === 0 ? (
              <div className={`col-span-full flex flex-col items-center justify-center py-16 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'}`}>
                <MdReportProblem className={`text-5xl mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  No reports found
                </p>
                <p className={`text-sm mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => handleOpenReport(report)}
                  isDark={isDark}
                />
              ))
            )}
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