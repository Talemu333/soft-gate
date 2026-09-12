import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { AdminNav } from './AdminProducts'
import { formatPrice } from '../data/products'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.adminCustomers().then((data) => setCustomers(data.customers || [])).catch((err) => setError(err.message || 'Unable to load customers.'))
  }, [])

  return <main className="admin-page"><div className="admin-shell"><AdminNav active="customers"/><section className="admin-main"><header className="admin-header"><div><span className="eyebrow">CUSTOMER MANAGEMENT</span><h1>Customers</h1><p>Understand customer activity and purchase history.</p></div></header>{error&&<p className="auth-message" role="alert">{error}</p>}<div className="admin-kpis"><article><small>Total customers</small><strong>{customers.length}</strong><span>Registered customer profiles</span></article><article><small>Customers with orders</small><strong>{customers.filter((c) => Number(c.orders) > 0).length}</strong><span>Active purchasers</span></article><article><small>Customer revenue</small><strong>{formatPrice(customers.reduce((sum, c) => sum + Number(c.spend || 0), 0))}</strong><span>Recorded order value</span></article></div><section className="admin-panel"><div className="admin-panel-head"><div><span className="eyebrow">CUSTOMER LIST</span><h2>Customer records</h2></div><span>{customers.length} records</span></div>{customers.length ? <div className="customer-table">{customers.map((customer, index) => <div className="customer-row" key={`${customer.email}-${index}`}><div className="customer-avatar">{customer.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</div><div><b>{customer.name}</b><small>{customer.email}</small></div><span>{customer.phone || '—'}</span><span>{Number(customer.orders)} order{Number(customer.orders) !== 1 ? 's' : ''}</span><strong>{formatPrice(Number(customer.spend || 0))}</strong><small>{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString('en-NG') : 'No orders yet'}</small></div>)}</div> : <div className="admin-empty"><h2>No customers yet</h2><p>Customers will appear after they create an account.</p></div>}</section><div className="admin-demo-note">Customer profiles and purchase totals are now loaded from the backend database.</div></section></div></main>
}
