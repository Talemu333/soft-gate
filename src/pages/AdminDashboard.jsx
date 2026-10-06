import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { formatPrice } from '../lib/format'
import { useOrders } from '../context/OrderContext'

const emptyStats = {
  revenue: 0, orders: 0, pending: 0, shipped: 0, delivered: 0,
  products: 0, lowStock: 0, outOfStock: 0, customers: 0,
  salesTrend: [], topProducts: [],
}

export default function AdminDashboard() {
  const { orders } = useOrders()
  const [stats, setStats] = useState(emptyStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = async () => {
    try {
      setError('')
      const data = await api('/api/admin/stats')
      setStats({ ...emptyStats, ...data })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStats() }, [])

  const maxRevenue = useMemo(
    () => Math.max(...stats.salesTrend.map((item) => Number(item.revenue || 0)), 1),
    [stats.salesTrend],
  )

  const lowStockOrders = orders.filter((order) => ['Processing', 'Confirmed'].includes(order.status))

  return <main className="admin-page">
    <div className="admin-shell">
      <AdminNav active="dashboard" />
      <section className="admin-main">
        <header className="admin-header">
          <div><span className="eyebrow">STORE OVERVIEW</span><h1>Dashboard</h1><p>See what is happening in your store and what needs attention.</p></div>
          <div className="admin-header-actions"><button className="secondary-button" type="button" onClick={loadStats}>↻ Refresh</button><Link className="primary-button" to="/admin/products">+ Add product</Link></div>
        </header>

        {error && <div className="admin-demo-note" role="alert">{error}</div>}

        <div className="admin-kpis">
          <article><small>Sales revenue</small><strong>{loading ? '…' : formatPrice(stats.revenue)}</strong><span>Excludes cancelled orders</span></article>
          <article><small>Total orders</small><strong>{loading ? '…' : stats.orders}</strong><span>{stats.pending} awaiting processing</span></article>
          <article><small>Customers</small><strong>{loading ? '…' : stats.customers}</strong><span>Registered customer accounts</span></article>
          <article className={stats.lowStock || stats.outOfStock ? 'warning' : ''}><small>Stock alerts</small><strong>{loading ? '…' : stats.lowStock + stats.outOfStock}</strong><span>{stats.outOfStock} out of stock</span></article>
        </div>

        <div className="admin-grid-two">
          <section className="admin-panel">
            <div className="admin-panel-head"><div><span className="eyebrow">PERFORMANCE</span><h2>Sales · Last 7 days</h2></div></div>
            {stats.salesTrend.length ? <div className="sales-chart" aria-label="Sales for the last 7 days">
              {stats.salesTrend.map((item) => <div className="sales-bar-wrap" key={item.day}>
                <div className="sales-bar-value">{formatPrice(item.revenue)}</div>
                <div className="sales-bar-track"><div className="sales-bar" style={{ height: `${Math.max((Number(item.revenue) / maxRevenue) * 100, 4)}%` }} /></div>
                <small>{item.day}</small>
              </div>)}
            </div> : <div className="admin-empty">No sales data yet. Your sales trend will appear here after orders are placed.</div>}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head"><div><span className="eyebrow">PRODUCT PERFORMANCE</span><h2>Top products</h2></div><Link to="/admin/products">Manage →</Link></div>
            {stats.topProducts.length ? <div className="top-product-list">{stats.topProducts.map((product, index) => <div key={product.name}><span className="rank">{index + 1}</span><span><b>{product.name}</b><small>{product.quantity} unit{product.quantity !== 1 ? 's' : ''} sold</small></span><strong>{formatPrice(product.revenue)}</strong></div>)}</div> : <div className="admin-empty">No product sales yet.</div>}
          </section>
        </div>

        <div className="admin-grid-two">
          <section className="admin-panel">
            <div className="admin-panel-head"><div><span className="eyebrow">FULFILLMENT</span><h2>Order pipeline</h2></div><Link to="/admin/orders">Manage orders →</Link></div>
            <div className="pipeline-grid">
              <div><strong>{stats.pending}</strong><small>Processing / confirmed</small></div>
              <div><strong>{stats.shipped}</strong><small>Shipped</small></div>
              <div><strong>{stats.delivered}</strong><small>Delivered</small></div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head"><div><span className="eyebrow">INVENTORY</span><h2>Stock alerts</h2></div><Link to="/admin/products">Manage →</Link></div>
            <div className="stock-alert-summary"><div className="warning"><strong>{stats.lowStock}</strong><span>Low stock</span></div><div className="danger"><strong>{stats.outOfStock}</strong><span>Out of stock</span></div><div className="normal"><strong>{stats.products}</strong><span>Active products</span></div></div>
          </section>
        </div>

        <section className="admin-panel quick-panel">
          <div className="admin-panel-head"><div><span className="eyebrow">QUICK ACTIONS</span><h2>Manage your store</h2></div></div>
          <div className="quick-actions">
            <Link to="/admin/products"><b>▣</b><span><strong>Products & inventory</strong><small>Add products, edit pricing and manage stock</small></span>→</Link>
            <Link to="/admin/orders"><b>▤</b><span><strong>Orders & fulfillment</strong><small>Review orders and update their status</small></span>→</Link>
            <Link to="/admin/customers"><b>♙</b><span><strong>Customers</strong><small>Review customer accounts and purchase activity</small></span>→</Link>
          </div>
        </section>
      </section>
    </div>
  </main>
}

function AdminNav({ active }) {
  return <aside className="admin-sidebar">
    <div className="admin-brand"><span className="brand-mark">S</span><div><b>SOFT-GATE</b><small>ADMIN PANEL</small></div></div>
    <nav><Link className={active === 'dashboard' ? 'active' : ''} to="/admin">▦ Dashboard</Link><Link className={active === 'products' ? 'active' : ''} to="/admin/products">▣ Products</Link><Link className={active === 'orders' ? 'active' : ''} to="/admin/orders">▤ Orders</Link><Link className={active === 'customers' ? 'active' : ''} to="/admin/customers">♙ Customers</Link></nav>
    <Link className="admin-store-link" to="/">← Back to store</Link>
  </aside>
}
