import { useCallback, useEffect, useState } from 'react'
import { fetchCampusFeed } from '../../services/feedService.js'
import { FeedItemCard } from './FeedItemCard.jsx'
import { ItemDetailModal } from './ItemDetailModal.jsx'
import {
  MdSearchOff,
  MdChevronLeft,
  MdChevronRight,
  MdError,
} from 'react-icons/md'

export function CampusFeed({
  type = 'all',
  category = '',
  postedBy = '',
  search = '',
  limit = 9,
  showPagination = true,
  isDark = true,
  onStats = null,
}) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  const loadFeed = useCallback(async (nextPage = 1) => {
    setLoading(true)
    setError('')

    try {
      const data = await fetchCampusFeed({
        page: nextPage,
        limit,
        ...(type !== 'all' ? { type } : {}),
        ...(category ? { category } : {}),
        ...(postedBy ? { postedBy } : {}),
        ...(search ? { search } : {}),
      })

      setItems(data.items || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setPage(data.pagination?.page || nextPage)

      if (typeof onStats === 'function') {
        onStats(data.stats || {})
      }
    } catch (err) {
      setError(err.message || 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }, [limit, type, category, postedBy, search, onStats])

  useEffect(() => {
    let ignore = false

    Promise.resolve().then(() => {
      if (!ignore) {
        loadFeed(1)
      }
    })

    return () => {
      ignore = true
    }
  }, [loadFeed])

  const nextPage = () => {
    if (page < totalPages) {
      loadFeed(page + 1)
    }
  }

  const prevPage = () => {
    if (page > 1) {
      loadFeed(page - 1)
    }
  }

  return (
    <div className="w-full">
      {/* Error Message */}
      {error && (
        <div className={`rounded-2xl border p-5 flex items-start gap-3 ${
          isDark
            ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
            : 'border-rose-400/30 bg-rose-50 text-rose-800'
        }`}>
          <MdError className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`} />
          <p className="text-base font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className={`rounded-[1.75rem] border p-12 text-center backdrop-blur-xl ${
          isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'
        }`}>
          <div className={`mx-auto h-12 w-12 animate-spin rounded-full border-3 ${
            isDark ? 'border-white/10 border-t-emerald-400' : 'border-gray-200 border-t-emerald-500'
          }`} />
          <p className={`mt-5 text-lg ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Loading campus feed...
          </p>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className={`rounded-[1.75rem] border p-12 text-center backdrop-blur-xl ${
          isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'
        }`}>
          <MdSearchOff className={`text-6xl mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No posts found
          </p>
          <p className={`mt-2 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Lost and found reports will appear here.
          </p>
        </div>
      ) : (
        /* Items Grid */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <FeedItemCard
              key={`${item.reportType}-${item.id}`}
              item={item}
              onOpen={setSelectedItem}
              isDark={isDark}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className={`mt-8 flex items-center justify-between rounded-[1.5rem] border px-6 py-5 backdrop-blur-xl ${
          isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'
        }`}>
          {/* Previous Button */}
          <button
            type="button"
            onClick={prevPage}
            disabled={page === 1}
            className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-base font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              isDark
                ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MdChevronLeft className="text-xl" />
            Previous
          </button>

          {/* Page Info */}
          <div className="flex items-center gap-3">
            <span className={`text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Page
            </span>
            <span className={`rounded-lg px-4 py-2 text-base font-bold ${
              isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {page}
            </span>
            <span className={`text-base ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              of {totalPages}
            </span>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={nextPage}
            disabled={page === totalPages}
            className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-base font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              isDark
                ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
            <MdChevronRight className="text-xl" />
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdated={() => loadFeed(page)}
          isDark={isDark}
        />
      )}
    </div>
  )
}