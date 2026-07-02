import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  MdDashboard,
  MdReportProblem,
  MdAssignment,
  MdAddCircleOutline,
  MdMenu,
  MdChevronLeft,
  MdLogout,
} from 'react-icons/md'

import { useAuth } from '../hooks/useAuth.js'
import { logoutUser } from '../services/authService.js'
import { useAccountWatcher } from '../hooks/useAccountWatcher'
import { AccountStatusModal } from '../components/AccountStatusModal'

const navItems = [
  { to: '/student/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/student/lost-items', icon: MdReportProblem, label: 'Lost Items' },
  { to: '/student/reports', icon: MdAssignment, label: 'My Reports' },
  { to: '/student/create-report', icon: MdAddCircleOutline, label: 'Create Post' },
]

function getInitial(name) {
  return (name || 'Student').trim().charAt(0).toUpperCase() || 'S'
}

export default function StudentLayout() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { blocked } = useAccountWatcher()
  const [showBlockedModal, setShowBlockedModal] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  const userName = user?.name || user?.fullName || 'Student'

  const handleLogout = async () => {
    try {
      await logoutUser()
    } finally {
      logout()
      navigate('/login', { replace: true })
    }
  }

  const toggleSidebar = () => setIsExpanded(!isExpanded)

  return (
    <>
      {blocked && showBlockedModal && (
        <AccountStatusModal
          data={blocked}
          onClose={() => {
            setShowBlockedModal(false)
            window.location.href = '/login'
          }}
        />
      )}

      <div className="flex min-h-screen bg-slate-950 text-white">
        {/* Sidebar */}
        <aside
          className={`sticky top-0 flex h-screen flex-col border-r border-white/10 bg-slate-950/80 backdrop-blur-xl px-3 py-4 transition-all duration-300 ${
            isExpanded ? 'w-[240px]' : 'w-[72px]'
          }`}
        >
          {/* Brand & Toggle */}
          <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} mb-6 shrink-0`}>
            {isExpanded && (
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">Lagronite</h1>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400/80">
                  Student Space
                </p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isExpanded ? <MdChevronLeft className="text-lg" /> : <MdMenu className="text-lg" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    } ${!isExpanded && 'justify-center'}`
                  }
                >
                  <Icon className={`text-xl ${!isExpanded ? 'mr-0' : ''}`} />
                  {isExpanded && <span>{item.label}</span>}
                </NavLink>
              )
            })}
          </nav>

          {/* User & Logout – visible only when expanded */}
          {isExpanded ? (
            <div className="shrink-0 space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 backdrop-blur-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-bold text-slate-950">
                  {getInitial(userName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-slate-400">Student</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
              >
                <MdLogout className="text-lg" />
                Logout
              </button>
            </div>
          ) : (
            // Collapsed version: only avatar and logout icon
            <div className="shrink-0 flex flex-col items-center gap-3 border-t border-white/10 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-bold text-slate-950">
                {getInitial(userName)}
              </div>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                aria-label="Logout"
              >
                <MdLogout className="text-lg" />
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${isExpanded ? 'px-6 py-6' : 'px-4 py-4'}`}>
          <Outlet />
        </main>
      </div>
    </>
  )
}