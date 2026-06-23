import { useCallback, useEffect, useState } from 'react'

export function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // FETCH ADMIN REPORTS
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch('http://localhost:5000/api/reports/admin', {
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setReports(data.reports || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    Promise.resolve().then(() => {
      if (!ignore) {
        fetchReports()
      }
    })

    return () => {
      ignore = true
    }
  }, [fetchReports])

  // DELETE
  const handleDelete = async (item) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/reports/admin/${item.reportType}/${item.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      fetchReports()
    } catch (err) {
      alert(err.message)
    }
  }

  // MARK AS CLAIMED
  const handleMarkDone = async (item) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/reports/admin/${item.reportType}/${item.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            status: 'Claimed',
            itemName: item.itemName,
            category: item.category,
            color: item.color,
            description: item.description,
            image: item.image,
            date: item.date,
            location: item.location,
          }),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      fetchReports()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <p className="text-white">Loading...</p>
  if (error) return <p className="text-rose-400">{error}</p>

  return (
    <div className="space-y-6 text-white">

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-3xl font-semibold">Admin Reports</h2>
      </div>

      {reports.map((item) => (
        <div
          key={item.id}
          className="rounded-3xl border border-white/10 bg-white/5 p-5"
        >

          <h3 className="text-xl font-semibold">{item.itemName}</h3>

          <p className="text-sm text-slate-300">
            {item.category} • {item.color}
          </p>

          <p className="text-sm text-slate-400 mt-2">
            {item.description}
          </p>

          <p className="mt-2">
            Status: <span className="text-yellow-400">{item.status}</span>
          </p>

          <div className="mt-4 flex gap-3">

            <button
              onClick={() => handleMarkDone(item)}
              className="bg-emerald-500 text-black px-4 py-2 rounded-xl"
            >
              Mark as Claimed
            </button>

            <button
              onClick={() => handleDelete(item)}
              className="bg-rose-500 px-4 py-2 rounded-xl"
            >
              Delete
            </button>

          </div>
        </div>
      ))}
    </div>
  )
}
