import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MdLogin, MdPersonAdd, MdDashboard } from 'react-icons/md'

export function PublicLayout() {
  const location = useLocation()
  const [prevLocation, setPrevLocation] = useState(location)
  const [direction, setDirection] = useState('forward')

  // Update previous location and direction when route changes
  useEffect(() => {
    const prev = prevLocation.pathname
    const curr = location.pathname
    let newDirection = 'forward'

    if (prev === '/login' && curr === '/register') newDirection = 'forward'
    if (prev === '/register' && curr === '/login') newDirection = 'backward'

    // These setState calls are intentional and safe – they update the UI
    // based on route changes, which is exactly what we need.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDirection(newDirection)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrevLocation(location)
  }, [location, prevLocation])

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .slide-forward {
          animation: slideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .slide-backward {
          animation: slideInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl shadow-[0_4px_30px_-10px_rgba(0,0,0,0.5)]">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:py-4">
            <Link
              to="/"
              className="group flex items-center gap-2 text-lg font-bold tracking-tight text-white transition hover:text-emerald-300"
            >
              <MdDashboard className="text-2xl text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
              <span>Lagronite</span>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-medium sm:gap-3">
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white sm:px-4"
              >
                <MdLogin className="text-base" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] sm:px-4"
              >
                <MdPersonAdd className="text-base" />
                <span>Get Started</span>
              </Link>
            </nav>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400/50 via-cyan-400/30 to-transparent" />
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
          <div className="relative overflow-hidden">
            <div
              key={location.pathname}
              className={direction === 'forward' ? 'slide-forward' : 'slide-backward'}
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}