import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StudentReportDetailModal } from '../../components/student/ReportDetailModal.jsx'

const statusOptions = ['All', 'Lost', 'Found', 'Claimed', 'Returned']

function getStatusClass(status) {
  switch (status) {
    case 'Lost':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-200'
    case 'Found':
      return 'border-sky-400/20 bg-sky-500/10 text-sky-200'
    case 'Claimed':
      return 'border-amber-400/20 bg-amber-500/10 text-amber-200'
    case 'Returned':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
    default:
      return 'border-white/10 bg-white/5 text-slate-200'
  }
}

function StatusCard({ label, value, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <h3 className={`mt-2 text-2xl font-bold ${color}`}>{value}</h3>
    </div>
  )
}

function ReportCard({ report, onClick }) {
  return (
    <button
      onClick={() => onClick(report)}
      className="group w-full rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-emerald-400/30 hover:bg-white/[0.07]"
    >
      <div className="flex gap-4">
        <img
          src={report.image}
          className="h-16 w-16 rounded-2xl object-cover border border-white/10"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white group-hover:text-emerald-300">
              {report.itemName}
            </h3>

            <span
              className={`rounded-full border px-3 py-1 text-xs ${getStatusClass(
                report.status,
              )}`}
            >
              {report.status}
            </span>
          </div>

          <p className="text-sm text-slate-400 mt-1">
            {report.category} • {report.color}
          </p>

          <p className="text-xs text-slate-500 mt-2">
            📍 {report.location}
          </p>

          {/* Progress bar style status */}
          <div className="mt-3 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-emerald-400"
              style={{
                width:
                  report.status === 'Lost'
                    ? '25%'
                    : report.status === 'Found'
                    ? '50%'
                    : report.status === 'Claimed'
                    ? '75%'
                    : '100%',
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
    const fetchReports = async () => {
      setLoading(true)

      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status !== 'All') params.set('status', status)

      const res = await fetch(
        `http://localhost:5000/api/reports?${params.toString()}`,
        { credentials: 'include' },
      )

      const data = await res.json()
      setReports(data.reports || [])
      setLoading(false)
    }

    fetchReports()
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
    <div className="space-y-8 text-white">

      {/* HEADER */}
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
          Student Dashboard
        </p>
        <h1 className="text-3xl font-bold mt-2">My Reports</h1>
        <p className="text-slate-400 mt-1">
          Track your lost and found items in real-time
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatusCard label="Total Reports" value={total} color="text-white" />
        <StatusCard label="Lost Items" value={lost} color="text-rose-300" />
        <StatusCard label="Found Items" value={found} color="text-sky-300" />
        <StatusCard label="Returned" value={returned} color="text-emerald-300" />
      </div>

      {/* SMART INSIGHT BANNER */}
      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
        <p className="text-emerald-200 font-medium">
          🔍 Smart Insight
        </p>
        <p className="text-slate-300 text-sm mt-1">
          You have {lost} active lost items. Check matching suggestions for possible recovery.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
        >
          {statusOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-slate-400">Loading reports...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => handleOpenReport(report)}
            />
          ))}
        </div>
      )}

      {selectedReport && (
        <StudentReportDetailModal
          report={selectedReport}
          messageCount={messageCount}
          onClose={handleCloseReport}
          onOpenChat={handleOpenChat}
        />
      )}
    </div>
  )
}