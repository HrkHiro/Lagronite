function getStatusColor(status) {
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
      return 'border-white/10 bg-white/5 text-slate-300'
  }
}

function formatDate(value) {
  if (!value) return ''

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function getInitial(name) {
  return (name || 'User').trim().charAt(0).toUpperCase()
}

export function FeedItemCard({ item, onOpen }) {
  const authorName = item.postedBy?.name || 'Admin'

  return (
    <div
      onClick={() => onOpen(item)}
      className="
        group
        cursor-pointer
        overflow-hidden
        rounded-[1.75rem]
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-emerald-400/30
        hover:shadow-[0_0_30px_rgba(52,211,153,0.08)]
      "
    >

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-gradient-to-r
              from-emerald-400
              to-cyan-400
              text-sm
              font-bold
              text-slate-950
            "
          >
            {getInitial(authorName)}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              {authorName}
            </h3>

            <p className="text-xs text-slate-400">
              {formatDate(item.date)}
            </p>
          </div>

        </div>

        <span
          className={`
            rounded-full
            border
            px-3
            py-1
            text-[11px]
            font-medium
            ${getStatusColor(item.status)}
          `}
        >
          {item.status}
        </span>

      </div>

      {/* Image */}
      <div className="relative overflow-hidden bg-slate-950">

        <img
          src={item.image}
          alt={item.itemName}
          className="
            h-[320px]
            w-full
            object-cover
            transition
            duration-500
            group-hover:scale-105
          "
        />

      </div>

      {/* Content */}
      <div className="space-y-3 p-4">

        <h2 className="line-clamp-1 text-lg font-semibold text-white">
          {item.itemName}
        </h2>

        <p className="line-clamp-2 text-sm leading-6 text-slate-300">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2">

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {item.category}
          </span>

          {item.location && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              📍 {item.location}
            </span>
          )}

        </div>

        <div className="flex items-center gap-5 border-t border-white/10 pt-3 text-xs text-slate-400">

          <span>
            ❤️ {item.reactions?.total || 0}
          </span>

          <span>
            💬 {item.commentCount || 0}
          </span>

        </div>

      </div>

    </div>
  )
}