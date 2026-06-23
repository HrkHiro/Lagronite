import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { fetchAdminDashboard } from '../../services/adminService.js'

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

  if (loading) {
    return (
      <div className="text-white p-10">Loading dashboard...</div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 text-white">
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100">
          <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
          <p className="mt-2 text-sm">{error}</p>
          <p className="mt-2 text-xs text-rose-200">Please make sure you are logged in and the backend server is running.</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-white p-10">No data available</div>
    )
  }

  return (
    <div className="space-y-6 text-white">

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Reports" value={data.totalReports} />
        <Card title="Lost Items" value={data.lostCount} />
        <Card title="Found Items" value={data.foundCount} />
      </div>

      {/* MONTHLY GRAPH */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Activity</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.monthlyStats}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="lost" stroke="#f43f5e" />
            <Line type="monotone" dataKey="found" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PIE + BAR */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4">Status Breakdown</h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={Object.entries(data.statusCounts).map(([name, value]) => ({
                  name,
                  value,
                }))}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
              >
                {Object.keys(data.statusCounts).map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.categories}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>

        <ul className="space-y-2 text-sm text-slate-300">
          {data.recentReports.map((item) => (
            <li key={item.id} className="flex justify-between border-b border-white/10 py-2">
              <span>{item.itemName}</span>
              <span className="text-slate-400">{item.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-slate-400 text-sm">{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  )
}