import { Link } from 'react-router-dom'
import { MdHome, MdSearchOff } from 'react-icons/md'

export function NotFound() {
  return (
    <>
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-rise { animation: riseIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .float-icon { animation: floatY 3s ease-in-out infinite; }
      `}</style>

      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="anim-rise w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]">
          {/* Icon */}
          <div className="float-icon mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <MdSearchOff className="h-12 w-12" />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-white">Page not found</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            The route you requested does not exist. It may have been moved or deleted.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
          >
            <MdHome className="text-lg" />
            Go home
          </Link>
        </div>
      </div>
    </>
  )
}