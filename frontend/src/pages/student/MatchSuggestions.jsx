import { useEffect, useMemo, useState } from 'react'
import { ComparisonModal } from '../../components/match/ComparisonModal.jsx'
import { MatchCard } from '../../components/match/MatchCard.jsx'
import { buildMatchSuggestions, formatMatchPercent } from '../../utils/matchAlgorithm.js'

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

  const fetchReports = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`http://localhost:5000/api/reports?page=1&limit=100`, {
        credentials: 'include',
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load reports')
      }

      setReports((data.reports || []).map(normalizeReport))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
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
    <div className="space-y-6 text-white">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20 md:p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">Match Suggestions</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Suggested matches between your lost and found items</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
            Match scores are calculated from category, color, location, date similarity, and description similarity. Results are sorted from highest to lowest.
          </p>
        </div>

        {claimMessage ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {claimMessage}
          </div>
        ) : null}

        {error ? <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Lost Items</p>
          <p className="mt-3 text-4xl font-semibold text-white">{lostItems.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Found Items</p>
          <p className="mt-3 text-4xl font-semibold text-white">{foundItems.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Suggested Matches</p>
          <p className="mt-3 text-4xl font-semibold text-white">{suggestions.length}</p>
        </div>
      </section>

      <section className="space-y-5">
        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300">Loading match suggestions...</div>
        ) : paginatedSuggestions.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300">
            No matches found yet. Add both lost and found reports to generate suggestions.
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
      </section>

      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
        <p>
          Showing {paginatedSuggestions.length} of {suggestions.length} suggestions
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange('prev')}
            className="rounded-full border border-white/10 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
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
            className="rounded-full border border-white/10 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>

      {selectedSuggestion ? (
        <ComparisonModal
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          onClaim={handleClaim}
          disabled={isClaiming}
        />
      ) : null}
    </div>
  )
}
