import { request } from './api.js'

export function fetchCampusFeed(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return request(`/api/feed${query ? `?${query}` : ''}`)
}

export function fetchFeedItem(reportType, reportId) {
  return request(`/api/feed/${reportType}/${reportId}`)
}

export function addFeedComment(reportType, reportId, content) {
  return request(`/api/feed/${reportType}/${reportId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function toggleFeedReaction(reportType, reportId, reactionType) {
  return request(`/api/feed/${reportType}/${reportId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ reactionType }),
  })
}
