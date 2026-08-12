import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

export function useAccountWatcher() {
  const { user, logout } = useAuth()
  const [blocked, setBlocked] = useState(null)

  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
        })

        const data = await res.json()

        if (!res.ok) return

        const status = data.user.status

        if (status === 'banned') {
          setBlocked({
            type: 'banned',
            message: 'Your account has been banned.',
          })
          logout()
        }

        if (status === 'suspended') {
          setBlocked({
            type: 'suspended',
            message: `Account suspended until ${data.user.suspendedUntil}`,
          })
          logout()
        }
      } catch {
        // ignore network errors
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user, logout])

  return { blocked, setBlocked }
}