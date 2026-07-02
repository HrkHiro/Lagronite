import { useEffect, useMemo, useState } from 'react'
import { FilterPanel } from '../../components/search/FilterPanel.jsx'
import { ItemCard } from '../../components/search/ItemCard.jsx'
import { Pagination } from '../../components/search/Pagination.jsx'
import { SearchBar } from '../../components/search/SearchBar.jsx'

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

function DetailsModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 py-6 backdrop-blur-xl">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Item Details</p>
            <h3 className="mt-2 text-2xl font-bold">{item.itemName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-400/20 hover:bg-white/[0.08]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <img src={item.image} alt={item.itemName} className="w-full h-72 object-cover" />
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p><span className="text-slate-500">Category:</span> {item.category}</p>
            <p><span className="text-slate-500">Color:</span> {item.color}</p>
            <p><span className="text-slate-500">Date:</span> {String(item.date).slice(0, 10)}</p>
            <p><span className="text-slate-500">Location:</span> {item.location}</p>
            <p><span className="text-slate-500">Status:</span> {item.status}</p>
            <div>
              <p className="text-slate-500">Description:</p>
              <p className="mt-2 leading-6 text-slate-200">{item.description}</p>
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

  const fetchItems = async (nextPage = 1) => {
    // Defer setLoading to avoid synchronous setState in effect
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

      const response = await fetch(`http://localhost:5000/api/reports?${params.toString()}`, {
        credentials: 'include',
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
    // Defer the fetch call to avoid synchronous setState in effect
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
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {/* Homepage keyframes */}
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Search Items</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white lg:text-4xl">Find submitted lost and found items</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Search your submitted reports by item name and refine results by category, color, date, and status.
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
              <SearchBar value={filters.search} onChange={handleFilterChange} />
              <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              <p>{filteredCountLabel}</p>
              <p>Showing page {page}</p>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
              <p className="ml-3 text-sm text-slate-400">Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl text-slate-400">
              <p>No items found for the selected filters.</p>
            </div>
          ) : (
            items.map((item) => (
              <ItemCard key={`${item.reportType}-${item.id}`} item={item} onViewDetails={setSelectedItem} />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <Pagination page={pagination.page || page} totalPages={pagination.totalPages || 1} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {selectedItem && <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </section>
  )
}