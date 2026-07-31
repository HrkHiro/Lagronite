import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { MdBugReport, MdSearchOff, MdError, MdCheckCircle, MdPendingActions } from 'react-icons/md'

export function AdminQueries() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { theme } = useOutletContext() || {}

  const isDark = theme === undefined ? true : theme === 'dark'

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetch('http://localhost:5000/api/queries', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('lagronite_auth') ? JSON.parse(localStorage.getItem('lagronite_auth')).token : ''}`,
          },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Failed to load queries')
        setQueries(data.queries || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchQueries()
  }, [])

  return (
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <div className={`mb-8 overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg`}>
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-2">
              <MdBugReport className={`text-2xl ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                Queries
              </p>
            </div>
            <h2 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              System bug & improvement queue
            </h2>
            <p className={`mt-3 max-w-xl text-base leading-6 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Monitor student-submitted issues, bugs, and enhancement requests from one place for dev follow-up.
            </p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 opacity-80" />
        </div>

        {loading ? (
          <div className={`flex h-48 items-center justify-center rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl`}>
            <div className={`h-10 w-10 animate-spin rounded-full border-3 ${isDark ? 'border-white/10 border-t-cyan-400' : 'border-gray-200 border-t-cyan-500'}`} />
            <p className={`ml-4 text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Loading queries...</p>
          </div>
        ) : error ? (
          <div className={`rounded-xl border ${isDark ? 'border-rose-500/20 bg-rose-500/10 text-rose-100' : 'border-rose-400/30 bg-rose-50 text-rose-800'} p-8 backdrop-blur-xl`}>
            <div className="flex items-center gap-3 mb-3">
              <MdError className="text-3xl" />
              <h3 className="text-xl font-bold">Error</h3>
            </div>
            <p className="text-base">{error}</p>
          </div>
        ) : queries.length === 0 ? (
          <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-12 text-center backdrop-blur-xl`}>
            <MdSearchOff className={`text-6xl mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No system queries found.</p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {queries.map((query) => (
              <article key={query.id} className={`rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-6 shadow-lg`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-500">{query.category || 'bug'}</p>
                    <h3 className={`mt-2 text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{query.title}</h3>
                  </div>
                  <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                    {query.status || 'Open'}
                  </span>
                </div>
                <p className={`mt-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{query.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-gray-50'} p-4`}>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Severity</p>
                    <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{query.severity || 'medium'}</p>
                  </div>
                  <div className={`rounded-xl border ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-gray-200 bg-gray-50'} p-4`}>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Submitted</p>
                    <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(query.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-cyan-500">
                  {query.status === 'Resolved' ? <MdCheckCircle className="text-xl" /> : <MdPendingActions className="text-xl" />}
                  <span className="text-sm font-medium">Reporter: {query.reporter?.name || 'Unknown'}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
