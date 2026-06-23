import { request } from './api.js'

export function fetchAdminDashboard() {
  return request('/api/admin/dashboard')
}