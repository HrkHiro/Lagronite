import { useEffect, useState } from 'react'
import { addFeedComment, fetchFeedItem, toggleFeedReaction } from '../../services/feedService.js'

const REACTIONS = [
  { type: 'like', label: 'Like' },
  { type: 'helpful', label: 'Helpful' },
  { type: 'interested', label: 'Interested' },
]

function formatDateTime(value) {
  if (!value) return 'N/A'

  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getStatusClass(status) {
  switch (status) {
    case 'Lost':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-300'
    case 'Found':
      return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
    case 'Claimed':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-300'
    case 'Returned':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
    default:
      return 'border-white/10 bg-white/[0.04] text-slate-300'
  }
}

function DetailTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-medium text-white">
        {value || 'N/A'}
      </p>
    </div>
  )
}

export function ItemDetailModal({ item, onClose, onUpdated }) {
  const [details, setDetails] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [reactingType, setReactingType] = useState('')
  const [error, setError] = useState('')

  const loadDetails = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await fetchFeedItem(item.reportType, item.id)
      setDetails(data.item)
      setComments(data.comments || [])
    } catch (err) {
      setError(err.message || 'Failed to load item details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    const fetchDetails = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await fetchFeedItem(item.reportType, item.id)

        if (!ignore) {
          setDetails(data.item)
          setComments(data.comments || [])
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load item details')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    Promise.resolve().then(fetchDetails)

    return () => {
      ignore = true
    }
  }, [item.id, item.reportType])

  const handleReaction = async (reactionType) => {
    setReactingType(reactionType)
    setError('')

    try {
      await toggleFeedReaction(item.reportType, item.id, reactionType)
      await loadDetails()
      onUpdated?.()
    } catch (err) {
      setError(err.message || 'Failed to update reaction')
    } finally {
      setReactingType('')
    }
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()

    const content = commentText.trim()
    if (!content) {
      return
    }

    setSubmittingComment(true)
    setError('')

    try {
      const data = await addFeedComment(item.reportType, item.id, content)
      setComments((current) => [data.comment, ...current])
      setCommentText('')
      setDetails((current) =>
        current
          ? {
              ...current,
              commentCount: (current.commentCount || 0) + 1,
            }
          : current,
      )
      onUpdated?.()
    } catch (err) {
      setError(err.message || 'Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const activeItem = details || item

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 py-6 backdrop-blur-xl">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
              {activeItem.reportType === 'lost' ? 'Lost Item Details' : 'Found Item Details'}
            </p>
            <h3 className="mt-2 text-2xl font-semibold md:text-3xl">
              {activeItem.itemName}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(activeItem.status)}`}>
                {activeItem.status}
              </span>
              {activeItem.postedByAdmin ? (
                <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
                  Posted by Admin
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-400/20 hover:bg-white/[0.08]"
          >
            Close
          </button>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-10 text-center text-slate-400 backdrop-blur-xl">
            Loading full details...
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-[0_20px_50px_-25px_rgba(16,185,129,0.25)] backdrop-blur-xl">
                <img
                  src={activeItem.image}
                  alt={activeItem.itemName}
                  className="max-h-[560px] w-full object-cover"
                />
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailTile label="Category" value={activeItem.category} />
                  <DetailTile label="Color" value={activeItem.color} />
                  <DetailTile label="Location" value={activeItem.location} />
                  <DetailTile label="Date" value={formatDateTime(activeItem.date)} />
                  <DetailTile label="Posted By" value={activeItem.postedBy?.name || 'Unknown'} />
                  <DetailTile label="Posted On" value={formatDateTime(activeItem.createdAt)} />
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                    Description
                  </h4>
                  <p className="mt-3 leading-7 text-slate-300">
                    {activeItem.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            <section className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <h4 className="text-lg font-semibold text-white">
                React to this post
              </h4>
              <p className="mt-1 text-sm text-slate-400">
                Tap a reaction to show interest or remove your reaction.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {REACTIONS.map((reaction) => {
                  const isActive = activeItem.userReaction === reaction.type
                  const count = activeItem.reactions?.[reaction.type] || 0

                  return (
                    <button
                      key={reaction.type}
                      type="button"
                      disabled={reactingType === reaction.type}
                      onClick={() => handleReaction(reaction.type)}
                      className={`rounded-2xl border px-4 py-2 text-sm transition disabled:opacity-60 ${
                        isActive
                          ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                          : 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-emerald-400/20 hover:bg-white/10'
                      }`}
                    >
                      {reaction.label} ({count})
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    Comments
                  </h4>
                  <p className="mt-1 text-sm text-slate-400">
                    {comments.length} comment{comments.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <form className="mt-4 space-y-3" onSubmit={handleCommentSubmit}>
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows="3"
                  placeholder="Write a comment about this item..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              <ul className="mt-5 space-y-3">
                {comments.length === 0 ? (
                  <li className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-400">
                    No comments yet. Be the first to comment.
                  </li>
                ) : (
                  comments.map((comment) => (
                    <li key={comment.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-white">
                          {comment.author?.name || 'Student'}
                        </p>
                        <span className="text-xs text-slate-500">
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {comment.content}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
