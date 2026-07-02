import { Link } from 'react-router-dom'
import { MdHome, MdLock, MdSecurity, MdArrowBack } from 'react-icons/md'

export function Unauthorized({ isDark: propIsDark }) {
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
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .anim-rise { animation: riseIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .float-icon { animation: floatY 3s ease-in-out infinite; }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .pulse-border { animation: pulse 2s ease-in-out infinite; }
        .shake-animation { animation: shake 0.6s ease-in-out; }
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
      <div className={`glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-rose-500/[0.06]' : 'bg-rose-500/[0.12]'} blur-[160px]`} />
      <div className={`glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-amber-500/[0.06]' : 'bg-amber-500/[0.12]'} blur-[160px]`} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className={`anim-rise w-full max-w-lg rounded-2xl border p-10 text-center backdrop-blur-xl shadow-2xl md:p-12 ${
          isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'
        }`}>
          
          {/* Status Code */}
          <div className="text-8xl font-black mb-4 bg-gradient-to-r from-rose-400 via-amber-400 to-rose-400 bg-clip-text text-transparent">
            401
          </div>

          {/* Icon Container */}
          <div className="relative mx-auto">
            <div className={`float-icon mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
              isDark ? 'bg-rose-500/10' : 'bg-rose-100'
            }`}>
              <MdLock className={`h-14 w-14 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
            </div>
            <div className={`absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full ${
              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
            }`}>
              <MdSecurity className="h-5 w-5" />
            </div>
          </div>

          {/* Title */}
          <h2 className={`mt-8 text-3xl font-bold md:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Access Denied
          </h2>

          {/* Description */}
          <p className={`mt-4 text-base leading-7 sm:text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            You don't have permission to access this page. This area is restricted to authorized users only.
          </p>

          {/* Info Box */}
          <div className={`mt-6 rounded-xl border p-5 text-left ${
            isDark ? 'border-rose-500/20 bg-rose-500/[0.05]' : 'border-rose-200 bg-rose-50'
          }`}>
            <p className={`text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${
              isDark ? 'text-rose-300' : 'text-rose-700'
            }`}>
              <MdSecurity className="text-lg" />
              Possible reasons:
            </p>
            <ul className={`space-y-2 text-base ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              <li className="flex items-start gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-rose-400' : 'bg-rose-500'}`} />
                <span>You may not be logged in with the correct account type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-rose-400' : 'bg-rose-500'}`} />
                <span>Your session may have expired and needs to be renewed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-rose-400' : 'bg-rose-500'}`} />
                <span>This page requires higher access privileges</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className={`inline-flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                isDark
                  ? 'bg-white text-slate-950 hover:bg-gray-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                  : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
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
              <MdArrowBack className="text-2xl" />
              Sign In
            </Link>
          </div>

          {/* Help Text */}
          <p className={`mt-6 text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            If you believe this is a mistake, please{' '}
            <a 
              href="mailto:support@lagronite.com" 
              className={`font-medium transition-colors ${
                isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-500'
              }`}
            >
              contact support
            </a>
            {' '}for assistance.
          </p>
        </div>
      </div>
    </section>
  )
}