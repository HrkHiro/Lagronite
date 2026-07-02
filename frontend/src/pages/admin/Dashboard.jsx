import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { fetchAdminDashboard } from '../../services/adminService.js'
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
} from 'react-icons/md'

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b']

export function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { theme } = useOutletContext() || {}
  
  const isDark = theme === undefined ? true : theme === 'dark'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const json = await fetchAdminDashboard()
        setData(json)
        setError(null)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError(err.message)
        setData(null)
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