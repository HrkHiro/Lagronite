import { useEffect, useState } from 'react'
import { fetchAdminUsers, updateUserStatus, deleteUser } from '../../services/adminService.js'
import {
  MdPeople,
  MdPerson,
  MdEmail,
  MdCalendarToday,
  MdBadge,
  MdCheckCircle,
  MdBlock,
  MdDelete,
  MdPersonOff,
} from 'react-icons/md'

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
    return () => { active = false }
  }, [])

  const updateStatus = async (id, action) => {
    let url = ''
    let body = undefined

    if (action === 'ban') url = 'ban'
    if (action === 'activate') url = 'activate'
    if (action === 'suspend') {
      const days = Number(prompt('Suspend for how many days?'))
      if (!days || days <= 0) {
        alert('Invalid number of days')
        return
      }
      const date = new Date()
      date.setDate(date.getDate() + days)
      url = 'suspend'
      body = { until: date.toISOString() }
    }

    try {
      setLoading(true)
      setError('')
      await updateUserStatus(id, url, body)
      await fetchUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
    } finally {
      setLoading(false)
    }
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
        {/* Header card - compact, emerald accent */}
        <div className="anim-rise mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between lg:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Admin Panel
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Student account management
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-400">
                Monitor student records, update account status, and manage access.
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm flex items-center gap-3">
              <MdPeople className="text-emerald-400 text-2xl" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Total users</p>
                <p className="text-2xl font-semibold text-white">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
            <p className="ml-3 text-sm text-slate-400">Loading users...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-100 backdrop-blur-xl">
            <h3 className="text-base font-semibold">Error</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <article
                key={user._id}
                className="anim-rise rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_20px_50px_-25px_rgba(0,0,0,0.75)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-white flex items-center gap-1.5">
                      <MdPerson className="text-emerald-400 shrink-0" />
                      <span className="truncate">{user.name || 'Unnamed student'}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400 flex items-center gap-1">
                      <MdEmail className="text-slate-500" />
                      {user.email}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${getStatusClass(user.status)}`}>
                    {user.status || 'Unknown'}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1">
                      <MdCalendarToday className="text-slate-500" />
                      Registered
                    </p>
                    <p className="mt-0.5 text-sm text-white">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1">
                      <MdBadge className="text-slate-500" />
                      Role
                    </p>
                    <p className="mt-0.5 text-sm text-white">{user.role || 'Student'}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateStatus(user._id, 'activate')}
                    className="flex items-center gap-1 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                  >
                    <MdCheckCircle className="text-sm" />
                    Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(user._id, 'suspend')}
                    className="flex items-center gap-1 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20"
                  >
                    <MdPersonOff className="text-sm" />
                    Suspend
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(user._id, 'ban')}
                    className="flex items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <MdBlock className="text-sm" />
                    Ban
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user._id)}
                    className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                  >
                    <MdDelete className="text-sm" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}