import { request } from './api.js'

export function fetchAdminDashboard() {
  return request('/api/admin/dashboard')
}

export function fetchAdminExportData() {
  return request('/api/admin/dashboard/export-data')
}

export function fetchAdminUsers() {
  return request('/api/admin/users')
}

export function updateUserStatus(userId, action, body = {}) {
  return request(`/api/admin/users/${userId}/${action}`, {
    method: 'PATCH',
    body: JSON.stringify(body || {}),
  })
}

export function deleteUser(userId) {
  return request(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  })
}

export function fetchArchiveRecords() {
  return request('/api/admin/archive')
}

export function restoreArchiveRecord(recordId) {
  return request(`/api/admin/archive/${recordId}/restore`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function deleteArchiveRecord(recordId) {
  return request(`/api/admin/archive/${recordId}`, {
    method: 'DELETE',
  })
}

export function deleteArchiveRecords(recordIds) {
  return request('/api/admin/archive', {
    method: 'DELETE',
    body: JSON.stringify({ recordIds }),
  })
}