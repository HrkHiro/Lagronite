import { request } from './api.js'

export async function updateCurrentUser(payload) {
  const res = await request('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return res
}
