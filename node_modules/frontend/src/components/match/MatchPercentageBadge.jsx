import { MdAutoAwesome, MdThumbUp, MdTrendingUp } from 'react-icons/md'

export function MatchPercentageBadge({ score, isDark = true }) {
  const roundedScore = Math.round(score)
  
  // Determine badge style and icon based on score
  let badgeClass = ''
  let Icon = MdTrendingUp
  let label = 'Match'

  if (roundedScore >= 75) {
    badgeClass = isDark
      ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
      : 'border-emerald-400/50 bg-emerald-100 text-emerald-700'
    Icon = MdAutoAwesome
    label = 'Strong Match'
  } else if (roundedScore >= 50) {
    badgeClass = isDark
      ? 'border-amber-400/30 bg-amber-500/15 text-amber-300'
      : 'border-amber-400/50 bg-amber-100 text-amber-700'
    Icon = MdThumbUp
    label = 'Good Match'
  } else {
    badgeClass = isDark
      ? 'border-sky-400/30 bg-sky-500/15 text-sky-300'
      : 'border-sky-400/50 bg-sky-100 text-sky-700'
    Icon = MdTrendingUp
    label = 'Possible Match'
  }

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all duration-300 hover:scale-105 ${badgeClass}`}>
      <Icon className="text-lg" />
      <span>{roundedScore}%</span>
      <span className="hidden sm:inline text-xs opacity-75 font-medium">
        {label}
      </span>
    </span>
  )
}