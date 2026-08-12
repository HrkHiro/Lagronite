import { MdSearch, MdClose } from 'react-icons/md'

export function SearchBar({ value, onChange, isDark = true }) {
  const handleClear = () => {
    // Create a synthetic event to match the onChange expected format
    const event = {
      target: {
        name: 'search',
        value: '',
      },
    }
    onChange(event)
  }

  return (
    <div className="space-y-2">
      <label className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
        <MdSearch className="text-lg" />
        Search by Item Name
      </label>
      
      <div className="relative">
        {/* Search Icon */}
        <MdSearch className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none ${
          isDark ? 'text-slate-400' : 'text-gray-400'
        }`} />
        
        {/* Input */}
        <input
          type="search"
          name="search"
          value={value}
          onChange={onChange}
          placeholder="Search item name..."
          className={`w-full rounded-2xl border pl-12 pr-12 py-4 text-base outline-none transition-all duration-200 placeholder:text-base ${
            isDark
              ? 'border-white/10 bg-slate-950 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
              : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
          }`}
        />
        
        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-xl transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label="Clear search"
          >
            <MdClose />
          </button>
        )}
      </div>

      {/* Search Hint */}
      {value && (
        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          Searching for: <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>"{value}"</span>
        </p>
      )}
    </div>
  )
}