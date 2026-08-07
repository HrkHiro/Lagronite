import { useMemo, useState } from 'react'

export function AdminClaimModal({ report, isDark = true, onClose, onConfirm }) {
  const [claimerName, setClaimerName] = useState('')
  const [claimedAt, setClaimedAt] = useState(() => {
    const now = new Date()
    const date = now.toISOString().slice(0, 10)
    const time = now.toTimeString().slice(0, 5)
    return { date, time }
  })

  const combinedDateTime = useMemo(() => {
    if (!claimedAt.date || !claimedAt.time) return null
    const value = new Date(`${claimedAt.date}T${claimedAt.time}:00`)
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }, [claimedAt])

  const handleSubmit = () => {
    const trimmedName = claimerName.trim()

    if (!trimmedName) {
      return
    }

    onConfirm({
      claimerName: trimmedName,
      claimedAt: combinedDateTime,
    })
  }

  if (!report) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl">
      <div className={`w-full max-w-xl rounded-[2rem] border p-6 shadow-2xl ${
        isDark
          ? 'border-white/10 bg-slate-950 text-white'
          : 'border-gray-200 bg-white text-gray-900'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.25em] ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Admin claim</p>
            <h2 className="mt-2 text-2xl font-bold">Mark item as claimed</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Close
          </button>
        </div>

        <div className={`mt-6 rounded-2xl border p-5 ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'}`}>
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">Item</p>
            <p className="mt-2 text-lg font-bold">{report.itemName}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{report.category} • {report.color}</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className={`mb-2 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Student name</span>
              <input
                value={claimerName}
                onChange={(event) => setClaimerName(event.target.value)}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                  isDark
                    ? 'border-white/10 bg-slate-900 text-white placeholder:text-slate-500 focus:border-emerald-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500'
                }`}
                placeholder="Enter the claiming student"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Claim date</span>
                <input
                  type="date"
                  value={claimedAt.date}
                  onChange={(event) => setClaimedAt((current) => ({ ...current, date: event.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                    isDark
                      ? 'border-white/10 bg-slate-900 text-white focus:border-emerald-400'
                      : 'border-gray-300 bg-white text-gray-900 focus:border-emerald-500'
                  }`}
                />
              </label>

              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Claim time</span>
                <input
                  type="time"
                  value={claimedAt.time}
                  onChange={(event) => setClaimedAt((current) => ({ ...current, time: event.target.value }))}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                    isDark
                      ? 'border-white/10 bg-slate-900 text-white focus:border-emerald-400'
                      : 'border-gray-300 bg-white text-gray-900 focus:border-emerald-500'
                  }`}
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!claimerName.trim()}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Confirm claim
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-2xl border px-5 py-3 text-sm font-semibold ${
                isDark
                  ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
