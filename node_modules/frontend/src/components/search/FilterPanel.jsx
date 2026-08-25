import {
  MdCategory,
  MdColorLens,
  MdCalendarToday,
  MdInfo,
} from 'react-icons/md'

const categoryOptions = ['All', 'Electronics', 'Books', 'Stationery', 'Clothing', 'Accessories', 'Documents', 'Other']
const colorOptions = ['All', 'Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown', 'Other']
const statusOptions = ['All', 'Lost', 'Found', 'Claimed', 'Returned']

function FilterSelect({ label, value, onChange, options, name, icon: Icon, isDark }) {
  return (
    <label className="block space-y-2">
      <span className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
        {Icon && <Icon className="text-lg" />}
        {label}
      </span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-2xl border px-5 py-3.5 text-base outline-none transition-all duration-200 appearance-none cursor-pointer ${
          isDark
            ? 'border-white/10 bg-slate-950 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
            : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem',
        }}
      >
        {options.map((option) => (
          <option key={option} value={option} className={isDark ? 'bg-slate-950' : 'bg-white'}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function FilterPanel({ filters, onFilterChange, isDark = true }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {/* Category Filter */}
      <FilterSelect
        label="Category"
        name="category"
        value={filters.category}
        onChange={onFilterChange}
        options={categoryOptions}
        icon={MdCategory}
        isDark={isDark}
      />

      {/* Color Filter */}
      <FilterSelect
        label="Color"
        name="color"
        value={filters.color}
        onChange={onFilterChange}
        options={colorOptions}
        icon={MdColorLens}
        isDark={isDark}
      />

      {/* Date Filter */}
      <label className="block space-y-2">
        <span className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
          <MdCalendarToday className="text-lg" />
          Filter by Date
        </span>
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={onFilterChange}
          className={`w-full rounded-2xl border px-5 py-3.5 text-base outline-none transition-all duration-200 ${
            isDark
              ? 'border-white/10 bg-slate-950 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 [color-scheme:dark]'
              : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
          }`}
        />
      </label>

      {/* Status Filter */}
      <FilterSelect
        label="Status"
        name="status"
        value={filters.status}
        onChange={onFilterChange}
        options={statusOptions}
        icon={MdInfo}
        isDark={isDark}
      />
    </div>
  )
}