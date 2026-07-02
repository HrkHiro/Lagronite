export function MatchPercentageBadge({ score }) {
  const badgeClass =
    score >= 75
      ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
      : score >= 50
        ? 'border-amber-400/20 bg-amber-500/10 text-amber-200'
        : 'border-sky-400/20 bg-sky-500/10 text-sky-200'

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>
      {Math.round(score)}% Match
    </span>
  )
}