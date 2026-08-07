export function ReportDetailModal({ report, onClose, onMessage, onClaimed }) {
  if (!report) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Report details</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{report.itemName}</h2>
            <p className="text-sm text-slate-400">{report.category} • {report.color}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[260px_1fr]">
          <div className="space-y-4">
            <img
              src={report.image}
              alt={report.itemName}
              className="h-80 w-full rounded-[1.5rem] object-cover border border-white/10"
            />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Reported by</p>
              <p className="mt-2 text-lg font-medium text-white">{report.reporter?.name || 'Unknown student'}</p>
              <p className="text-sm text-slate-400">{report.reporter?.email || 'No email available'}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
              <p className="mt-2 text-lg font-semibold text-white">{report.status}</p>
              {report.claimerName && (
                <p className="mt-2 text-sm text-slate-400">Claimed by: {report.claimerName}</p>
              )}
              {report.claimedAt && (
                <p className="mt-2 text-sm text-slate-400">Claimed at: {new Date(report.claimedAt).toLocaleString()}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Details</p>
              <div className="mt-4 space-y-3 text-slate-300">
                <p>{report.description}</p>
                <p className="text-sm text-slate-400">Date: {new Date(report.date).toLocaleDateString()}</p>
                <p className="text-sm text-slate-400">Location: {report.location}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onMessage}
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Message reporter
              </button>
              <button
                type="button"
                onClick={() => onClaimed(report)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Mark as claimed
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-4 text-sm text-slate-400">
              <p className="font-semibold text-white">Reporter info</p>
              <p className="mt-2">Type: {report.reportType === 'lost' ? 'Lost item' : 'Found item'}</p>
              <p>Reported at: {new Date(report.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
