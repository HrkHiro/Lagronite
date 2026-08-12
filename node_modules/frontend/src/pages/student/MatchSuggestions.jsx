import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ComparisonModal } from '../../components/match/ComparisonModal.jsx'
import { MatchCard } from '../../components/match/MatchCard.jsx'
import { buildMatchSuggestions } from '../../utils/matchAlgorithm.js'
import { MdSearch, MdCompareArrows, MdCheckCircle } from 'react-icons/md'

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

function KpiCard({ title, value, delay, icon: Icon, isDark }) {
  return (
    <div
      className={`anim-rise rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-6 backdrop-blur-xl shadow-lg`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
        <p className={`text-sm font-medium uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {title}
        </p>
      </div>
      <h3 className={`text-3xl font-bold sm:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </h3>
    </div>
  )
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
  const { theme } = useOutletContext() // Get theme from layout

  const isDark = theme === 'dark'

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
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
        .dot-grid-dark {
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
        .dot-grid-light {
          background-image: radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      {/* Background decorations */}
      <div className={`pointer-events-none absolute inset-0 ${isDark ? 'dot-grid-dark' : 'dot-grid-light'}`} />
      <div className={`glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.15]'} blur-[160px]`} />
      <div className={`glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.15]'} blur-[160px]`} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        {/* Header card - INCREASED padding and fonts */}
        <div className={`anim-rise overflow-hidden rounded-[2rem] border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg mb-8`}>
          <div className="p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Match Suggestions
            </p>
            <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Suggested matches between your lost and found items
            </h1>
            <p className={`mt-4 max-w-3xl text-base leading-7 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Match scores are calculated from category, color, location, date similarity, and description similarity. Results are sorted from highest to lowest.
            </p>

            {claimMessage && (
              <div className={`mt-6 rounded-2xl border ${isDark ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-emerald-400/30 bg-emerald-50'} px-6 py-4 text-base font-medium ${isDark ? 'text-emerald-200' : 'text-emerald-800'}`}>
                <div className="flex items-center gap-3">
                  <MdCheckCircle className="text-2xl flex-shrink-0" />
                  {claimMessage}
                </div>
              </div>
            )}
            {error && (
              <div className={`mt-6 rounded-2xl border ${isDark ? 'border-rose-400/20 bg-rose-500/10' : 'border-rose-400/30 bg-rose-50'} px-6 py-4 text-base font-medium ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>
                {error}
              </div>
            )}
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* KPI Cards - INCREASED sizes and icons */}
        <div className="grid gap-5 mb-8 sm:grid-cols-3">
          <KpiCard 
            title="Lost Items" 
            value={lostItems.length} 
            delay="0.1s" 
            icon={MdSearch}
            isDark={isDark}
          />
          <KpiCard 
            title="Found Items" 
            value={foundItems.length} 
            delay="0.2s" 
            icon={MdCheckCircle}
            isDark={isDark}
          />
          <KpiCard 
            title="Suggested Matches" 
            value={suggestions.length} 
            delay="0.3s" 
            icon={MdCompareArrows}
            isDark={isDark}
          />
        </div>

        {/* Match Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className={`flex h-48 items-center justify-center rounded-[1.75rem] border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
              <div className={`h-10 w-10 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-emerald-400' : 'border-gray-200 border-t-emerald-500'}`} />
              <p className={`ml-4 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Loading match suggestions...
              </p>
            </div>
          ) : paginatedSuggestions.length === 0 ? (
            <div className={`rounded-[1.75rem] border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-12 text-center backdrop-blur-xl`}>
              <MdCompareArrows className={`text-5xl mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                No matches found yet.
              </p>
              <p className={`mt-2 text-base ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Add both lost and found reports to generate suggestions.
              </p>
            </div>
          ) : (
            paginatedSuggestions.map((suggestion) => (
              <MatchCard
                key={suggestion.id}
                suggestion={suggestion}
                onCompare={setSelectedSuggestion}
                onClaim={handleClaim}
                isDark={isDark}
              />
            ))
          )}
        </div>

        {/* Pagination - INCREASED sizes */}
        {totalPages > 1 && (
          <div className={`mt-8 flex flex-col sm:flex-row items-center justify-between rounded-[2rem] border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} px-8 py-5 backdrop-blur-xl shadow-lg`}>
            <p className={`text-base ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Showing {paginatedSuggestions.length} of {suggestions.length} suggestions
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange('prev')}
                className={`rounded-full border px-6 py-3 text-base font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  isDark 
                    ? 'border-white/10 text-white hover:bg-white/5' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <span className={`rounded-full border px-6 py-3 text-base font-medium ${
                isDark 
                  ? 'border-white/10 bg-white/5 text-slate-200' 
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange('next')}
                className={`rounded-full border px-6 py-3 text-base font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  isDark 
                    ? 'border-white/10 text-white hover:bg-white/5' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
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
          isDark={isDark}
        />
      )}
    </section>
  )
}