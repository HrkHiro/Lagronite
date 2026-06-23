import { useEffect, useState } from 'react'
import { fetchAdminUsers, updateUserStatus, deleteUser } from '../../services/adminService.js'

const statusStyles = {
  active: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-200',
  suspended: 'bg-amber-500/10 border-amber-400/20 text-amber-200',
  banned: 'bg-rose-500/10 border-rose-400/20 text-rose-200',
  pending: 'bg-sky-500/10 border-sky-400/20 text-sky-200',
}

const getStatusClass = (status) => {
  return statusStyles[status?.toLowerCase()] || 'bg-white/5 border-white/10 text-slate-200'
}

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await fetchAdminUsers()
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    const load = async () => {
      await fetchUsers()
      if (!active) return
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const updateStatus = async (id, action) => {
    let url = ''
    let body = null

    if (action === 'ban') url = `ban`
    if (action === 'activate') url = `activate`
    if (action === 'suspend') {
      const days = Number(prompt('Suspend for how many days?'))
      if (!days || days <= 0) {
        alert('Invalid number of days')
        return
      }

      const date = new Date()
      date.setDate(date.getDate() + days)
      url = `suspend`
      body = { until: date }
    }

    try {
      setLoading(true)
      setError('')

      await updateUserStatus(id, url)
      await fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return

    try {
      setLoading(true)
      setError('')

      await deleteUser(id)
      await fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-white">Loading users...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div className="space-y-8 text-slate-100">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.8)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Admin Panel</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Student account management</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Monitor student records, update account status, and manage access with crisp controls and elegant data cards.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 text-right shadow-sm shadow-black/10">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total users</p>
            <p className="mt-2 text-3xl font-semibold text-white">{users.length}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <article
            key={user._id}
            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.75)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{user.name || 'Unnamed student'}</p>
                <p className="mt-1 text-sm text-slate-400">{user.email}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${getStatusClass(
                  user.status,
                )}`}
              >
                {user.status || 'Unknown'}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Registered</p>
                <p className="mt-1 text-sm text-white">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</p>
                <p className="mt-1 text-sm text-white">{user.role || 'Student'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateStatus(user._id, 'activate')}
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/15"
              >
                Activate
              </button>
              <button
                type="button"
                onClick={() => updateStatus(user._id, 'suspend')}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/15"
              >
                Suspend
              </button>
              <button
                type="button"
                onClick={() => updateStatus(user._id, 'ban')}
                className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/15"
              >
                Ban
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(user._id)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}