import { useState } from 'react'
import { CampusFeed } from '../../components/feed/CampusFeed.jsx'
import { MdGridOn, MdReportProblem, MdCheckCircle, MdCategory } from 'react-icons/md'

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

export function StudentLostItems() {
  const [activeTab, setActiveTab] = useState('all')
  const [category, setCategory] = useState('')

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
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
        .dot-grid {
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 60% at 30% 40%, black 0%, transparent 75%);
        }
      `}</style>

      <div className="dot-grid pointer-events-none absolute inset-0" />
      <div className="glow-a absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[160px]" />
      <div className="glow-b absolute -right-40 -bottom-40 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[160px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header card - smaller padding and fonts */}
        <div className="anim-rise mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="p-5 lg:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Lost & Found
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Browse Campus Items
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-400">
              Browse and filter lost and found items posted across campus.
            </p>

            {/* Tabs with icons - smaller, compact */}
            <div className="mt-4 flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
                        : 'border border-white/10 text-slate-300 hover:border-emerald-400/30 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="text-base" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Category filter with icon - compact */}
            <div className="mt-3 relative">
              <MdCategory className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900/60 border border-white/10 rounded-xl outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 appearance-none text-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-80" />
        </div>

        {/* Feed - smaller padding */}
        <div className="anim-rise overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)]">
          <div className="p-4 sm:p-5 lg:p-6">
            <CampusFeed
              key={`${activeTab}-${category}`}
              type={activeTab}
              category={category}
              limit={9}
              showPagination
            />
          </div>
        </div>
      </div>
    </section>
  )
}