import { useEffect, useState } from 'react'
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
} from 'react-icons/md'

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b']

export function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  if (loading) return <Loading />
  if (error) return <ErrorDisplay message={error} />
  if (!data) return <Empty />

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
        <div className="anim-rise overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Admin Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
                System Overview
              </h1>
              <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-400">
                Monitor all activity, recent reports, and key metrics at a glance.
              </p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <MdAssessment className="text-2xl" />
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* KPI Cards - with icons, smaller */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            title="Total Reports"
            value={data.totalReports}
            icon={MdDashboard}
            color="text-emerald-400"
            delay="0.1s"
          />
          <KpiCard
            title="Lost Items"
            value={data.lostCount}
            icon={MdReportProblem}
            color="text-rose-300"
            delay="0.2s"
          />
          <KpiCard
            title="Found Items"
            value={data.foundCount}
            icon={MdCheckCircle}
            color="text-sky-300"
            delay="0.3s"
          />
        </div>

        {/* Monthly Activity - compact */}
        <div className="anim-rise mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2 mb-3">
            <MdTimeline className="text-emerald-400 text-xl" />
            <h2 className="text-base font-semibold text-white">Monthly Activity</h2>
          </div>

          {data.monthlyStats && data.monthlyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.monthlyStats}>
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#f59e0b' }}
                />
                <Line
                  type="monotone"
                  dataKey="lost"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#f43f5e' }}
                />
                <Line
                  type="monotone"
                  dataKey="found"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[240px] items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-400">
              No monthly data available yet.
            </div>
          )}
        </div>

        {/* Pie + Bar - compact */}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <GlassCard title="Status Breakdown" icon={MdPieChart} delay="0.4s">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(data.statusCounts).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={4}
                >
                  {Object.keys(data.statusCounts).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard title="Categories" icon={MdCategory} delay="0.5s">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.categories}>
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Recent Reports - compact */}
        <div className="anim-rise mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2 mb-3">
            <MdAnalytics className="text-emerald-400 text-xl" />
            <h2 className="text-base font-semibold text-white">Recent Reports</h2>
          </div>
          <ul className="space-y-1.5 text-sm text-slate-300">
            {data.recentReports.map((item) => (
              <li key={item.id} className="flex justify-between items-center border-b border-white/5 py-2 last:border-b-0">
                <span className="text-sm">{item.itemName}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusColor(item.status)}`}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// ───── Helper Components ─────

function Loading() {
  return (
    <div className="flex h-48 items-center justify-center text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
      <p className="ml-3 text-sm">Loading dashboard…</p>
    </div>
  )
}

function ErrorDisplay({ message }) {
  return (
    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-100">
      <h2 className="text-base font-semibold">Error Loading Dashboard</h2>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  )
}

function Empty() {
  return <div className="p-8 text-sm text-slate-400">No data available.</div>
}

function KpiCard({ title, value, icon: Icon, color, delay }) {
  return (
    <div
      className="anim-rise rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)]"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-2">
        <Icon className={`text-lg ${color}`} />
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">{title}</p>
      </div>
      <h3 className={`mt-1 text-2xl font-bold text-white`}>{value}</h3>
    </div>
  )
}

function GlassCard({ title, icon: Icon, children, delay }) {
  return (
    <div
      className="anim-rise rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)]"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="text-emerald-400 text-lg" />}
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function statusColor(status) {
  switch (status) {
    case 'Lost': return 'bg-rose-500/10 text-rose-300 border border-rose-400/20'
    case 'Found': return 'bg-sky-500/10 text-sky-300 border border-sky-400/20'
    case 'Claimed': return 'bg-amber-500/10 text-amber-300 border border-amber-400/20'
    case 'Returned': return 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20'
    default: return 'bg-white/5 text-slate-300'
  }
}