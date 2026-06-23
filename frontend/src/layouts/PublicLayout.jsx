import { Link, Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-wide text-white">
            Lagronite
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link to="/login" className="hover:text-white">
              Login
            </Link>
            <Link to="/register" className="rounded-full bg-emerald-500 px-4 py-2 font-medium text-slate-950 hover:bg-emerald-400">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}