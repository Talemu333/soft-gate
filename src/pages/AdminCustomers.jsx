import { useMemo } from 'react'
import { AdminNav } from './AdminProducts'
import { formatPrice } from '../data/products'

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback } }

export default function AdminCustomers() {
  const orders = read('softgate-orders', [])
  const customers = useMemo(() => {
    const map = new Map()
    orders.forEach((order) => { const customer = order.customer || {}; const key = customer.email || customer.phone || customer.name || order.id; const current = map.get(key) || { name: customer.name || 'Customer', email: customer.email || '—', phone: customer.phone || '—', orders: 0, spend: 0, lastOrder: order.date }; current.orders += 1; current.spend += Number(order.total || 0); current.lastOrder = order.date || current.lastOrder; map.set(key, current) })
    const saved = read('softgate-customer', null)
    if (saved && !map.has(saved.email)) map.set(saved.email, { name: saved.name || 'Customer', email: saved.email || '—', phone: '—', orders: 0, spend: 0, lastOrder: 'No orders yet' })
    return [...map.values()].sort((a, b) => b.spend - a.spend)
  }, [orders])

  return <main className="admin-page"><div className="admin-shell"><AdminNav active="customers"/><section className="admin-main"><header className="admin-header"><div><span className="eyebrow">CUSTOMER MANAGEMENT</span><h1>Customers</h1><p>Understand customer activity and purchase history.</p></div></header><div className="admin-kpis"><article><small>Total customers</small><strong>{customers.length}</strong><span>Known customer profiles</span></article><article><small>Customers with orders</small><strong>{customers.filter((c) => c.orders > 0).length}</strong><span>Active purchasers</span></article><article><small>Customer revenue</small><strong>{formatPrice(customers.reduce((sum, c) => sum + c.spend, 0))}</strong><span>Recorded order value</span></article></div><section className="admin-panel"><div className="admin-panel-head"><div><span className="eyebrow">CUSTOMER LIST</span><h2>Customer records</h2></div><span>{customers.length} records</span></div>{customers.length ? <div className="customer-table">{customers.map((customer, index) => <div className="customer-row" key={`${customer.email}-${index}`}><div className="customer-avatar">{customer.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</div><div><b>{customer.name}</b><small>{customer.email}</small></div><span>{customer.phone}</span><span>{customer.orders} order{customer.orders !== 1 ? 's' : ''}</span><strong>{formatPrice(customer.spend)}</strong><small>{customer.lastOrder}</small></div>)}</div> : <div className="admin-empty"><h2>No customers yet</h2><p>Customers will appear after they create an account or place an order.</p></div>}</section><div className="admin-demo-note">Customer records are derived from local browser data for this frontend stage. Production customer profiles, privacy controls and access permissions will be handled by the secure backend.</div></section></div></main>
}
