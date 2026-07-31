import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { MdBugReport, MdSend } from 'react-icons/md'

export function StudentQueries() {
  const { theme } = useOutletContext() || {}
  const isDark = theme === undefined ? true : theme === 'dark'

  const [form, setForm] = useState({ title: '', description: '', severity: 'medium', category: 'bug' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const auth = JSON.parse(localStorage.getItem('lagronite_auth') || '{}')
      const response = await fetch('http://localhost:5000/api/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token || ''}`,
        },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to submit query')
      setMessage('Your bug or enhancement report has been submitted successfully.')
      setForm({ title: '', description: '', severity: 'medium', category: 'bug' })
    } catch (err) {
      setMessage(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`relative overflow-hidden min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-10 sm:px-8 lg:px-10">
        <div className={`mb-8 overflow-hidden rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} backdrop-blur-xl shadow-lg`}>
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-2">
              <MdBugReport className={`text-2xl ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
                Report a System Issue
              </p>
            </div>
            <h2 className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Send a bug or enhancement query
            </h2>
            <p className={`mt-3 max-w-xl text-base leading-6 sm:text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Let developers know about broken flows, UX issues, or possible platform improvements.
            </p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 opacity-80" />
        </div>

        <form onSubmit={handleSubmit} className={`rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white'} p-8 shadow-xl`}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Title</span>
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className={`rounded-xl border px-4 py-3 outline-none ${isDark ? 'border-white/10 bg-slate-900/70 text-white' : 'border-gray-200 bg-white text-gray-900'}`}
                placeholder="Describe the issue briefly"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Category</span>
              <select
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className={`rounded-xl border px-4 py-3 outline-none ${isDark ? 'border-white/10 bg-slate-900/70 text-white' : 'border-gray-200 bg-white text-gray-900'}`}
              >
                <option value="bug">Bug</option>
                <option value="improvement">Improvement</option>
                <option value="feature">Feature Request</option>
              </select>
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Severity</span>
              <select
                value={form.severity}
                onChange={(event) => setForm((prev) => ({ ...prev, severity: event.target.value }))}
                className={`rounded-xl border px-4 py-3 outline-none ${isDark ? 'border-white/10 bg-slate-900/70 text-white' : 'border-gray-200 bg-white text-gray-900'}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className={`min-h-[180px] rounded-xl border px-4 py-3 outline-none ${isDark ? 'border-white/10 bg-slate-900/70 text-white' : 'border-gray-200 bg-white text-gray-900'}`}
                placeholder="Please explain the bug, what went wrong, and any steps to reproduce it."
                required
              />
            </label>
          </div>

          {message && (
            <p className={`mt-4 rounded-xl border px-4 py-3 text-sm ${isDark ? 'border-cyan-400/20 bg-cyan-500/10 text-cyan-100' : 'border-cyan-400/20 bg-cyan-50 text-cyan-700'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex items-center gap-3 rounded-xl bg-cyan-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-cyan-400"
          >
            <MdSend className="text-xl" />
            {isSubmitting ? 'Submitting...' : 'Send Query'}
          </button>
        </form>
      </div>
    </section>
  )
}
