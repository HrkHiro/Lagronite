import { MatchPercentageBadge } from './MatchPercentageBadge.jsx'

function formatDate(value) {
  if (!value) return 'N/A'

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function MatchCard({ suggestion, onCompare, onClaim }) {
  const { lostItem, foundItem, score } = suggestion

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-lg shadow-slate-950/20">
      <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
        <div className="border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-rose-300">Lost Item</p>
              <h3 className="mt-1 text-xl font-semibold text-white">{lostItem.itemName}</h3>
            </div>
            <MatchPercentageBadge score={score} />
          </div>
          <div className="p-5">
            <img src={lostItem.image} alt={lostItem.itemName} className="h-56 w-full rounded-3xl object-cover" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Found Item</p>
              <h3 className="mt-1 text-xl font-semibold text-white">{foundItem.itemName}</h3>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
              {foundItem.status}
            </span>
          </div>
          <div className="p-5">
            <img src={foundItem.image} alt={foundItem.itemName} className="h-56 w-full rounded-3xl object-cover" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-white/10 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          <p><span className="text-slate-500">Lost Date:</span> {formatDate(lostItem.date)}</p>
          <p><span className="text-slate-500">Found Date:</span> {formatDate(foundItem.date)}</p>
          <p><span className="text-slate-500">Lost Location:</span> {lostItem.location}</p>
          <p><span className="text-slate-500">Found Location:</span> {foundItem.location}</p>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          <button
            type="button"
            onClick={() => onCompare(suggestion)}
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-200 hover:bg-white/10"
          >
            Compare
          </button>
          <button
            type="button"
            onClick={() => onClaim(suggestion)}
            className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400"
          >
            Submit Claim Request
          </button>
        </div>
      </div>
    </article>
  )
}
