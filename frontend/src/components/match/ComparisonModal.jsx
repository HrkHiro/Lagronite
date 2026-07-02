export function ComparisonModal({ suggestion, onClose, onClaim }) {
  const { lostItem, foundItem, breakdown, score } = suggestion

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 py-6 backdrop-blur-xl">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              Compare Match
            </p>
            <h3 className="mt-2 text-2xl font-bold text-white">
              {Math.round(score)}% Match Score
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            Close
          </button>
        </div>

        {/* Side‑by‑side items */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Lost Item */}
          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-rose-300">Lost Item</p>
            <h4 className="mt-2 text-2xl font-semibold text-white">{lostItem.itemName}</h4>
            {lostItem.image && (
              <img
                src={lostItem.image}
                alt={lostItem.itemName}
                className="mt-4 h-72 w-full rounded-3xl object-cover"
              />
            )}
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Category:</span> {lostItem.category}</p>
              <p><span className="text-slate-500">Color:</span> {lostItem.color}</p>
              <p><span className="text-slate-500">Location:</span> {lostItem.location}</p>
              <p><span className="text-slate-500">Description:</span> {lostItem.description}</p>
            </div>
          </section>

          {/* Found Item */}
          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-300">Found Item</p>
            <h4 className="mt-2 text-2xl font-semibold text-white">{foundItem.itemName}</h4>
            {foundItem.image && (
              <img
                src={foundItem.image}
                alt={foundItem.itemName}
                className="mt-4 h-72 w-full rounded-3xl object-cover"
              />
            )}
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Category:</span> {foundItem.category}</p>
              <p><span className="text-slate-500">Color:</span> {foundItem.color}</p>
              <p><span className="text-slate-500">Location:</span> {foundItem.location}</p>
              <p><span className="text-slate-500">Description:</span> {foundItem.description}</p>
            </div>
          </section>
        </div>

        {/* Breakdown & action */}
        <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <h4 className="text-lg font-semibold text-white">Match Breakdown</h4>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <BreakdownBar label="Category Match" value={breakdown.categoryScore} weight={30} />
            <BreakdownBar label="Color Match" value={breakdown.colorScore} weight={20} />
            <BreakdownBar label="Location Match" value={breakdown.locationScore} weight={20} />
            <BreakdownBar label="Date Similarity" value={breakdown.dateScore} weight={15} />
            <BreakdownBar label="Description Similarity" value={breakdown.descriptionScore} weight={15} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
            <p>Ready to submit a claim request for this match.</p>
            <button
              type="button"
              onClick={() => onClaim(suggestion)}
              className="rounded-full bg-amber-400 px-5 py-2.5 font-medium text-slate-950 transition hover:bg-amber-300"
            >
              Submit Claim Request
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function BreakdownBar({ label, value, weight }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
        <span>{label}</span>
        <span>{value}/{weight}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-amber-400"
          style={{ width: `${(value / weight) * 100}%` }}
        />
      </div>
    </div>
  )
}