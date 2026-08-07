import {
  MdBlock,
  MdWarning,
  MdLogout,
  MdClose,
  MdInfo,
  MdTimer,
} from 'react-icons/md'

export function AccountStatusModal({ data, onClose, isDark = true }) {
  if (!data) return null

  const isBanned = data.type === 'banned'
  const isDeleted = data.type === 'deleted'

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl ${
      isDark ? 'bg-black/70' : 'bg-gray-900/70'
    }`}>
      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-rise {
          animation: riseIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .pulse-icon {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className={`animate-rise w-full max-w-lg rounded-2xl border p-8 shadow-2xl md:p-10 ${
        isBanned
          ? isDark
            ? 'border-rose-500/20 bg-slate-900 text-white'
            : 'border-rose-400/40 bg-white text-gray-900'
          : isDark
            ? 'border-amber-500/20 bg-slate-900 text-white'
            : 'border-amber-400/40 bg-white text-gray-900'
      }`}>
        {/* Icon */}
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-6 ${
          isBanned
            ? isDark ? 'bg-rose-500/10' : 'bg-rose-100'
            : isDark ? 'bg-amber-500/10' : 'bg-amber-100'
        }`}>
          {isBanned || isDeleted ? (
            <MdBlock className={`text-4xl pulse-icon ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
          ) : (
            <MdWarning className={`text-4xl pulse-icon ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          )}
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold text-center md:text-3xl ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {isBanned ? 'Account Banned' : isDeleted ? 'Account Deleted' : 'Account Suspended'}
        </h2>

        {/* Message */}
        <div className={`mt-5 rounded-xl border p-5 ${
          isBanned || isDeleted
            ? isDark ? 'border-rose-500/10 bg-rose-500/[0.05]' : 'border-rose-200 bg-rose-50'
            : isDark ? 'border-amber-500/10 bg-amber-500/[0.05]' : 'border-amber-200 bg-amber-50'
        }`}>
          <div className="flex items-start gap-3">
            <MdInfo className={`text-xl flex-shrink-0 mt-0.5 ${
              isBanned || isDeleted
                ? isDark ? 'text-rose-400' : 'text-rose-600'
                : isDark ? 'text-amber-400' : 'text-amber-600'
            }`} />
            <p className={`text-base leading-7 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {data.message}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {!isBanned && !isDeleted && data.until && (
          <div className={`mt-4 flex items-center gap-2 text-sm justify-center ${
            isDark ? 'text-slate-400' : 'text-gray-500'
          }`}>
            <MdTimer className="text-lg" />
            <span>
              Suspended until: <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {new Date(data.until).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={onClose}
            className={`w-full rounded-xl px-6 py-4 text-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-3 ${
              isBanned || isDeleted
                ? 'bg-rose-500 text-white hover:bg-rose-400 hover:shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                : 'bg-amber-500 text-white hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]'
            }`}
          >
            <MdLogout className="text-2xl" />
            Logout & Refresh
          </button>

          <button
            onClick={onClose}
            className={`w-full rounded-xl border px-6 py-3.5 text-base font-medium transition-all duration-200 ${
              isDark
                ? 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <MdClose className="text-xl inline mr-2" />
            Close
          </button>
        </div>
      </div>
    </div>
  )
}