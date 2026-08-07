import {
  MdClose,
  MdChat,
  MdCalendarToday,
  MdLocationOn,
  MdDescription,
  MdInfo,
  MdImage,
  MdMessage,
  MdCategory,
  MdColorLens,
  MdDelete,
} from 'react-icons/md'

export function StudentReportDetailModal({ report, messageCount, onClose, onOpenChat, onDelete, isDark = true }) {
  if (!report) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl ${
      isDark ? 'bg-slate-950/80' : 'bg-gray-900/80'
    }`}>
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-rise {
          animation: riseIn 0.3s ease-out both;
        }
      `}</style>

      <div className={`animate-rise w-full max-w-3xl overflow-hidden rounded-[2rem] border shadow-2xl ${
        isDark
          ? 'border-white/10 bg-slate-950/95 shadow-black/50'
          : 'border-gray-200 bg-white shadow-gray-300/50'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between gap-4 border-b px-6 py-5 md:px-8 ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div>
            <p className={`text-sm font-semibold uppercase tracking-[0.24em] flex items-center gap-2 ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>
              <MdInfo className="text-lg" />
              Report Details
            </p>
            <h2 className={`mt-2 text-2xl font-bold md:text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {report.itemName}
            </h2>
            <p className={`mt-1.5 text-base flex items-center gap-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              <span className="flex items-center gap-1.5">
                <MdCategory className="text-base" />
                {report.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MdColorLens className="text-base" />
                {report.color}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-4 py-2.5 text-base font-medium transition-all duration-200 flex items-center gap-2 ${
              isDark
                ? 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:border-white/20'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <MdClose className="text-xl" />
            Close
          </button>
        </div>

        {/* Content */}
        <div className="grid gap-6 p-6 md:grid-cols-[280px_1fr] md:p-8">
          {/* Left Column - Image & Info */}
          <div className="space-y-5">
            {/* Image */}
            {report.image ? (
              <img
                src={report.image}
                alt={report.itemName}
                className={`h-80 w-full rounded-[1.5rem] object-cover border ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}
              />
            ) : (
              <div className={`h-80 w-full rounded-[1.5rem] flex items-center justify-center border ${
                isDark ? 'border-white/10 bg-slate-800/50' : 'border-gray-200 bg-gray-100'
              }`}>
                <MdImage className={`text-6xl ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
              </div>
            )}

            {/* Status Card */}
            <div className={`rounded-3xl border p-5 ${
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'
            }`}>
              <p className={`text-sm font-semibold uppercase tracking-[0.24em] flex items-center gap-2 ${
                isDark ? 'text-slate-400' : 'text-gray-500'
              }`}>
                <MdInfo className="text-base" />
                Status
              </p>
              <p className={`mt-2 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {report.status}
              </p>
              <div className={`mt-3 flex items-center gap-2 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                <MdMessage className="text-lg" />
                <span>Messages: <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{messageCount}</span></span>
              </div>
            </div>

            {/* Date Card */}
            <div className={`rounded-3xl border p-5 ${
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'
            }`}>
              <p className={`text-sm font-semibold uppercase tracking-[0.24em] flex items-center gap-2 ${
                isDark ? 'text-slate-400' : 'text-gray-500'
              }`}>
                <MdCalendarToday className="text-base" />
                Reported
              </p>
              <p className={`mt-2 text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Date(report.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Right Column - Details & Action */}
          <div className="space-y-6">
            {/* Details Card */}
            <div className={`rounded-[1.75rem] border p-6 ${
              isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-gray-50'
            }`}>
              <p className={`text-sm font-semibold uppercase tracking-[0.24em] flex items-center gap-2 mb-4 ${
                isDark ? 'text-slate-400' : 'text-gray-500'
              }`}>
                <MdDescription className="text-lg" />
                Details
              </p>
              <div className="space-y-4">
                <p className={`text-base leading-7 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {report.description}
                </p>
                
                <div className={`border-t pt-4 space-y-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <MdCalendarToday className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                    <span className={`text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Date:</span>
                    <span className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(report.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MdLocationOn className={`text-lg ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                    <span className={`text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Location:</span>
                    <span className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {report.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onOpenChat}
                className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-3"
              >
                <MdChat className="text-2xl" />
                Open Message Thread ({messageCount})
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="w-full rounded-2xl border border-rose-500 px-6 py-4 text-lg font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-500 hover:text-white hover:-translate-y-0.5 flex items-center justify-center gap-3"
              >
                <MdDelete className="text-2xl" />
                Delete Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}