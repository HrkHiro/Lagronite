import { useState } from 'react'
import { CampusFeed } from '../../components/feed/CampusFeed.jsx'

const tabs = [
  { id: 'all', label: 'All Items' },
  { id: 'lost', label: 'Lost' },
  { id: 'found', label: 'Found' },
]

const categories = [
  '',
  'ID Card',
  'Wallet',
  'Phone',
  'Bag',
  'Keys',
  'Documents',
  'Electronics',
  'Others',
]

export function StudentLostItems() {
  const [activeTab, setActiveTab] = useState('all')
  const [category, setCategory] = useState('')

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20 md:p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">
            Lost & Found
          </p>

          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Browse Campus Items
          </h2>

          <p className="max-w-3xl text-sm leading-6 text-slate-300">
            Browse and filter lost and found items posted across campus.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm text-slate-400">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
          >
            <option value="">All Categories</option>

            {categories
              .filter((category) => category)
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>
      </section>

      <CampusFeed
        key={`${activeTab}-${category}`}
        type={activeTab}
        category={category}
        limit={9}
        showPagination
      />
    </div>
  )
}