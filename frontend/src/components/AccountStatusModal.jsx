export function AccountStatusModal({ data, onClose }) {
  if (!data) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 text-white">
        <h2 className="text-xl font-bold">
          {data.type === 'banned' ? 'Account Banned' : 'Account Suspended'}
        </h2>

        <p className="mt-3 text-sm text-slate-300">
          {data.message}
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-red-500 py-2 text-white"
        >
          Logout / Refresh
        </button>
      </div>
    </div>
  )
}