import { useEffect, useState } from 'react'

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const res = await fetch('http://localhost:5000/api/admin/users', {
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setUsers(data.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

 useEffect(() => {
  let ignore = false

  const load = async () => {
    try {
      setLoading(true)

      const res = await fetch('http://localhost:5000/api/admin/users', {
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      if (!ignore) {
        setUsers(data.users || [])
      }
    } catch (err) {
      if (!ignore) setError(err.message)
    } finally {
      if (!ignore) setLoading(false)
    }
  }

  load()

  return () => {
    ignore = true
  }
}, [])

  const updateStatus = async (id, action) => {
    let url = ''

    if (action === 'ban') url = `/api/admin/users/${id}/ban`
    if (action === 'suspend') {
      const days = Number(prompt('Suspend for how many days?'))

if (!days || days <= 0) {
  alert('Invalid number of days')
  return
}
      const date = new Date()
      date.setDate(date.getDate() + Number(days))

      url = `/api/admin/users/${id}/suspend`

      await fetch(`http://localhost:5000${url}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ until: date }),
      })

      fetchUsers()
      return
    }

    if (action === 'activate') url = `/api/admin/users/${id}/activate`

    await fetch(`http://localhost:5000${url}`, {
      method: 'PATCH',
      credentials: 'include',
    })

    fetchUsers()
  }

  const deleteUser = async (id) => {
    await fetch(`http://localhost:5000/api/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    fetchUsers()
  }

  if (loading) return <p className="text-white">Loading users...</p>
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div className="text-white space-y-4">
      <h2 className="text-2xl font-bold">Students</h2>

      {users.map((u) => (
        <div key={u._id} className="p-4 border rounded-xl">
          <p>{u.name}</p>
          <p className="text-sm text-gray-400">{u.email}</p>
          <p className="text-sm">Status: {u.status}</p>

          <div className="flex gap-2 mt-2">
            <button onClick={() => updateStatus(u._id, 'suspend')}>
              Suspend
            </button>

            <button onClick={() => updateStatus(u._id, 'ban')}>
              Ban
            </button>

            <button onClick={() => updateStatus(u._id, 'activate')}>
              Activate
            </button>

            <button onClick={() => deleteUser(u._id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}