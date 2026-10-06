const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function getApiUrl(path) {
  return `${API_URL}${path}`
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
    credentials: 'include',
  })
  let data = null
  try { data = await response.json() } catch {}

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed.')
    error.status = response.status
    throw error
  }

  return data
}