export function SearchBar({ value, onChange }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-slate-300">Search by Item Name</span>
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search item name..."
        className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
      />
    </label>
  )
}