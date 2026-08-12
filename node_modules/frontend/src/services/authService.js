import { request } from './api.js'

function handleResponse(res) {
  // if backend already parsed JSON in request()
  if (res?.message) return res

  return res
}

function handleError(error) {
  const err = new Error(error?.message || 'Request failed')

  // 🔥 important: preserve HTTP status (403 banned/suspended)
  err.status = error?.status || 500
  throw err
}

export async function registerStudent(payload) {
  try {
    const res = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    return handleResponse(res)
  } catch (error) {
    handleError(error)
  }
}

export async function loginStudent(payload) {
  try {
    const res = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    return handleResponse(res)
  } catch (error) {
    handleError(error)
  }
}

export async function logoutUser() {
  try {
    const res = await request('/api/auth/logout', {
      method: 'POST',
    })

    return handleResponse(res)
  } catch (error) {
    handleError(error)
  }
}