import {
  MdClose,
  MdCompareArrows,
  MdCategory,
  MdColorLens,
  MdLocationOn,
  MdDescription,
  MdImage,
  MdSearchOff,
  MdCheckCircle,
} from 'react-icons/md'

export function ComparisonModal({ suggestion, onClose, onClaim, isDark = true }) {
  const { lostItem, foundItem, breakdown, score } = suggestion

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-6 py-8 backdrop-blur-xl ${
      isDark ? 'bg-slate-950/85' : 'bg-gray-900/85'
    }`}>
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-rise {
          animation: riseIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      <div className={`animate-rise max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl md:p-10 ${
        isDark ? 'border-white/10 bg-slate-950/95 text-white' : 'border-gray-200 bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MdCompareArrows className={`text-2xl ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
                Compare Match
              </p>
            </div>
            <h3 className={`mt-2 text-3xl font-bold md:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(score)}% Match Score
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-5 py-3 text-base font-medium transition-all duration-200 flex items-center gap-2 ${
              isDark
                ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08]'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
            }`}
          >
            <MdClose className="text-xl" />
            Close
          </button>
        </div>

        {/* Side‑by‑side items */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Lost Item */}
          <section className={`rounded-[1.75rem] border p-6 backdrop-blur-xl ${
            isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'
          }`}>
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] flex items-center gap-2 ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
              <MdSearchOff className="text-lg" />
              Lost Item
            </p>
            <h4 className={`mt-3 text-2xl font-bold md:text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {lostItem.itemName}
            </h4>
            
            {lostItem.image ? (
              <img
                src={lostItem.image}
                alt={lostItem.itemName}
                className="mt-5 h-72 w-full rounded-3xl object-cover border border-white/10"
              />
            ) : (
              <div className={`mt-5 h-72 w-full rounded-3xl flex items-center justify-center border ${
                isDark ? 'border-white/10 bg-slate-800/50' : 'border-gray-200 bg-gray-100'
              }`}>
                <MdImage className={`text-6xl ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
              </div>
            )}

            <div className="mt-5 space-y-3 text-base">
              <div className="flex items-center gap-2">
                <MdCategory className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Category:</span>
                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{lostItem.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdColorLens className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Color:</span>
                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{lostItem.color}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdLocationOn className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Location:</span>
                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{lostItem.location}</span>
              </div>
              <div className="flex items-start gap-2">
                <MdDescription className={`text-lg mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Description:</span>
                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{lostItem.description}</span>
              </div>
            </div>
          </section>

          {/* Found Item */}
          <section className={`rounded-[1.75rem] border p-6 backdrop-blur-xl ${
            isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'
          }`}>
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] flex items-center gap-2 ${isDark ? 'text-sky-300' : 'text-sky-600'}`}>
              <MdCheckCircle className="text-lg" />
              Found Item
            </p>
            <h4 className={`mt-3 text-2xl font-bold md:text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {foundItem.itemName}
            </h4>
            
            {foundItem.image ? (
              <img
                src={foundItem.image}
                alt={foundItem.itemName}
                className="mt-5 h-72 w-full rounded-3xl object-cover border border-white/10"
              />
            ) : (
              <div className={`mt-5 h-72 w-full rounded-3xl flex items-center justify-center border ${
                isDark ? 'border-white/10 bg-slate-800/50' : 'border-gray-200 bg-gray-100'
              }`}>
                <MdImage className={`text-6xl ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
              </div>
            )}

            <div className="mt-5 space-y-3 text-base">
              <div className="flex items-center gap-2">
                <MdCategory className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Category:</span>
                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{foundItem.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdColorLens className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Color:</span>
                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{foundItem.color}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdLocationOn className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Location:</span>
                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{foundItem.location}</span>
              </div>
              <div className="flex items-start gap-2">
                <MdDescription className={`text-lg mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Description:</span>
                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{foundItem.description}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Breakdown & Action */}
        <section className={`mt-8 rounded-[1.75rem] border p-6 backdrop-blur-xl ${
          isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <MdCompareArrows className={`text-2xl ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            Match Breakdown
          </h4>
          
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <BreakdownBar label="Category Match" value={breakdown.categoryScore} weight={30} isDark={isDark} />
            <BreakdownBar label="Color Match" value={breakdown.colorScore} weight={20} isDark={isDark} />
            <BreakdownBar label="Location Match" value={breakdown.locationScore} weight={20} isDark={isDark} />
            <BreakdownBar label="Date Similarity" value={breakdown.dateScore} weight={15} isDark={isDark} />
            <BreakdownBar label="Description Similarity" value={breakdown.descriptionScore} weight={15} isDark={isDark} />
          </div>

          <div className={`mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-5 text-base ${
            isDark ? 'border-white/10 bg-slate-950/70 text-slate-300' : 'border-gray-200 bg-gray-50 text-gray-600'
          }`}>
            <p className="font-medium">Ready to submit a claim request for this match.</p>
            <button
              type="button"
              onClick={() => onClaim(suggestion)}
              className="rounded-xl bg-amber-500 px-7 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:-translate-y-0.5 flex items-center gap-2"
            >
              <MdCheckCircle className="text-xl" />
              Submit Claim Request
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function BreakdownBar({ label, value, weight, isDark }) {
  const percentage = (value / weight) * 100

  return (
    <div className="space-y-2.5">
      <div className={`flex items-center justify-between gap-3 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
        <span>{label}</span>
        <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
          {value}/{weight}
        </span>
      </div>
      <div className={`h-3 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}