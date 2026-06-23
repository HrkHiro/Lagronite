import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
      <h2 className="text-3xl font-semibold">Page not found</h2>
      <p className="mt-3 text-slate-300">The route you requested does not exist.</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-emerald-500 px-5 py-2.5 font-medium text-slate-950">
        Go home
      </Link>
    </div>
  )
}