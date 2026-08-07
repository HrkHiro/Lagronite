import { request } from './api.js'

export function fetchSystemQueries() {
  return request('/api/queries')
}

export function submitSystemQuery(payload) {
  return request('/api/queries', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateSystemQueryStatus(queryId, status) {
  return request(`/api/queries/${queryId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function deleteSystemQuery(queryId) {
  return request(`/api/queries/${queryId}`, {
    method: 'DELETE',
  })
}
