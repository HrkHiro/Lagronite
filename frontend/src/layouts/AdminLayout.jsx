import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { logoutUser } from '../services/authService.js'

const linkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm transition',
    isActive ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white',
  ].join(' ')

export function AdminLayout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // Clear local session even if the server cookie is already gone.
    } finally {
      logout()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Admin Space</p>
            <h1 className="text-xl font-semibold text-white">Lagronite Control Center</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/admin/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/post-items" className={linkClass}>
              Post Items
            </NavLink>
            <NavLink to="/admin/reports" className={linkClass}>
              Reports
            </NavLink>
            <NavLink to="/admin/users" className={linkClass}>
              Users
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20 hover:text-white"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}