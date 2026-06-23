import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { useAuth } from '../hooks/useAuth.js'
import { logoutUser } from '../services/authService.js'
import { useAccountWatcher } from '../hooks/useAccountWatcher'
import { AccountStatusModal } from '../components/AccountStatusModal'

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
    isActive
      ? 'bg-[#2a241f] text-white shadow-sm shadow-black/20'
      : 'text-slate-400 hover:bg-white/5 hover:text-white'
  }`

const navItems = [
  { to: '/student/dashboard', icon: '⌂', label: 'Dashboard' },
  { to: '/student/lost-items', icon: '⌕', label: 'Lost Items' },
  { to: '/student/reports', icon: '▤', label: 'My Reports' },
  { to: '/student/create-report', icon: '+', label: 'Create Post' },
]

function getInitial(name) {
  return (name || 'Student').trim().charAt(0).toUpperCase() || 'S'
}

export default function StudentLayout() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { blocked } = useAccountWatcher()
  const [show, setShow] = useState(true)

  const userName = user?.name || user?.fullName || 'Student'

  const handleLogout = async () => {
    try {
      await logoutUser()
    } finally {
      logout()
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      {/* 🔴 ACCOUNT STATUS MODAL (BAN / SUSPEND) */}
      {blocked && show && (
        <AccountStatusModal
          data={blocked}
          onClose={() => {
            setShow(false)
            window.location.href = '/login'
          }}
        />
      )}

      {/* LAYOUT WRAPPER */}
      <div className="flex min-h-screen bg-[#0f0d0b] text-white">

        {/* SIDEBAR */}
        <aside className="flex w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#11100e] px-4 py-6">

          <div className="mb-8 px-3">
            <h1 className="text-xl font-bold text-white">Lagronite</h1>
            <p className="text-xs text-slate-500">Student Space</p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-emerald-200">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#2a241f] text-emerald-200">
                {getInitial(userName)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userName}</p>
                <p className="text-xs text-slate-500">Student</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300 transition hover:bg-rose-500/20"
            >
              Logout
            </button>
          </div>

        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto w-full max-w-3xl">
            <Outlet />
          </div>
        </main>

      </div>
    </>
  )
}