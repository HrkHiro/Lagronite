function getStatusClass(status) {
  switch (status) {
    case 'Lost':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-200'
    case 'Found':
      return 'border-sky-400/20 bg-sky-500/10 text-sky-200'
    case 'Claimed':
      return 'border-amber-400/20 bg-amber-500/10 text-amber-200'
    case 'Returned':
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
    default:
      return 'border-white/10 bg-white/5 text-slate-200'
  }
}

function formatDate(value) {
  if (!value) return 'N/A'

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ItemCard({ item, onViewDetails }) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-lg shadow-slate-950/20">
      <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
        <div className="h-64 w-full lg:h-full">
          <img src={item.image} alt={item.itemName} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-col p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{item.reportType === 'lost' ? 'Lost Item' : 'Found Item'}</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{item.itemName}</h3>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(item.status)}`}>
              {item.status}
            </span>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <p><span className="text-slate-500">Category:</span> {item.category}</p>
            <p><span className="text-slate-500">Color:</span> {item.color}</p>
            <p><span className="text-slate-500">Date:</span> {formatDate(item.date)}</p>
            <p><span className="text-slate-500">Location:</span> {item.location}</p>
          </div>

          <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-300">{item.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}