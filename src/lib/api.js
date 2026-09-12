const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('softgate-token')
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401) localStorage.removeItem('softgate-token')
    throw new Error(data.message || 'Request failed.')
  }
  return data
}

export const api = {
  getProducts: (params = {}) => { const query = new URLSearchParams(); if (params.category && params.category !== 'All') query.set('category', params.category); if (params.search) query.set('search', params.search); return request(`/products${query.toString() ? `?${query}` : ''}`) },
  getProduct: (id) => request(`/products/${id}`),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders: () => request('/orders/mine'),
  getWishlist: () => request('/wishlist'),
  toggleWishlist: (productId) => request(`/wishlist/${productId}`, { method: 'POST' }),
  removeWishlist: (productId) => request(`/wishlist/${productId}`, { method: 'DELETE' }),
  sendContact: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  adminDashboard: () => request('/admin/dashboard'),
  adminCustomers: () => request('/admin/customers'),
  adminProducts: () => request('/products'),
  createProduct: (payload) => request('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  adminOrders: () => request('/orders'),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}
