import { useNavigate } from 'react-router-dom'
import { CampusFeed } from '../../components/feed/CampusFeed.jsx'

export function StudentDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">

      {/* CREATE POST CARD */}
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <div className="flex items-center justify-between p-5">

          <div>
            <h2 className="text-lg font-semibold text-white">
              Campus Feed
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Browse lost and found reports from students and administrators.
            </p>
          </div>

          <button
            onClick={() => navigate('/student/create-report')}
            className="
              rounded-2xl
              bg-gradient-to-r
              from-emerald-400
              to-cyan-400
              px-5
              py-3
              text-sm
              font-semibold
              text-slate-950
              transition-all
              duration-300
              hover:scale-[1.03]
              hover:shadow-[0_0_30px_rgba(52,211,153,0.35)]
            "
          >
            + Create Report
          </button>

        </div>
      </div>

      {/* FEED */}
      <CampusFeed
        type="all"
        limit={9}
        showPagination={false}
      />

    </div>
  )
}