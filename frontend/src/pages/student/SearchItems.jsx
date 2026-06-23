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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-2xl shadow-black/40 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">Item Details</p>
            <h3 className="mt-2 text-2xl font-semibold">{item.itemName}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img src={item.image} alt={item.itemName} className="h-full w-full object-cover" />
          </div>

          <div className="space-y-4 text-sm text-slate-300">
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
    setLoading(true)
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
    fetchItems(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handlePageChange = (direction) => {
    setPage((currentPage) => {
      const nextPage = direction === 'next' ? Math.min(currentPage + 1, pagination.totalPages) : Math.max(currentPage - 1, 1)
      fetchItems(nextPage)
      return nextPage
    })
  }

  const filteredCountLabel = useMemo(() => `${pagination.totalItems} result${pagination.totalItems === 1 ? '' : 's'}`, [pagination.totalItems])

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20 md:p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">Search Items</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Find submitted lost and found items</h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
            Search your submitted reports by item name and refine results by category, color, date, and status.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
          <SearchBar value={filters.search} onChange={handleFilterChange} />
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
          <p>{filteredCountLabel}</p>
          <p>Showing page {page}</p>
        </div>

        {error ? <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
      </section>

      <section className="space-y-5">
        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300">
            No items found for the selected filters.
          </div>
        ) : (
          items.map((item) => <ItemCard key={`${item.reportType}-${item.id}`} item={item} onViewDetails={setSelectedItem} />)
        )}
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/20">
        <Pagination page={pagination.page || page} totalPages={pagination.totalPages || 1} onPageChange={handlePageChange} />
      </section>

      {selectedItem ? <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} /> : null}
    </div>
  )
}