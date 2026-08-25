import {
  MdSearchOff,
  MdCheckCircle,
  MdCategory,
  MdColorLens,
  MdCalendarToday,
  MdLocationOn,
  MdDescription,
  MdVisibility,
  MdImage,
} from 'react-icons/md'

function getStatusClass(status, isDark) {
  switch (status) {
    case 'Lost':
      return isDark
        ? 'border-rose-400/30 bg-rose-500/15 text-rose-300'
        : 'border-rose-400/50 bg-rose-100 text-rose-700'
    case 'Found':
      return isDark
        ? 'border-sky-400/30 bg-sky-500/15 text-sky-300'
        : 'border-sky-400/50 bg-sky-100 text-sky-700'
    case 'Claimed':
      return isDark
        ? 'border-amber-400/30 bg-amber-500/15 text-amber-300'
        : 'border-amber-400/50 bg-amber-100 text-amber-700'
    case 'Returned':
      return isDark
        ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
        : 'border-emerald-400/50 bg-emerald-100 text-emerald-700'
    default:
      return isDark
        ? 'border-white/10 bg-white/5 text-slate-200'
        : 'border-gray-200 bg-gray-50 text-gray-600'
  }
}

function formatDate(value) {
  if (!value) return 'N/A'

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ItemCard({ item, onViewDetails, isDark = true }) {
  return (
    <article className={`overflow-hidden rounded-[1.75rem] border shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
      isDark
        ? 'border-white/10 bg-white/[0.04] shadow-slate-950/20'
        : 'border-gray-200 bg-white shadow-gray-200/50'
    }`}>
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        {/* Image */}
        <div className="h-72 w-full lg:h-full">
          {item.image ? (
            <img
              src={item.image}
              alt={item.itemName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className={`h-full w-full flex items-center justify-center ${
              isDark ? 'bg-slate-800/50' : 'bg-gray-100'
            }`}>
              <MdImage className={`text-6xl ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col p-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.18em] flex items-center gap-2 ${
                item.reportType === 'lost'
                  ? isDark ? 'text-rose-300' : 'text-rose-600'
                  : isDark ? 'text-sky-300' : 'text-sky-600'
              }`}>
                {item.reportType === 'lost' ? (
                  <MdSearchOff className="text-lg" />
                ) : (
                  <MdCheckCircle className="text-lg" />
                )}
                {item.reportType === 'lost' ? 'Lost Item' : 'Found Item'}
              </p>
              <h3 className={`mt-2 text-2xl font-bold md:text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {item.itemName}
              </h3>
            </div>
            <span className={`inline-flex rounded-full border px-4 py-1.5 text-sm font-bold ${getStatusClass(item.status, isDark)}`}>
              {item.status}
            </span>
          </div>

          {/* Details Grid */}
          <div className="mt-6 grid gap-4 text-base sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <MdCategory className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Category:</span>
              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{item.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdColorLens className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Color:</span>
              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{item.color}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdCalendarToday className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Date:</span>
              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{formatDate(item.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdLocationOn className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
              <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>Location:</span>
              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{item.location}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-5 flex items-start gap-2">
            <MdDescription className={`text-lg mt-1 flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <p className={`line-clamp-3 text-base leading-7 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {item.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-auto pt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:-translate-y-0.5 flex items-center gap-2"
            >
              <MdVisibility className="text-xl" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}