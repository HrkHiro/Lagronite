import { useEffect, useMemo, useState } from 'react'
import { ComparisonModal } from '../../components/match/ComparisonModal.jsx'
import { MatchCard } from '../../components/match/MatchCard.jsx'
import { buildMatchSuggestions } from '../../utils/matchAlgorithm.js'

function splitReports(reports) {
  return {
    lostItems: reports.filter((report) => report.reportType === 'lost'),
    foundItems: reports.filter((report) => report.reportType === 'found'),
  }
}

function normalizeReport(item) {
  return {
    id: item.id,
    reportType: item.reportType,
    itemName: item.itemName,
    category: item.category,
    color: item.color,
    description: item.description,
    date: item.date,
    location: item.location,
    image: item.image,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function buildClaimMessage(suggestion) {
  return `Claim request submitted for ${suggestion.lostItem.itemName} vs ${suggestion.foundItem.itemName}.`
}

export function MatchSuggestions() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [claimMessage, setClaimMessage] = useState('')
  const [isClaiming, setIsClaiming] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(8)

  useEffect(() => {
    let cancelled = false

    const fetchReports = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`http://localhost:5000/api/reports?page=1&limit=100`, {
          credentials: 'include',
        })
        const data = await response.json().catch(() => ({}))

        if (!cancelled) {
          if (!response.ok) {
            throw new Error(data.message || 'Failed to load reports')
          }
          setReports((data.reports || []).map(normalizeReport))
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchReports()

    return () => {
      cancelled = true
    }
  }, [])

  const { lostItems, foundItems } = useMemo(() => splitReports(reports), [reports])
  const suggestions = useMemo(() => buildMatchSuggestions(lostItems, foundItems), [lostItems, foundItems])

  const totalPages = Math.max(Math.ceil(suggestions.length / limit), 1)
  const currentPage = Math.min(page, totalPages)
  const paginatedSuggestions = suggestions.slice((currentPage - 1) * limit, (currentPage - 1) * limit + limit)

  const handlePageChange = (direction) => {
    setPage((current) => {
      const nextPage = direction === 'next' ? Math.min(current + 1, totalPages) : Math.max(current - 1, 1)
      return nextPage
    })
  }

  const handleClaim = async (suggestion) => {
    setIsClaiming(true)
    setError('')
    try {
      setClaimMessage(buildClaimMessage(suggestion))
      setSelectedSuggestion(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .anim-rise { animation: riseIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[160px]" />
      <div className="glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header card */}
        <div className="anim-rise overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl mb-6">
          <div className="p-6 lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Match Suggestions
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white lg:text-4xl">
              Suggested matches between your lost and found items
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Match scores are calculated from category, color, location, date similarity, and description similarity. Results are sorted from highest to lowest.
            </p>

            {claimMessage && (
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {claimMessage}
              </div>
            )}
            {error && (
              <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 mb-6 sm:grid-cols-3">
          <KpiCard title="Lost Items" value={lostItems.length} delay="0.1s" />
          <KpiCard title="Found Items" value={foundItems.length} delay="0.2s" />
          <KpiCard title="Suggested Matches" value={suggestions.length} delay="0.3s" />
        </div>

        {/* Match Cards */}
        <div className="space-y-5">
          {loading ? (
            <div className="flex h-48 items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
              <p className="ml-3 text-sm text-slate-400">Loading match suggestions...</p>
            </div>
          ) : paginatedSuggestions.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl text-slate-400">
              <p>No matches found yet.</p>
              <p className="mt-2 text-sm">Add both lost and found reports to generate suggestions.</p>
            </div>
          ) : (
            paginatedSuggestions.map((suggestion) => (
              <MatchCard
                key={suggestion.id}
                suggestion={suggestion}
                onCompare={setSelectedSuggestion}
                onClaim={handleClaim}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-4 backdrop-blur-xl text-sm text-slate-300">
            <p>
              Showing {paginatedSuggestions.length} of {suggestions.length} suggestions
            </p>
            <div className="flex items-center gap-3 mt-3 sm:mt-0">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange('prev')}
                className="rounded-full border border-white/10 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/5"
              >
                Previous
              </button>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange('next')}
                className="rounded-full border border-white/10 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedSuggestion && (
        <ComparisonModal
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          onClaim={handleClaim}
          disabled={isClaiming}
        />
      )}
    </section>
  )
}

function KpiCard({ title, value, delay }) {
  return (
    <div
      className="anim-rise rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)]"
      style={{ animationDelay: delay }}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
    </div>
  )
}