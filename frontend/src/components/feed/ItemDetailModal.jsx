import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
    case 'Lost': return 'border-rose-500/20 bg-rose-500/10 text-rose-300'
    case 'Found': return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
    case 'Claimed': return 'border-amber-500/20 bg-amber-500/10 text-amber-300'
    case 'Returned': return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
    default: return 'border-white/10 bg-white/[0.04] text-slate-300'
  }
}

function DetailTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-white text-sm">{value || 'N/A'}</p>
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

  const fetchItemData = async () => {
    const data = await fetchFeedItem(item.reportType, item.id)
    return data
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const data = await fetchItemData()
        if (!ignore) {
          setDetails(data.item)
          setComments(data.comments || [])
          setError('')
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load item details')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [item.id, item.reportType]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReaction = async (reactionType) => {
    setReactingType(reactionType)
    setError('')
    try {
      await toggleFeedReaction(item.reportType, item.id, reactionType)
      const data = await fetchItemData()
      setDetails(data.item)
      setComments(data.comments || [])
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
    if (!content) return

    setSubmittingComment(true)
    setError('')
    try {
      const data = await addFeedComment(item.reportType, item.id, content)
      setComments((prev) => [data.comment, ...prev])
      setCommentText('')
      setDetails((prev) =>
        prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev
      )
      onUpdated?.()
    } catch (err) {
      setError(err.message || 'Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const activeItem = details || item

  // The modal content (same compact design)
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 py-6 backdrop-blur-xl">
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-rise {
          animation: riseIn 0.3s ease-out both;
        }
      `}</style>

      <div className="animate-rise w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950/95 p-5 text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Header + close */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              {activeItem.reportType === 'lost' ? 'Lost Item' : 'Found Item'}
            </p>
            <h3 className="mt-1 text-2xl font-bold text-white">{activeItem.itemName}</h3>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(activeItem.status)}`}>
                {activeItem.status}
              </span>
              {activeItem.postedByAdmin && (
                <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
                  Admin
                </span>
              )}
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

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 flex items-center justify-center py-10 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
          </div>
        ) : (
          <>
            {activeItem.image && (
              <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10">
                <img
                  src={activeItem.image}
                  alt={activeItem.itemName}
                  className="w-full max-h-56 object-cover"
                />
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <DetailTile label="Category" value={activeItem.category} />
              <DetailTile label="Color" value={activeItem.color} />
              <DetailTile label="Location" value={activeItem.location} />
              <DetailTile label="Date" value={formatDateTime(activeItem.date)} />
              <DetailTile label="Posted By" value={activeItem.postedBy?.name || 'Unknown'} />
              <DetailTile label="Posted On" value={formatDateTime(activeItem.createdAt)} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {activeItem.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h4 className="text-sm font-semibold text-white">React</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {REACTIONS.map((reaction) => {
                  const isActive = activeItem.userReaction === reaction.type
                  const count = activeItem.reactions?.[reaction.type] || 0
                  return (
                    <button
                      key={reaction.type}
                      type="button"
                      disabled={reactingType === reaction.type}
                      onClick={() => handleReaction(reaction.type)}
                      className={`rounded-xl border px-3 py-1.5 text-xs transition disabled:opacity-60 ${
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
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h4 className="text-sm font-semibold text-white">
                Comments ({comments.length})
              </h4>
              <form className="mt-3 flex gap-2" onSubmit={handleCommentSubmit}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  Post
                </button>
              </form>

              <ul className="mt-3 space-y-2">
                {comments.length === 0 ? (
                  <li className="text-xs text-slate-400 py-2">No comments yet.</li>
                ) : (
                  comments.map((comment) => (
                    <li key={comment.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white">{comment.author?.name || 'Student'}</p>
                        <span className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{comment.content}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // Render via portal to body – escapes any parent container with backdrop-filter
  return createPortal(modalContent, document.body)
}