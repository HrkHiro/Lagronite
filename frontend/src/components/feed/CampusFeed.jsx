import { useCallback, useEffect, useState } from 'react'
import { fetchCampusFeed } from '../../services/feedService.js'
import { FeedItemCard } from './FeedItemCard.jsx'
import { ItemDetailModal } from './ItemDetailModal.jsx'

export function CampusFeed({
  type = 'all',
  category = '',
  postedBy = '',
  limit = 9,
  showPagination = true,
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
      })

      setItems(data.items || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setPage(data.pagination?.page || nextPage)
    } catch (err) {
      setError(err.message || 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }, [limit, type, category, postedBy])

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

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading campus feed...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl">
          <p className="text-lg font-medium text-white">
            No posts found
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Lost and found reports will appear here.
          </p>
        </div>
      ) : (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {items.map((item) => (
      <FeedItemCard
        key={`${item.reportType}-${item.id}`}
        item={item}
        onOpen={setSelectedItem}
      />
    ))}
  </div>
)}

      {showPagination && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">

          <button
            type="button"
            onClick={prevPage}
            disabled={page === 1}
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-sm
              text-slate-300
              transition
              hover:bg-white/10
              disabled:opacity-40
            "
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">
              Page
            </span>

            <span className="rounded-lg bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
              {page}
            </span>

            <span className="text-sm text-slate-500">
              of {totalPages}
            </span>
          </div>

          <button
            type="button"
            onClick={nextPage}
            disabled={page === totalPages}
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-sm
              text-slate-300
              transition
              hover:bg-white/10
              disabled:opacity-40
            "
          >
            Next
          </button>

        </div>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdated={() => loadFeed(page)}
        />
      )}

    </div>
  )
}