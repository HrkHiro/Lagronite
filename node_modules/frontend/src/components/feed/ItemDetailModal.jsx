import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { addFeedComment, fetchFeedItem, toggleFeedReaction } from '../../services/feedService.js'
import {
  MdClose,
  MdCategory,
  MdColorLens,
  MdLocationOn,
  MdCalendarToday,
  MdPerson,
  MdDescription,
  MdSend,
  MdChatBubble,
  MdThumbUp,
  MdFavorite,
  MdVisibility,
  MdError,
} from 'react-icons/md'

const REACTIONS = [
  { type: 'like', label: 'Like', icon: MdThumbUp },
  { type: 'helpful', label: 'Helpful', icon: MdFavorite },
  { type: 'interested', label: 'Interested', icon: MdVisibility },
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

function getStatusClass(status, isDark) {
  switch (status) {
    case 'Lost':
      return isDark
        ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
        : 'border-rose-400/30 bg-rose-50 text-rose-700'
    case 'Found':
      return isDark
        ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
        : 'border-cyan-400/30 bg-cyan-50 text-cyan-700'
    case 'Claimed':
      return isDark
        ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
        : 'border-amber-400/30 bg-amber-50 text-amber-700'
    case 'Returned':
      return isDark
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
        : 'border-emerald-400/30 bg-emerald-50 text-emerald-700'
    default:
      return isDark
        ? 'border-white/10 bg-white/[0.04] text-slate-300'
        : 'border-gray-200 bg-gray-50 text-gray-600'
  }
}

function DetailTile({ label, value, icon: Icon, isDark }) {
  return (
    <div className={`rounded-2xl border p-4 ${
      isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'
    }`}>
      <p className={`text-sm font-medium uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        {Icon && <Icon className="text-base" />}
        {label}
      </p>
      <p className={`mt-1.5 text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {value || 'N/A'}
      </p>
    </div>
  )
}

export function ItemDetailModal({ item, onClose, onUpdated, isDark = true }) {
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

  const modalContent = (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-6 py-8 backdrop-blur-xl ${
      isDark ? 'bg-slate-950/85' : 'bg-gray-900/85'
    }`}>
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-rise {
          animation: riseIn 0.3s ease-out both;
        }
      `}</style>

      <div className={`animate-rise w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border p-6 shadow-2xl backdrop-blur-xl md:p-8 ${
        isDark ? 'border-white/10 bg-slate-950/95 text-white' : 'border-gray-200 bg-white text-gray-900'
      }`}>
        {/* Header + Close */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              {activeItem.reportType === 'lost' ? 'Lost Item' : 'Found Item'}
            </p>
            <h3 className={`mt-2 text-2xl font-bold md:text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {activeItem.itemName}
            </h3>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${getStatusClass(activeItem.status, isDark)}`}>
                {activeItem.status}
              </span>
              {activeItem.postedByAdmin && (
                <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                  isDark
                    ? 'border-amber-400/20 bg-amber-500/10 text-amber-200'
                    : 'border-amber-400/30 bg-amber-50 text-amber-700'
                }`}>
                  Admin Post
                </span>
              )}
            </div>
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

        {/* Error */}
        {error && (
          <div className={`mt-5 rounded-2xl border px-5 py-4 flex items-start gap-3 ${
            isDark
              ? 'border-rose-400/20 bg-rose-500/10 text-rose-200'
              : 'border-rose-400/30 bg-rose-50 text-rose-800'
          }`}>
            <MdError className={`text-2xl flex-shrink-0 mt-0.5 ${isDark ? 'text-rose-300' : 'text-rose-600'}`} />
            <p className="text-base font-medium">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className={`mt-8 flex items-center justify-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            <div className={`h-10 w-10 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-emerald-400' : 'border-gray-200 border-t-emerald-500'}`} />
            <p className="ml-4 text-base">Loading details...</p>
          </div>
        ) : (
          <>
            {/* Image */}
            {activeItem.image && (
              <div className={`mt-6 overflow-hidden rounded-[1.5rem] border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <img
                  src={activeItem.image}
                  alt={activeItem.itemName}
                  className="w-full max-h-64 object-cover"
                />
              </div>
            )}

            {/* Details Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailTile label="Category" value={activeItem.category} icon={MdCategory} isDark={isDark} />
              <DetailTile label="Color" value={activeItem.color} icon={MdColorLens} isDark={isDark} />
              <DetailTile label="Location" value={activeItem.location} icon={MdLocationOn} isDark={isDark} />
              <DetailTile label="Date" value={formatDateTime(activeItem.date)} icon={MdCalendarToday} isDark={isDark} />
              <DetailTile label="Posted By" value={activeItem.postedBy?.name || 'Unknown'} icon={MdPerson} isDark={isDark} />
              <DetailTile label="Posted On" value={formatDateTime(activeItem.createdAt)} icon={MdCalendarToday} isDark={isDark} />
            </div>

            {/* Description */}
            <div className={`mt-5 rounded-2xl border p-5 ${
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'
            }`}>
              <p className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                <MdDescription className="text-lg" />
                Description
              </p>
              <p className={`mt-3 text-base leading-7 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {activeItem.description || 'No description provided.'}
              </p>
            </div>

            {/* Reactions */}
            <div className={`mt-5 rounded-2xl border p-5 ${
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'
            }`}>
              <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                React to this post
              </h4>
              <div className="mt-4 flex flex-wrap gap-3">
                {REACTIONS.map((reaction) => {
                  const Icon = reaction.icon
                  const isActive = activeItem.userReaction === reaction.type
                  const count = activeItem.reactions?.[reaction.type] || 0
                  return (
                    <button
                      key={reaction.type}
                      type="button"
                      disabled={reactingType === reaction.type}
                      onClick={() => handleReaction(reaction.type)}
                      className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-60 ${
                        isActive
                          ? isDark
                            ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                            : 'border-emerald-400/40 bg-emerald-50 text-emerald-700'
                          : isDark
                            ? 'border-white/10 bg-slate-900/60 text-slate-300 hover:border-emerald-400/20 hover:bg-white/10'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-400/40 hover:bg-emerald-50'
                      }`}
                    >
                      <Icon className="text-lg" />
                      {reaction.label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Comments */}
            <div className={`mt-5 rounded-2xl border p-5 ${
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'
            }`}>
              <h4 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <MdChatBubble className="text-xl" />
                Comments ({comments.length})
              </h4>

              {/* Comment Form */}
              <form className="mt-4 flex gap-3" onSubmit={handleCommentSubmit}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className={`flex-1 rounded-xl border px-5 py-3 text-base outline-none transition-all duration-200 placeholder:text-base ${
                    isDark
                      ? 'border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-emerald-400/50'
                      : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400/50'
                  }`}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white hover:bg-emerald-400 transition-all duration-200 disabled:opacity-60 flex items-center gap-2"
                >
                  <MdSend className="text-lg" />
                  Post
                </button>
              </form>

              {/* Comments List */}
              <ul className="mt-4 space-y-3">
                {comments.length === 0 ? (
                  <li className={`text-base py-4 text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    No comments yet. Be the first to comment!
                  </li>
                ) : (
                  comments.map((comment) => (
                    <li key={comment.id} className={`rounded-xl border p-4 ${
                      isDark ? 'border-white/10 bg-slate-900/60' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {comment.author?.name || 'Student'}
                        </p>
                        <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className={`mt-2 text-base leading-7 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        {comment.content}
                      </p>
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

  return createPortal(modalContent, document.body)
}