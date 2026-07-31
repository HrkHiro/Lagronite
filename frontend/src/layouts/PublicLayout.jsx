import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { 
  MdLogin, 
  MdPersonAdd, 
  MdDashboard,
  MdLightMode,
  MdDarkMode,
  MdMenu,
  MdClose,
} from 'react-icons/md'

export function PublicLayout() {
  const location = useLocation()
  const [prevLocation, setPrevLocation] = useState(location)
  const [direction, setDirection] = useState('forward')
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or default to dark
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Update previous location and direction when route changes
  useEffect(() => {
    const prev = prevLocation.pathname
    const curr = location.pathname
    let newDirection = 'forward'

    if (prev === '/login' && curr === '/register') newDirection = 'forward'
    else if (prev === '/register' && curr === '/login') newDirection = 'backward'
    else if (prev === '/' && (curr === '/login' || curr === '/register')) newDirection = 'forward'
    else if ((curr === '/login' || curr === '/register') && prev === '/') newDirection = 'backward'

    setDirection(newDirection)
    setPrevLocation(location)
  }, [location, prevLocation])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .slide-forward {
          animation: slideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .slide-backward {
          animation: slideInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mobile-menu-enter {
          animation: slideInUp 0.3s ease-out both;
        }
        .overlay-enter {
          animation: fadeIn 0.3s ease-out both;
        }
      `}</style>

      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl shadow-lg transition-colors duration-300 ${
        isDark 
          ? 'border-white/5 bg-slate-950/80' 
          : 'border-gray-200 bg-white/80'
      }`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-8 md:py-5">
          {/* Logo */}
          <Link
            to="/"
            className={`group flex items-center gap-3 text-xl font-bold tracking-tight transition-colors ${
              isDark ? 'text-white hover:text-emerald-300' : 'text-gray-900 hover:text-emerald-600'
            }`}
          >
            <MdDashboard className={`text-3xl transition-transform duration-300 group-hover:scale-110 ${
              isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`} />
            <span className="hidden sm:inline">Lagronite</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                isDark
                  ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <MdLightMode className="text-2xl" />
              ) : (
                <MdDarkMode className="text-2xl" />
              )}
              <span className="hidden lg:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Login Link */}
            <Link
              to="/login"
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-base font-medium transition-all duration-200 ${
                isDark
                  ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <MdLogin className="text-2xl" />
              Login
            </Link>

            {/* Register Link */}
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              <MdPersonAdd className="text-2xl" />
              Get Started
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200 ${
                isDark
                  ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <MdLightMode className="text-2xl" /> : <MdDarkMode className="text-2xl" />}
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200 ${
                isDark
                  ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Gradient Line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400/50 via-cyan-400/30 to-transparent" />

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t mobile-menu-enter ${
            isDark ? 'border-white/5 bg-slate-950/95' : 'border-gray-200 bg-white/95'
          } backdrop-blur-xl`}>
            <div className="px-6 py-4 space-y-2">
              <Link
                to="/login"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                  isDark
                    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <MdLogin className="text-2xl" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-3 rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-emerald-400"
              >
                <MdPersonAdd className="text-2xl" />
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8 sm:py-12 lg:py-16">
        <div className="relative overflow-hidden">
          <div
            key={location.pathname}
            className={direction === 'forward' ? 'slide-forward' : 'slide-backward'}
          >
            <Outlet context={{ isDark, toggleTheme }} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 transition-colors duration-300 ${
        isDark ? 'border-white/5 bg-slate-950/50' : 'border-gray-200 bg-white/50'
      }`}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MdDashboard className={`text-xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                Lagronite
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              © {new Date().getFullYear()} Lagronite. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}