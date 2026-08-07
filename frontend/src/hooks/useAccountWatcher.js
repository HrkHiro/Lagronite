import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

function mapStatusMessage(message = '') {
  const normalized = String(message || '')

  if (/banned/i.test(normalized)) {
    return {
      type: 'banned',
      message: 'Your account has been banned.',
    }
  }

  if (/deleted/i.test(normalized)) {
    return {
      type: 'deleted',
      message: 'This account has been deleted by an administrator.',
    }
  }

  if (/suspended/i.test(normalized)) {
    return {
      type: 'suspended',
      message: normalized || 'Your account has been suspended.',
    }
  }

  return null
}

export function useAccountWatcher() {
  const { user, logout } = useAuth()
  const [blocked, setBlocked] = useState(null)

  useEffect(() => {
    if (!user?.id) return undefined

    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          const inferred = mapStatusMessage(data?.message || '')

          if (inferred) {
            setBlocked(inferred)
            logout()
            return
          }

          if (res.status === 401 || res.status === 403) {
            setBlocked({
              type: 'suspended',
              message: data?.message || 'Your account is currently locked. Please log in again.',
            })
            logout()
          }

          return
        }

        const status = data?.user?.status

        if (status === 'banned') {
          setBlocked({
            type: 'banned',
            message: 'Your account has been banned.',
          })
          logout()
          return
        }

        if (status === 'deleted') {
          setBlocked({
            type: 'deleted',
            message: 'This account has been deleted by an administrator.',
          })
          logout()
          return
        }

        if (status === 'suspended') {
          const until = data?.user?.suspendedUntil || null
          const payload = {
            type: 'suspended',
            message: until
              ? `Account suspended until ${new Date(until).toLocaleString()}`
              : 'Your account has been suspended.',
            until,
          }

          if (until && new Date(until) > new Date()) {
            setBlocked(payload)
            logout()
          } else {
            setBlocked(null)
          }
          return
        }

        setBlocked(null)
      } catch {
        // ignore network errors
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user, logout])

  return { blocked, setBlocked }
}