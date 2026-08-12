import { MatchPercentageBadge } from './MatchPercentageBadge.jsx'
import {
  MdSearchOff,
  MdCheckCircle,
  MdCalendarToday,
  MdLocationOn,
  MdCompareArrows,
  MdSend,
  MdImage,
} from 'react-icons/md'

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function MatchCard({ suggestion, onCompare, onClaim, isDark = true }) {
  const { lostItem, foundItem, score } = suggestion

  return (
    <article className={`overflow-hidden rounded-[1.75rem] border backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
      isDark
        ? 'border-white/10 bg-white/[0.04] shadow-slate-950/20'
        : 'border-gray-200 bg-white shadow-gray-200/50'
    }`}>
      <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
        {/* Lost side */}
        <div className={`border-b lg:border-b-0 lg:border-r ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className={`flex items-center justify-between gap-3 border-b px-6 py-5 ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.18em] flex items-center gap-2 ${
                isDark ? 'text-rose-300' : 'text-rose-600'
              }`}>
                <MdSearchOff className="text-lg" />
                Lost Item
              </p>
              <h3 className={`mt-1.5 text-xl font-bold md:text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {lostItem.itemName}
              </h3>
            </div>
            <MatchPercentageBadge score={score} isDark={isDark} />
          </div>
          <div className="p-6">
            {lostItem.image ? (
              <img
                src={lostItem.image}
                alt={lostItem.itemName}
                className="h-56 w-full rounded-3xl object-cover border border-white/10"
              />
            ) : (
              <div className={`h-56 w-full rounded-3xl flex items-center justify-center border ${
                isDark ? 'border-white/10 bg-slate-800/50' : 'border-gray-200 bg-gray-100'
              }`}>
                <MdImage className={`text-6xl ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
              </div>
            )}
          </div>
        </div>

        {/* Found side */}
        <div>
          <div className={`flex items-center justify-between gap-3 border-b px-6 py-5 ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.18em] flex items-center gap-2 ${
                isDark ? 'text-sky-300' : 'text-sky-600'
              }`}>
                <MdCheckCircle className="text-lg" />
                Found Item
              </p>
              <h3 className={`mt-1.5 text-xl font-bold md:text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {foundItem.itemName}
              </h3>
            </div>
            <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
              isDark
                ? 'border-white/10 text-slate-300'
                : 'border-gray-200 text-gray-600 bg-gray-50'
            }`}>
              {foundItem.status}
            </span>
          </div>
          <div className="p-6">
            {foundItem.image ? (
              <img
                src={foundItem.image}
                alt={foundItem.itemName}
                className="h-56 w-full rounded-3xl object-cover border border-white/10"
              />
            ) : (
              <div className={`h-56 w-full rounded-3xl flex items-center justify-center border ${
                isDark ? 'border-white/10 bg-slate-800/50' : 'border-gray-200 bg-gray-100'
              }`}>
                <MdImage className={`text-6xl ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info & Actions */}
      <div className={`grid gap-5 border-t p-6 md:grid-cols-[1fr_auto] md:items-center ${
        isDark ? 'border-white/10' : 'border-gray-200'
      }`}>
        <div className="grid gap-3 text-base sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <MdCalendarToday className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Lost Date:</span>
            <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{formatDate(lostItem.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdCalendarToday className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Found Date:</span>
            <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{formatDate(foundItem.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdLocationOn className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Lost Location:</span>
            <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{lostItem.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdLocationOn className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Found Location:</span>
            <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{foundItem.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          <button
            type="button"
            onClick={() => onCompare(suggestion)}
            className={`rounded-xl border px-6 py-3 text-base font-medium transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2 ${
              isDark
                ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MdCompareArrows className="text-xl" />
            Compare
          </button>
          <button
            type="button"
            onClick={() => onClaim(suggestion)}
            className="rounded-xl bg-amber-500 px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:-translate-y-0.5 flex items-center gap-2"
          >
            <MdSend className="text-xl" />
            Submit Claim
          </button>
        </div>
      </div>
    </article>
  )
}