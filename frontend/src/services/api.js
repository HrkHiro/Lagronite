export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AUTH_STORAGE_KEY = 'lagronite_auth'

function readStoredToken() {
	if (typeof window === 'undefined') {
		return null
	}

	const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY) || window.sessionStorage.getItem(AUTH_STORAGE_KEY)

	if (!storedAuth) {
		return null
	}

	try {
		const parsed = JSON.parse(storedAuth)
		return parsed?.token || null
	} catch {
		return null
	}
}

async function parseResponse(response) {
	const data = await response.json().catch(() => ({}))

	if (!response.ok) {
		const detail = data.error ? `: ${data.error}` : ''
		const error = new Error(`${data.message || 'Request failed'}${detail}`)
		error.status = response.status
		error.payload = data

		if (
			response.status === 401 &&
			['User no longer exists', 'Invalid or expired token'].includes(data.message)
			&& typeof window !== 'undefined'
		) {
			window.dispatchEvent(
				new CustomEvent('lagronite:auth-invalid', {
					detail: { message: data.message },
				}),
			)
		}

		throw error
	}

	return data
}

export async function request(path, options = {}) {
	const isAuthEndpoint = /^\/api\/auth\/(login|register|logout)$/.test(path)
	const token = !isAuthEndpoint ? readStoredToken() : null
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(options.headers || {}),
		},
		credentials: 'include',
		...options,
	})

	return parseResponse(response)
}