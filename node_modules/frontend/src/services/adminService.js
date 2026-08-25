import { request } from './api.js'

export function fetchAdminDashboard() {
  return request('/api/admin/dashboard')
}

export function fetchAdminUsers() {
  return request('/api/admin/users')
}

export function updateUserStatus(userId, action) {
  return request(`/api/admin/users/${userId}/${action}`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  })
}

export function deleteUser(userId) {
  return request(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  })
}