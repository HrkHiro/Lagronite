import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AUTH_STORAGE_KEY = 'lagronite_auth'

const AuthContext = createContext(null)

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return null
  }

  const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY) || window.sessionStorage.getItem(AUTH_STORAGE_KEY)

  if (!storedAuth) {
    return null
  }

  try {
    return JSON.parse(storedAuth)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => ({ user: readStoredAuth(), rememberMe: true }))
  const { user, rememberMe } = authState

  // Sync auth state to storage – include rememberMe in dependencies
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (user) {
      const targetStorage = rememberMe ? window.localStorage : window.sessionStorage
      const otherStorage = rememberMe ? window.sessionStorage : window.localStorage

      targetStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      otherStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
  }, [user, rememberMe])

  // Listen for auth‑invalid events
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const handleAuthInvalid = () => {
      setAuthState({ user: null, rememberMe: true })
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    window.addEventListener('lagronite:auth-invalid', handleAuthInvalid)

    return () => {
      window.removeEventListener('lagronite:auth-invalid', handleAuthInvalid)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      token: user?.token ?? null,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user?.token),
      login: (authData, keepLoggedIn = false) => {
        setAuthState({ user: authData, rememberMe: keepLoggedIn })
      },
      logout: () => setAuthState({ user: null, rememberMe: true }),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Disable Fast Refresh rule for this file because it's a context + hook pattern
// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider')
  }

  return context
}