import {
  MdLocationOn,
  MdFavorite,
  MdChatBubble,
  MdCategory,
  MdPerson,
} from 'react-icons/md'

function getStatusColor(status, isDark) {
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
        ? 'border-white/10 bg-white/5 text-slate-300'
        : 'border-gray-200 bg-gray-50 text-gray-600'
  }
}

function formatDate(value) {
  if (!value) return ''

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitial(name) {
  return (name || 'User').trim().charAt(0).toUpperCase()
}

export function FeedItemCard({ item, onOpen, isDark = true }) {
  const authorName = item.postedBy?.name || 'Admin'

  return (
    <div
      onClick={() => onOpen(item)}
      className={`
        group
        cursor-pointer
        overflow-hidden
        rounded-[1.75rem]
        border
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        ${
          isDark
            ? 'border-white/10 bg-white/[0.04] hover:border-emerald-400/30 hover:shadow-[0_0_30px_rgba(52,211,153,0.08)]'
            : 'border-gray-200 bg-white hover:border-emerald-400/50 hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-base font-bold text-white">
            {getInitial(authorName)}
          </div>

          <div>
            <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {authorName}
            </h3>
            <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {formatDate(item.date)}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`
            rounded-full
            border
            px-4
            py-1.5
            text-sm
            font-semibold
            ${getStatusColor(item.status, isDark)}
          `}
        >
          {item.status}
        </span>
      </div>

      {/* Image */}
      <div className={`relative overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-gray-100'}`}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.itemName}
            className="h-[320px] w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-[320px] items-center justify-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            <MdPerson className="text-6xl opacity-30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        {/* Item Name */}
        <h2 className={`line-clamp-1 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {item.itemName}
        </h2>

        {/* Description */}
        <p className={`line-clamp-2 text-base leading-7 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium ${
            isDark
              ? 'border-white/10 bg-white/5 text-slate-300'
              : 'border-gray-200 bg-gray-50 text-gray-600'
          }`}>
            <MdCategory className="text-base" />
            {item.category}
          </span>

          {item.location && (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium ${
              isDark
                ? 'border-white/10 bg-white/5 text-slate-300'
                : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}>
              <MdLocationOn className="text-base" />
              {item.location}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className={`flex items-center gap-6 border-t pt-4 text-sm ${
          isDark ? 'border-white/10 text-slate-400' : 'border-gray-200 text-gray-500'
        }`}>
          <span className="flex items-center gap-2">
            <MdFavorite className={`text-lg ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
            <span className="font-medium">{item.reactions?.total || 0}</span>
          </span>

          <span className="flex items-center gap-2">
            <MdChatBubble className={`text-lg ${isDark ? 'text-cyan-400' : 'text-cyan-500'}`} />
            <span className="font-medium">{item.commentCount || 0}</span>
          </span>
        </div>
      </div>
    </div>
  )
}