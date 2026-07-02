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
  MdLightMode,
  MdDarkMode,
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
  const [isDark, setIsDark] = useState(true) // Default dark mode

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

  const toggleTheme = () => {
    setIsDark(!isDark)
    // Apply theme class to HTML element for global CSS variables
    if (!isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

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

      <div className={`flex min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Sidebar */}
        <aside
          className={`sticky top-0 flex h-screen flex-col border-r ${
            isDark 
              ? 'border-white/10 bg-slate-950/80 backdrop-blur-xl' 
              : 'border-gray-200 bg-white/80 backdrop-blur-xl'
          } px-4 py-6 transition-all duration-300 ${
            isExpanded ? 'w-[280px]' : 'w-[80px]'
          }`}
        >
          {/* Brand & Toggle */}
          <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} mb-8 shrink-0`}>
            {isExpanded && (
              <div>
                <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Lagronite
                </h1>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-500">
                  Student Space
                </p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                isDark 
                  ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white' 
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isExpanded ? <MdChevronLeft className="text-2xl" /> : <MdMenu className="text-2xl" />}
            </button>
          </div>

          {/* Navigation - LARGER icons and text */}
          <nav className="flex-1 space-y-2 overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]'
                        : isDark
                          ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    } ${!isExpanded && 'justify-center'}`
                  }
                >
                  <Icon className={`text-2xl flex-shrink-0 ${!isExpanded ? 'mr-0' : ''}`} />
                  {isExpanded && <span className="text-base">{item.label}</span>}
                </NavLink>
              )
            })}
          </nav>

          {/* Theme Toggle Button */}
          <div className={`shrink-0 ${isExpanded ? 'mb-4' : 'mb-4 flex justify-center'}`}>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                isExpanded ? 'w-full' : 'w-auto'
              } ${
                isDark 
                  ? 'text-slate-300 hover:bg-white/5 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${!isExpanded && 'justify-center'}`}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <MdLightMode className="text-2xl flex-shrink-0" />
              ) : (
                <MdDarkMode className="text-2xl flex-shrink-0" />
              )}
              {isExpanded && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
          </div>

          {/* User Profile & Logout - LARGER sizes */}
          {isExpanded ? (
            <div className={`shrink-0 space-y-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-6`}>
              {/* User Info */}
              <button
                type="button"
                onClick={() => navigate('/student/settings')}
                className={`flex items-center gap-4 rounded-xl ${
                  isDark ? 'bg-white/[0.04]' : 'bg-gray-50'
                } p-4 backdrop-blur-sm text-left transition hover:bg-emerald-500/10`}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={userName}
                    className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-lg font-bold text-slate-950">
                    {getInitial(userName)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {userName}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Student
                  </p>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`flex w-full items-center justify-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-3 text-base font-medium text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300`}
              >
                <MdLogout className="text-2xl flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Collapsed sidebar - Only icons */
            <div className={`shrink-0 flex flex-col items-center gap-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} pt-6`}>
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-lg font-bold text-slate-950">
                {getInitial(userName)}
              </div>
              <button
                onClick={handleLogout}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300`}
                aria-label="Logout"
              >
                <MdLogout className="text-2xl" />
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${isExpanded ? 'px-8 py-8' : 'px-6 py-6'}`}>
          {/* Pass theme to child components via Outlet context */}
          <Outlet context={{ theme: isDark ? 'dark' : 'light' }} />
        </main>
      </div>
    </>
  )
}