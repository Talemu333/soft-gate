const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function getApiUrl(path) {
  return `${API_URL}${path}`
}

export function getToken() {
  return localStorage.getItem('softgate-token')
}

export function setToken(token) {
  if (token) localStorage.setItem('softgate-token', token)
  else localStorage.removeItem('softgate-token')
}

export async function api(path, options = {}) {
  const token = getToken()
  const headers = new Headers(options.headers || {})
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(getApiUrl(path), { ...options, headers })
  let data = null
  try { data = await response.json() } catch {}

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed.')
    error.status = response.status
    throw error
  }

  return data
}
