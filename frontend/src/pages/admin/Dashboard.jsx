import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { fetchAdminDashboard, fetchAdminExportData } from '../../services/adminService.js'
import {
  MdDashboard,
  MdReportProblem,
  MdCheckCircle,
  MdAnalytics,
  MdPieChart,
  MdTimeline,
  MdCategory,
  MdAssessment,
  MdError,
  MdSearchOff,
  MdDownload,
  MdFileDownload,
} from 'react-icons/md'

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b']

export function AdminDashboard() {
  const [data, setData] = useState(null)
  const [exportData, setExportData] = useState(null)
  const [selectedSourceGroups, setSelectedSourceGroups] = useState([
    'Users',
    'Lost Items',
    'Found Items',
    'Comments',
    'Reactions',
    'Chats',
    'Messages',
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { theme } = useOutletContext() || {}

  const isDark = theme === undefined ? true : theme === 'dark'

  const exportGroups = useMemo(() => [
    'Users',
    'Lost Items',
    'Found Items',
    'Comments',
    'Reactions',
    'Chats',
    'Messages',
  ], [])

  const categories = useMemo(() => {
    return [...new Set((exportData?.lostItems || []).concat(exportData?.foundItems || []).map((item) => item.category).filter(Boolean))]
  }, [exportData])

  const toggleGroup = (group) => {
    setSelectedSourceGroups((prev) => {
      if (prev.includes(group)) {
        return prev.filter((item) => item !== group)
      }
      return [...prev, group]
    })
  }

  const normalizeUserRow = (item) => ({
    Id: item.id,
    Name: item.name,
    Email: item.email,
    Role: item.role,
    Status: item.status,
    CreatedAt: new Date(item.createdAt).toLocaleString(),
  })

  const normalizeLostRow = (item) => ({
    ReportType: 'lost',
    Id: item.id,
    ItemName: item.itemName,
    Category: item.category,
    Color: item.color,
    Description: item.description,
    Location: item.locationLost,
    Date: new Date(item.dateLost).toLocaleDateString(),
    Status: item.status,
    OwnerName: item.owner?.name || 'Unknown',
    OwnerEmail: item.owner?.email || 'N/A',
    ClaimedBy: item.claimerName || 'Unknown',
    CreatedAt: new Date(item.createdAt).toLocaleString(),
  })

  const normalizeFoundRow = (item) => ({
    ReportType: 'found',
    Id: item.id,
    ItemName: item.itemName,
    Category: item.category,
    Color: item.color,
    Description: item.description,
    Location: item.locationFound,
    Date: new Date(item.dateFound).toLocaleDateString(),
    Status: item.status,
    FinderName: item.finder?.name || 'Unknown',
    FinderEmail: item.finder?.email || 'N/A',
    ClaimedBy: item.claimerName || 'Unknown',
    CreatedAt: new Date(item.createdAt).toLocaleString(),
  })

  const normalizeCommentRow = (item) => ({
    Id: item.id,
    ReportType: item.itemType,
    ReportId: item.itemId,
    CommentAuthor: item.user?.name || 'Unknown',
    CommentAuthorEmail: item.user?.email || 'N/A',
    Content: item.content,
    CreatedAt: new Date(item.createdAt).toLocaleString(),
  })

  const normalizeReactionRow = (item) => ({
    Id: item.id,
    ReportType: item.itemType,
    ReportId: item.itemId,
    ReactionType: item.reactionType,
    UserName: item.user?.name || 'Unknown',
    UserEmail: item.user?.email || 'N/A',
    CreatedAt: new Date(item.createdAt).toLocaleString(),
  })

  const normalizeChatRow = (item) => ({
    ChatId: item.id,
    ReportType: item.reportType,
    ReportId: item.reportId,
    IsClosed: item.isClosed ? 'Yes' : 'No',
    CreatedAt: new Date(item.createdAt).toLocaleString(),
    ParticipantCount: item.participants?.length || 0,
    MessageCount: item.messages?.length || 0,
  })

  const normalizeMessageRow = (item) => ({
    MessageId: item.id,
    ChatId: item.chatId,
    SenderName: item.sender?.name || 'Unknown',
    SenderEmail: item.sender?.email || 'N/A',
    Text: item.text,
    CreatedAt: new Date(item.createdAt).toLocaleString(),
  })

  const exportExcel = () => {
    if (!exportData) return

    const workbook = XLSX.utils.book_new()

    const exportMap = {
      Users: exportData.users?.map(normalizeUserRow) || [],
      'Lost Items': exportData.lostItems?.map(normalizeLostRow) || [],
      'Found Items': exportData.foundItems?.map(normalizeFoundRow) || [],
      Comments: exportData.comments?.map(normalizeCommentRow) || [],
      Reactions: exportData.reactions?.map(normalizeReactionRow) || [],
      Chats: exportData.chats?.map(normalizeChatRow) || [],
      Messages: exportData.messages?.map(normalizeMessageRow) || [],
    }

    const selectedSheets = selectedSourceGroups.map((group) => ({ group, rows: exportMap[group] || [] }))

    selectedSheets.forEach(({ group, rows }) => {
      const sheet = XLSX.utils.json_to_sheet(rows)
      XLSX.utils.book_append_sheet(workbook, sheet, group)
    })

    if (selectedSheets.length === 0) {
      const emptySheet = XLSX.utils.json_to_sheet([])
      XLSX.utils.book_append_sheet(workbook, emptySheet, 'No Data')
    }

    const allCategorySheet = XLSX.utils.json_to_sheet((exportData.lostItems || []).concat(exportData.foundItems || []).map((item) => ({
      ReportType: item.reportType || (item.locationLost ? 'lost' : 'found'),
      ItemName: item.itemName,
      Category: item.category,
      Color: item.color,
      Status: item.status,
      Location: item.locationLost || item.locationFound || 'N/A',
      Date: new Date(item.dateLost || item.dateFound).toLocaleDateString(),
      ClaimedBy: item.claimerName || 'Unknown',
      OwnerName: item.owner?.name || item.finder?.name || 'Unknown',
      OwnerEmail: item.owner?.email || item.finder?.email || 'N/A',
    })))
    XLSX.utils.book_append_sheet(workbook, allCategorySheet, 'All Reports')

    categories.forEach((category) => {
      const categoryRows = (exportData.lostItems || []).concat(exportData.foundItems || [])
        .filter((item) => item.category === category)
        .map((item) => ({
          ReportType: item.reportType || (item.locationLost ? 'lost' : 'found'),
          ItemName: item.itemName,
          Category: item.category,
          Color: item.color,
          Status: item.status,
          Location: item.locationLost || item.locationFound || 'N/A',
          Date: new Date(item.dateLost || item.dateFound).toLocaleDateString(),
          ClaimedBy: item.claimerName || 'Unknown',
          OwnerName: item.owner?.name || item.finder?.name || 'Unknown',
          OwnerEmail: item.owner?.email || item.finder?.email || 'N/A',
        }))

      const categorySheet = XLSX.utils.json_to_sheet(categoryRows)
      XLSX.utils.book_append_sheet(workbook, categorySheet, category || 'Uncategorized')
    })

    XLSX.writeFile(workbook, 'admin-full-report-export.xlsx')
  }

  const exportPdf = () => {
    if (!exportData) return

    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(17)
    doc.text('Lagronite Admin Full Export', 14, 16)

    const reportRows = (exportData.lostItems || []).concat(exportData.foundItems || []).map((item) => [
      item.reportType || (item.locationLost ? 'lost' : 'found'),
      item.itemName,
      item.category,
      item.color,
      item.status,
      item.claimerName || 'Unknown',
      item.owner?.name || item.finder?.name || 'Unknown',
      new Date(item.dateLost || item.dateFound).toLocaleDateString(),
      item.locationLost || item.locationFound || 'N/A',
    ])

    doc.autoTable({
      head: [['Type', 'Item Name', 'Category', 'Color', 'Status', 'Claimed By', 'Reporter', 'Date', 'Location']],
      body: reportRows,
      startY: 24,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] },
      alternateRowStyles: { fillColor: [243, 244, 246] },
    })

    doc.save('admin-full-report-export.pdf')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardJson, exportJson] = await Promise.all([
          fetchAdminDashboard(),
          fetchAdminExportData(),
        ])
        setData(dashboardJson)
        setExportData(exportJson)
        setError(null)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError(err.message)
        setData(null)
        setExportData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Loading isDark={isDark} />
  if (error) return <ErrorDisplay message={error} isDark={isDark} />
  if (!data) return <Empty isDark={isDark} />

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
        <div className={`anim-rise overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg mb-8`}>
          <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Admin Dashboard
              </p>
              <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                System Overview
              </h1>
              <p className={`mt-3 max-w-xl text-base leading-6 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                Monitor all activity, recent reports, and key metrics at a glance.
              </p>
            </div>
            <div className={`flex items-center gap-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <MdAssessment className="text-3xl" />
              <span className="text-base font-semibold">Admin</span>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        <div className={`mb-8 rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-5 shadow-lg`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                Full report export
              </p>
              <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Excel workbook includes <span className="font-semibold">All Reports</span> plus one sheet per category, and you can select which source tables to include.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportExcel}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                  isDark
                    ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
                    : 'border-emerald-400/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <MdFileDownload className="text-lg" />
                Export Excel
              </button>
              <button
                type="button"
                onClick={exportPdf}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                  isDark
                    ? 'border-cyan-400/20 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
                    : 'border-cyan-400/30 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                <MdDownload className="text-lg" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {exportGroups.map((group) => {
              const active = selectedSourceGroups.includes(group)
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? isDark
                        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                        : 'border-emerald-400/30 bg-emerald-50 text-emerald-700'
                      : isDark
                        ? 'border-white/10 bg-white/[0.02] text-slate-300'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                  }`}
                >
                  {group}
                </button>
              )
            })}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <KpiCard
            title="Total Reports"
            value={data.totalReports}
            icon={MdDashboard}
            color={isDark ? 'text-emerald-400' : 'text-emerald-600'}
            delay="0.1s"
            isDark={isDark}
          />
          <KpiCard
            title="Lost Items"
            value={data.lostCount}
            icon={MdReportProblem}
            color={isDark ? 'text-rose-300' : 'text-rose-600'}
            delay="0.2s"
            isDark={isDark}
          />
          <KpiCard
            title="Found Items"
            value={data.foundCount}
            icon={MdCheckCircle}
            color={isDark ? 'text-sky-300' : 'text-sky-600'}
            delay="0.3s"
            isDark={isDark}
          />
        </div>

        {/* Monthly Activity */}
        <div className={`anim-rise rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-8 backdrop-blur-xl shadow-xl mb-8`}>
          <div className="flex items-center gap-3 mb-6">
            <MdTimeline className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Monthly Activity</h2>
          </div>

          {data.monthlyStats && data.monthlyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data.monthlyStats}>
                <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fontSize: 13 }} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fontSize: 13 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '0.75rem',
                    fontSize: '14px',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                  }}
                  labelStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="lost"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#f43f5e', strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: '#f43f5e' }}
                />
                <Line
                  type="monotone"
                  dataKey="found"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex h-[320px] items-center justify-center rounded-xl border border-dashed ${isDark ? 'border-white/10 text-slate-400' : 'border-gray-300 text-gray-400'}`}>
              <div className="text-center">
                <MdSearchOff className="text-5xl mx-auto mb-3" />
                <p className="text-base">No monthly data available yet.</p>
              </div>
            </div>
          )}
        </div>

        {/* Pie + Bar Charts */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <GlassCard title="Status Breakdown" icon={MdPieChart} delay="0.4s" isDark={isDark}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={Object.entries(data.statusCounts).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {Object.keys(data.statusCounts).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '0.75rem',
                    fontSize: '14px',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard title="Categories" icon={MdCategory} delay="0.5s" isDark={isDark}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.categories}>
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fontSize: 13 }} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} tick={{ fontSize: 13 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '0.75rem',
                    fontSize: '14px',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Recent Reports */}
        <div className={`anim-rise rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-8 backdrop-blur-xl shadow-xl`}>
          <div className="flex items-center gap-3 mb-6">
            <MdAnalytics className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Reports</h2>
          </div>
          <div className="space-y-2">
            {data.recentReports.length === 0 ? (
              <p className={`text-base text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                No recent reports found.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.recentReports.map((item) => (
                  <li key={item.id} className={`flex justify-between items-center border-b py-3 last:border-b-0 ${
                    isDark ? 'border-white/5' : 'border-gray-100'
                  }`}>
                    <span className={`text-base font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {item.itemName}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusColor(item.status, isDark)}`}>
                      {item.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ───── Helper Components ─────

function Loading({ isDark }) {
  return (
    <div className={`flex h-48 items-center justify-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
      <div className={`h-10 w-10 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-emerald-400' : 'border-gray-200 border-t-emerald-500'}`} />
      <p className="ml-4 text-base">Loading dashboard…</p>
    </div>
  )
}

function ErrorDisplay({ message, isDark }) {
  return (
    <div className={`rounded-xl border ${isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-100' : 'border-rose-400/30 bg-rose-50 text-rose-800'} p-8`}>
      <div className="flex items-center gap-3 mb-3">
        <MdError className="text-3xl" />
        <h2 className="text-xl font-bold">Error Loading Dashboard</h2>
      </div>
      <p className="text-base">{message}</p>
    </div>
  )
}

function Empty({ isDark }) {
  return (
    <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
      <MdSearchOff className="text-6xl mx-auto mb-4" />
      <p className="text-lg">No data available.</p>
    </div>
  )
}

function KpiCard({ title, value, icon: Icon, color, delay, isDark }) {
  return (
    <div
      className={`anim-rise rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-6 backdrop-blur-xl shadow-lg`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`text-2xl ${color}`} />
        <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {title}
        </p>
      </div>
      <h3 className={`text-3xl font-bold sm:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </h3>
    </div>
  )
}

function GlassCard({ title, icon: Icon, children, delay, isDark }) {
  return (
    <div
      className={`anim-rise rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-6 backdrop-blur-xl shadow-xl`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-3 mb-6">
        {Icon && <Icon className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />}
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function statusColor(status, isDark) {
  switch (status) {
    case 'Lost': return isDark ? 'bg-rose-500/10 text-rose-300 border border-rose-400/20' : 'bg-rose-50 text-rose-700 border border-rose-400/30'
    case 'Found': return isDark ? 'bg-sky-500/10 text-sky-300 border border-sky-400/20' : 'bg-sky-50 text-sky-700 border border-sky-400/30'
    case 'Claimed': return isDark ? 'bg-amber-500/10 text-amber-300 border border-amber-400/20' : 'bg-amber-50 text-amber-700 border border-amber-400/30'
    case 'Returned': return isDark ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-400/30'
    default: return isDark ? 'bg-white/5 text-slate-300' : 'bg-gray-50 text-gray-600'
  }
}