import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/format'
import { useOrders } from '../context/OrderContext'
import { AdminNav } from './AdminProducts'

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useOrders()
  const [status, setStatus] = useState('All')
  const [error, setError] = useState('')
  const statuses = ['All', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
  const filtered = status === 'All' ? orders : orders.filter((order) => order.status === status)

  const changeStatus = async (id, value) => {
    try { await updateOrderStatus(id, value) } catch (err) { setError(err.message) }
  }

  return <main className="admin-page"><div className="admin-shell"><AdminNav active="orders"/><section className="admin-main"><header className="admin-header"><div><span className="eyebrow">SALES MANAGEMENT</span><h1>Orders</h1><p>Review customer purchases and update order status.</p></div><Link className="secondary-button" to="/shop">View storefront</Link></header>{error && <div className="admin-demo-note" role="alert">{error}</div>}<section className="admin-panel"><div className="admin-toolbar"><div className="admin-filter-tabs">{statuses.map((item) => <button type="button" key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item}</button>)}</div><span>{filtered.length} orders</span></div>{filtered.length ? <div className="order-admin-table">{filtered.map((order) => <article className="order-admin-card" key={order.id}><div><small>ORDER</small><h3>#{order.id}</h3><p>{order.customer?.name || 'Customer'} · {order.date}</p></div><div><small>ITEMS</small><b>{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} item(s)</b></div><div><small>TOTAL</small><strong>{formatPrice(Number(order.total || 0))}</strong></div><label><small>STATUS</small><select value={order.status} onChange={(e) => changeStatus(order.id, e.target.value)}>{statuses.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label></article>)}</div> : <div className="admin-empty"><h2>No orders found</h2><p>Orders placed through the storefront will appear here.</p></div>}</section></section></div></main>
}
