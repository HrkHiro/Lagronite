import { useNavigate } from 'react-router-dom'
import { CampusFeed } from '../../components/feed/CampusFeed.jsx'
import { MdAdd } from 'react-icons/md'

export function StudentDashboard() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes shine {
          from { transform: translateX(-120%) skewX(-15deg); }
          to { transform: translateX(220%) skewX(-15deg); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .anim-rise { animation: riseIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .shine-btn {
          position: relative;
          overflow: hidden;
        }
        .shine-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: translateX(-120%) skewX(-15deg);
        }
        .shine-btn:hover::after {
          animation: shine 0.85s ease forwards;
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[160px]" />
      <div className="glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[160px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header card - smaller padding & fonts */}
        <div className="anim-rise overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Campus Feed
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Lost &amp; Found Reports
              </h1>
              <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-400">
                Browse lost and found reports from students and administrators.
              </p>
            </div>

            <button
              onClick={() => navigate('/student/create-report')}
              className="shine-btn group inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)]"
            >
              <MdAdd className="text-xl" />
              Create Report
            </button>
          </div>

          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Feed card - smaller padding */}
        <div className="anim-rise mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)]">
          <div className="p-4 sm:p-5 lg:p-6">
            <CampusFeed type="all" limit={9} showPagination={false} />
          </div>
        </div>
      </div>
    </section>
  )
}