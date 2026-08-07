import { request } from './api.js'

export function fetchAdminReports() {
  return request('/api/reports/admin')
}

export function fetchAdminClaimedReports() {
  return request('/api/reports/admin/claimed')
}

export function fetchReportChat(reportType, reportId) {
  return request(`/api/chats/${reportType}/${reportId}`)
}

export function sendReportMessage(reportType, reportId, text) {
  return request(`/api/chats/${reportType}/${reportId}`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export function updateReportStatus(reportType, reportId, payload) {
  return request(`/api/reports/admin/${reportType}/${reportId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteReport(reportType, reportId) {
  return request(`/api/reports/admin/${reportType}/${reportId}`, {
    method: 'DELETE',
  })
}

export function deleteMyReport(reportType, reportId) {
  return request(`/api/reports/${reportType}/${reportId}`, {
    method: 'DELETE',
  })
}

export function previewLostItemDraft(payload) {
  return request('/api/lost-items/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function previewFoundItemDraft(payload) {
  return request('/api/found-items/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
