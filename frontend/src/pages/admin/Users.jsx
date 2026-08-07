import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AdminSuspendModal } from '../../components/admin/AdminSuspendModal.jsx'
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
  MdError,
  MdSearchOff,
  MdAdminPanelSettings,
} from 'react-icons/md'

const statusStyles = {
  active: {
    dark: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-200',
    light: 'bg-emerald-50 border-emerald-400/30 text-emerald-700',
  },
  suspended: {
    dark: 'bg-amber-500/10 border-amber-400/20 text-amber-200',
    light: 'bg-amber-50 border-amber-400/30 text-amber-700',
  },
  banned: {
    dark: 'bg-rose-500/10 border-rose-400/20 text-rose-200',
    light: 'bg-rose-50 border-rose-400/30 text-rose-700',
  },
  deleted: {
    dark: 'bg-slate-500/10 border-slate-400/20 text-slate-200',
    light: 'bg-slate-50 border-slate-400/30 text-slate-700',
  },
  pending: {
    dark: 'bg-sky-500/10 border-sky-400/20 text-sky-200',
    light: 'bg-sky-50 border-sky-400/30 text-sky-700',
  },
}

const getStatusClass = (status, isDark) => {
  const style = statusStyles[status?.toLowerCase()] || {
    dark: 'bg-white/5 border-white/10 text-slate-200',
    light: 'bg-gray-50 border-gray-200 text-gray-600',
  }
  return isDark ? style.dark : style.light
}

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [suspendModalUser, setSuspendModalUser] = useState(null)
  const { theme } = useOutletContext() || {}
  
  const isDark = theme === undefined ? true : theme === 'dark'

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

  const openSuspendModal = (user) => {
    setSuspendModalUser(user)
  }

  const submitSuspend = async (selectedUntil) => {
    if (!suspendModalUser || !selectedUntil) return

    try {
      setLoading(true)
      setError('')
      await updateUserStatus(suspendModalUser._id, 'suspend', { until: selectedUntil })
      await fetchUsers()
      setSuspendModalUser(null)
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
        {/* Header card */}
        <div className={`anim-rise mb-8 overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg`}>
          <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between lg:p-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MdPeople className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                  Admin Panel
                </p>
              </div>
              <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Student Account Management
              </h1>
              <p className={`mt-3 max-w-2xl text-base leading-7 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                Monitor student records, update account status, and manage access.
              </p>
            </div>
            <div className={`shrink-0 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} px-6 py-5 backdrop-blur-sm shadow-lg flex items-center gap-4`}>
              <MdPeople className={`text-3xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <div>
                <p className={`text-sm font-medium uppercase tracking-[0.3em] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Total Users
                </p>
                <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {users.length}
                </p>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Content */}
        {loading ? (
          <div className={`flex h-48 items-center justify-center rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
            <div className={`h-10 w-10 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-emerald-400' : 'border-gray-200 border-t-emerald-500'}`} />
            <p className={`ml-4 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Loading users...
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
        ) : users.length === 0 ? (
          <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-12 text-center backdrop-blur-xl`}>
            <MdSearchOff className={`text-6xl mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              No users found
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <article
                key={user._id}
                className={`anim-rise rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-6 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {/* User Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <MdPerson className={`text-xl flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <span className="truncate">{user.name || 'Unnamed Student'}</span>
                    </p>
                    <p className={`mt-1.5 text-sm flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <MdEmail className="text-lg flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.2em] ${getStatusClass(user.status, isDark)}`}>
                    {user.status || 'Unknown'}
                  </span>
                </div>

                {/* User Details */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'} px-4 py-3`}>
                    <p className={`text-sm font-medium uppercase tracking-[0.2em] flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      <MdCalendarToday className="text-lg" />
                      Registered
                    </p>
                    <p className={`mt-1 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'} px-4 py-3`}>
                    <p className={`text-sm font-medium uppercase tracking-[0.2em] flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      <MdBadge className="text-lg" />
                      Role
                    </p>
                    <p className={`mt-1 text-base font-medium flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.role === 'admin' && <MdAdminPanelSettings className={`text-lg ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />}
                      {user.role || 'Student'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => updateStatus(user._id, 'activate')}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      isDark
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
                        : 'border-emerald-400/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <MdCheckCircle className="text-lg" />
                    Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => openSuspendModal(user)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      isDark
                        ? 'border-amber-500/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                        : 'border-amber-400/30 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    <MdPersonOff className="text-lg" />
                    Suspend
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(user._id, 'ban')}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      isDark
                        ? 'border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
                        : 'border-rose-400/30 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <MdBlock className="text-lg" />
                    Ban
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user._id)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      isDark
                        ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <MdDelete className="text-lg" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {suspendModalUser && (
        <AdminSuspendModal
          user={suspendModalUser}
          isDark={isDark}
          onClose={() => setSuspendModalUser(null)}
          onConfirm={submitSuspend}
        />
      )}
    </section>
  )
}