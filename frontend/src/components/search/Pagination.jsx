export function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex flex-col gap-4 border-t border-white/10 px-5 py-4 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
      <p>
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange('prev')}
          className="rounded-full border border-white/10 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange('next')}
          className="rounded-full border border-white/10 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}