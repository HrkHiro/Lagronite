import { Link } from 'react-router-dom'
import { MdHome, MdSearchOff, MdErrorOutline } from 'react-icons/md'

export function NotFound({ isDark: propIsDark }) {
  // Check if dark mode class exists on HTML element
  const isDark = propIsDark !== undefined ? propIsDark : document.documentElement.classList.contains('dark')

  return (
    <section className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .anim-rise { animation: riseIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .float-icon { animation: floatY 3s ease-in-out infinite; }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .pulse-text { animation: pulse 2s ease-in-out infinite; }
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
      <div className={`glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.15]'} blur-[160px]`} />
      <div className={`glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.15]'} blur-[160px]`} />

      <div className="relative z-10 flex min-h-[calc(100vh-200px)] items-center justify-center px-6 py-12">
        <div className={`anim-rise w-full max-w-lg rounded-2xl border p-10 text-center backdrop-blur-xl shadow-2xl md:p-12 ${
          isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'
        }`}>
          {/* 404 Number */}
          <div className={`text-8xl font-black mb-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent`}>
            404
          </div>

          {/* Icon */}
          <div className={`float-icon mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
            isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
          }`}>
            <MdSearchOff className="h-14 w-14" />
          </div>

          {/* Title */}
          <h2 className={`mt-8 text-3xl font-bold md:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Page Not Found
          </h2>

          {/* Description */}
          <p className={`mt-4 text-base leading-7 sm:text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>

          {/* Suggestions */}
          <div className={`mt-6 rounded-xl border p-5 text-left space-y-3 ${
            isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-gray-50'
          }`}>
            <p className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
              You might want to:
            </p>
            <ul className={`space-y-2 text-base ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              <li className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                Check the URL for typos
              </li>
              <li className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                Go back to the homepage
              </li>
              <li className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                Contact support if the problem persists
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className={`inline-flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                isDark
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-lg'
              }`}
            >
              <MdHome className="text-2xl" />
              Back to Home
            </Link>

            <Link
              to="/login"
              className={`inline-flex items-center justify-center gap-3 rounded-xl border px-8 py-4 text-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                isDark
                  ? 'border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <MdErrorOutline className="text-2xl" />
              Go to Login
            </Link>
          </div>

          {/* Help Text */}
          <p className={`mt-6 text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            If you believe this is a mistake, please{' '}
            <a href="mailto:support@lagronite.com" className={`font-medium transition-colors ${
              isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-500'
            }`}>
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}