function BreakdownBar({ label, value, weight }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
        <span>{label}</span>
        <span>{value}/{weight}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(value / weight) * 100}%` }} />
      </div>
    </div>
  )
}

export function ComparisonModal({ suggestion, onClose, onClaim }) {
  const { lostItem, foundItem, breakdown, score } = suggestion

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-black/40 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">Compare Match</p>
            <h3 className="mt-2 text-2xl font-semibold">{Math.round(score)}% Match Score</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-rose-300">Lost Item</p>
            <h4 className="mt-2 text-2xl font-semibold">{lostItem.itemName}</h4>
            <img src={lostItem.image} alt={lostItem.itemName} className="mt-4 h-72 w-full rounded-3xl object-cover" />
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Category:</span> {lostItem.category}</p>
              <p><span className="text-slate-500">Color:</span> {lostItem.color}</p>
              <p><span className="text-slate-500">Location:</span> {lostItem.location}</p>
              <p><span className="text-slate-500">Description:</span> {lostItem.description}</p>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-sky-300">Found Item</p>
            <h4 className="mt-2 text-2xl font-semibold">{foundItem.itemName}</h4>
            <img src={foundItem.image} alt={foundItem.itemName} className="mt-4 h-72 w-full rounded-3xl object-cover" />
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p><span className="text-slate-500">Category:</span> {foundItem.category}</p>
              <p><span className="text-slate-500">Color:</span> {foundItem.color}</p>
              <p><span className="text-slate-500">Location:</span> {foundItem.location}</p>
              <p><span className="text-slate-500">Description:</span> {foundItem.description}</p>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
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
            <button type="button" onClick={() => onClaim(suggestion)} className="rounded-full bg-emerald-500 px-5 py-2.5 font-medium text-slate-950 hover:bg-emerald-400">
              Submit Claim Request
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
