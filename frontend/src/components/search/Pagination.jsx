import {
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
} from 'react-icons/md'

export function Pagination({ page, totalPages, onPageChange, isDark = true }) {
  return (
    <div className={`flex flex-col gap-5 px-6 py-5 text-base md:flex-row md:items-center md:justify-between ${
      isDark ? 'text-slate-300' : 'text-gray-600'
    }`}>
      {/* Page Info */}
      <p className="font-medium">
        Page <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{page}</span> of{' '}
        <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalPages}</span>
      </p>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3">
        {/* First Page */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange('first')}
          className={`rounded-xl border px-3 py-3 text-base font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-1.5 ${
            isDark
              ? 'border-white/10 text-white hover:bg-white/5'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="First page"
        >
          <MdFirstPage className="text-xl" />
          <span className="hidden sm:inline">First</span>
        </button>

        {/* Previous */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange('prev')}
          className={`rounded-xl border px-4 py-3 text-base font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-2 ${
            isDark
              ? 'border-white/10 text-white hover:bg-white/5'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Previous page"
        >
          <MdChevronLeft className="text-xl" />
          Previous
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(pageNum => {
              // Show first, last, current, and neighbors
              return (
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - page) <= 1
              )
            })
            .map((pageNum, index, array) => (
              <div key={pageNum} className="flex items-center gap-1.5">
                {/* Ellipsis */}
                {index > 0 && pageNum - array[index - 1] > 1 && (
                  <span className={`px-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    ...
                  </span>
                )}
                
                {/* Page Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (pageNum < page) onPageChange('prev')
                    else if (pageNum > page) onPageChange('next')
                  }}
                  disabled={pageNum === page}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
                    pageNum === page
                      ? isDark
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-emerald-500 text-white shadow-lg'
                      : isDark
                        ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === page ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              </div>
            ))}
        </div>

        {/* Next */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange('next')}
          className={`rounded-xl border px-4 py-3 text-base font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-2 ${
            isDark
              ? 'border-white/10 text-white hover:bg-white/5'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Next page"
        >
          Next
          <MdChevronRight className="text-xl" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange('last')}
          className={`rounded-xl border px-3 py-3 text-base font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-1.5 ${
            isDark
              ? 'border-white/10 text-white hover:bg-white/5'
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Last page"
        >
          <span className="hidden sm:inline">Last</span>
          <MdLastPage className="text-xl" />
        </button>
      </div>
    </div>
  )
}