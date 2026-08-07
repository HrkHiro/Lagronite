import { useState } from 'react'
import { CampusFeed } from '../../components/feed/CampusFeed.jsx'
import { MdGridOn, MdReportProblem, MdCheckCircle, MdCategory, MdSearch, MdInsertChart, MdAssignmentReturn } from 'react-icons/md'
import { useOutletContext } from 'react-router-dom'

const tabs = [
  { id: 'all', label: 'All Items', icon: MdGridOn },
  { id: 'lost', label: 'Lost', icon: MdReportProblem },
  { id: 'found', label: 'Found', icon: MdCheckCircle },
]

const categories = [
  'ID Card',
  'Wallet',
  'Phone',
  'Bag',
  'Keys',
  'Documents',
  'Electronics',
  'Others',
]

function KpiCard({ label, value, icon: Icon, color, isDark }) {
  return (
    <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-6 backdrop-blur-xl shadow-lg`}>
      <div className="flex items-center gap-3">
        <Icon className={`text-2xl ${color}`} />
        <p className={`text-sm font-medium uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
      </div>
      <h3 className={`mt-2 text-3xl font-bold sm:text-4xl ${color}`}>{value}</h3>
    </div>
  )
}

export function StudentLostItems() {
  const [activeTab, setActiveTab] = useState('all')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ totalItems: 0, lostCount: 0, foundCount: 0, returnedCount: 0 })
  const { theme } = useOutletContext() // Get theme from layout

  const isDark = theme === 'dark'

  return (
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-a { animation: glowPulse 8s ease-in-out infinite; }
        .glow-b { animation: glowPulse 9s ease-in-out infinite 1.5s; }
        .anim-rise { animation: riseIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .dot-grid-dark {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
        .dot-grid-light {
          background-image: radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      {/* Background decorations */}
      <div className={`pointer-events-none absolute inset-0 ${isDark ? 'dot-grid-dark' : 'dot-grid-light'}`} />
      <div className={`glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.15]'} blur-[160px]`} />
      <div className={`glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full ${isDark ? 'bg-cyan-500/[0.06]' : 'bg-cyan-500/[0.15]'} blur-[160px]`} />

      {/* Main Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        {/* Header card - INCREASED padding and fonts */}
        <div className={`anim-rise mb-8 overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg`}>
          <div className="p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Lost & Found
            </p>
            <h1 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Browse Campus Items
            </h1>
            <p className={`mt-3 max-w-xl text-base leading-6 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Browse and filter lost and found items posted across campus.
            </p>

            {/* Tabs with icons - LARGER and more visible */}
            <div className="mt-6 flex flex-wrap gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 rounded-full px-6 py-3 text-base font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:bg-emerald-400'
                        : isDark
                          ? 'border border-white/10 text-slate-300 hover:border-emerald-400/50 hover:bg-white/5'
                          : 'border border-gray-200 text-gray-600 hover:border-emerald-400/50 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="text-2xl" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <MdSearch className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search items, colors, locations..."
                  className={`w-full pl-12 pr-4 py-3.5 text-base rounded-xl border outline-none transition-all duration-200 placeholder:text-base ${
                    isDark
                      ? 'bg-slate-900/60 border-white/10 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 placeholder:text-slate-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 placeholder:text-gray-400'
                  }`}
                />
              </div>

              <div className="relative max-w-md md:w-80">
                <MdCategory className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 text-base rounded-xl border outline-none transition-all duration-200 appearance-none cursor-pointer ${
                    isDark
                      ? 'bg-slate-900/60 border-white/10 text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>
                    All Categories
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className={isDark ? 'bg-slate-900' : 'bg-white'}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        <div className="grid gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total Reports" value={stats.totalItems || 0} icon={MdInsertChart} color={isDark ? 'text-white' : 'text-gray-900'} isDark={isDark} />
          <KpiCard label="Lost Items" value={stats.lostCount || 0} icon={MdReportProblem} color={isDark ? 'text-rose-300' : 'text-rose-600'} isDark={isDark} />
          <KpiCard label="Found Items" value={stats.foundCount || 0} icon={MdCheckCircle} color={isDark ? 'text-sky-300' : 'text-sky-600'} isDark={isDark} />
          <KpiCard label="Returned" value={stats.returnedCount || 0} icon={MdAssignmentReturn} color={isDark ? 'text-emerald-300' : 'text-emerald-600'} isDark={isDark} />
        </div>

        {/* Feed - INCREASED padding */}
        <div className={`anim-rise overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-xl`}>
          <div className="p-8 sm:p-10 lg:p-12">
            <CampusFeed
              key={`${activeTab}-${category}-${search}`}
              type={activeTab}
              category={category}
              search={search}
              limit={9}
              showPagination
              isDark={isDark}
              onStats={setStats}
            />
          </div>
        </div>
      </div>
    </section>
  )
}