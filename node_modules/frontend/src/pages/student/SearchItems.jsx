import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FilterPanel } from '../../components/search/FilterPanel.jsx'
import { ItemCard } from '../../components/search/ItemCard.jsx'
import { Pagination } from '../../components/search/Pagination.jsx'
import { SearchBar } from '../../components/search/SearchBar.jsx'
import { apiUrl, getAuthHeaders } from '../../services/api.js'
import {
  MdSearch,
  MdClose,
  MdInfo,
  MdCategory,
  MdColorLens,
  MdCalendarToday,
  MdLocationOn,
  MdDescription,
  MdError,
  MdSearchOff,
} from 'react-icons/md'

const defaultFilters = {
  search: '',
  category: 'All',
  color: 'All',
  date: '',
  status: 'All',
}

function normalizeItems(items) {
  return items.map((item) => ({
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
  }))
}

function DetailsModal({ item, onClose, isDark }) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-6 py-8 ${isDark ? 'bg-slate-950/85' : 'bg-gray-900/85'} backdrop-blur-xl`}>
      <div className={`max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl md:p-10 ${
        isDark ? 'border-white/10 bg-slate-950/95 text-white' : 'border-gray-200 bg-white text-gray-900'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Item Details
            </p>
            <h3 className={`mt-2 text-3xl font-bold sm:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {item.itemName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-5 py-2.5 text-base font-medium transition-all duration-200 flex items-center gap-2 ${
              isDark
                ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-emerald-400/20 hover:bg-white/[0.08]'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-emerald-400/50 hover:bg-gray-100'
            }`}
          >
            <MdClose className="text-xl" />
            Close
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className={`overflow-hidden rounded-3xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            {item.image ? (
              <img src={item.image} alt={item.itemName} className="w-full h-80 object-cover" />
            ) : (
              <div className={`flex h-80 items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-400'}`}>
                <MdSearchOff className="text-6xl" />
              </div>
            )}
          </div>

          <div className={`space-y-4 text-base ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            <div className="flex items-center gap-2">
              <MdCategory className={`text-xl ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Category:</span>
              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{item.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdColorLens className={`text-xl ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Color:</span>
              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{item.color}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdCalendarToday className={`text-xl ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Date:</span>
              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                {String(item.date).slice(0, 10)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MdLocationOn className={`text-xl ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Location:</span>
              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{item.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdInfo className={`text-xl ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Status:</span>
              <span className={`font-medium capitalize ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{item.status}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MdDescription className={`text-xl ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Description:</span>
              </div>
              <p className={`leading-7 text-base ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                {item.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SearchItems() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0, limit: 6 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const { theme } = useOutletContext() // Get theme from layout

  const isDark = theme === 'dark'

  const fetchItems = async (nextPage = 1) => {
    Promise.resolve().then(() => setLoading(true))
    setError('')

    try {
      const params = new URLSearchParams()
      params.set('page', String(nextPage))
      params.set('limit', String(pagination.limit))

      if (filters.search.trim()) params.set('search', filters.search.trim())
      if (filters.category !== 'All') params.set('category', filters.category)
      if (filters.color !== 'All') params.set('color', filters.color)
      if (filters.date) params.set('date', filters.date)
      if (filters.status !== 'All') params.set('status', filters.status)

      const response = await fetch(apiUrl(`/api/reports?${params.toString()}`), {
        credentials: 'include',
        headers: getAuthHeaders(),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load items')
      }

      setItems(normalizeItems(data.reports || []))
      setPagination(data.pagination || { page: nextPage, totalPages: 1, totalItems: 0, limit: pagination.limit })
      setPage(data.pagination?.page || nextPage)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchItems(1), 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handlePageChange = (direction) => {
    setPage((currentPage) => {
      const nextPage = direction === 'next'
        ? Math.min(currentPage + 1, pagination.totalPages)
        : Math.max(currentPage - 1, 1)
      fetchItems(nextPage)
      return nextPage
    })
  }

  const filteredCountLabel = useMemo(
    () => `${pagination.totalItems} result${pagination.totalItems === 1 ? '' : 's'}`,
    [pagination.totalItems]
  )

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
            <div className="flex items-center gap-3 mb-1">
              <MdSearch className={`text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Search Items
              </p>
            </div>
            <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Find submitted lost and found items
            </h1>
            <p className={`mt-4 max-w-3xl text-base leading-7 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Search your submitted reports by item name and refine results by category, color, date, and status.
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_1.9fr]">
              <SearchBar value={filters.search} onChange={handleFilterChange} isDark={isDark} />
              <FilterPanel filters={filters} onFilterChange={handleFilterChange} isDark={isDark} />
            </div>

            <div className={`mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-6 py-4 text-base ${
              isDark ? 'border-white/10 bg-slate-950/60 text-slate-300' : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}>
              <p className="font-medium">{filteredCountLabel}</p>
              <p>Showing page {page}</p>
            </div>

            {error && (
              <div className={`mt-6 rounded-2xl border px-6 py-5 flex items-start gap-3 ${
                isDark ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-rose-400/30 bg-rose-50 text-rose-800'
              }`}>
                <MdError className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`} />
                <p className="text-base font-medium">{error}</p>
              </div>
            )}
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Results */}
        <div className="space-y-5">
          {loading ? (
            <div className={`flex h-48 items-center justify-center rounded-[1.75rem] border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
              <div className={`h-10 w-10 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-emerald-400' : 'border-gray-200 border-t-emerald-500'}`} />
              <p className={`ml-4 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Loading items...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className={`rounded-[1.75rem] border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-12 text-center backdrop-blur-xl`}>
              <MdSearchOff className={`text-6xl mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                No items found for the selected filters.
              </p>
              <p className={`mt-2 text-base ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <ItemCard 
                key={`${item.reportType}-${item.id}`} 
                item={item} 
                onViewDetails={setSelectedItem}
                isDark={isDark}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className={`mt-8 overflow-hidden rounded-[2rem] border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
            <Pagination 
              page={pagination.page || page} 
              totalPages={pagination.totalPages || 1} 
              onPageChange={handlePageChange}
              isDark={isDark}
            />
          </div>
        )}
      </div>

      {selectedItem && (
        <DetailsModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)}
          isDark={isDark}
        />
      )}
    </section>
  )
}