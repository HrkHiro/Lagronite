const categoryOptions = ['All', 'Electronics', 'Books', 'Stationery', 'Clothing', 'Accessories', 'Documents', 'Other']
const colorOptions = ['All', 'Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Gray', 'Brown', 'Other']
const statusOptions = ['All', 'Lost', 'Found', 'Claimed', 'Returned']

function FilterSelect({ label, value, onChange, options, name }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-slate-300">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-950">
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function FilterPanel({ filters, onFilterChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <FilterSelect label="Category" name="category" value={filters.category} onChange={onFilterChange} options={categoryOptions} />
      <FilterSelect label="Color" name="color" value={filters.color} onChange={onFilterChange} options={colorOptions} />
      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Filter by Date</span>
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={onFilterChange}
          className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
        />
      </label>
      <FilterSelect label="Status" name="status" value={filters.status} onChange={onFilterChange} options={statusOptions} />
    </div>
  )
}