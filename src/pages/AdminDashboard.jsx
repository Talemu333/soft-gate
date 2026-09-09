import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'
import { useProducts } from '../context/ProductContext'

const readOrders = () => {
  try { return JSON.parse(localStorage.getItem('softgate-orders') || '[]') } catch { return [] }
}

export default function AdminDashboard() {
  const { products } = useProducts()
  const orders = readOrders()
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const lowStock = products.filter((product) => Number(product.stock) <= 7)

  return <main className="admin-page">
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span className="brand-mark">S</span><div><b>SOFT-GATE</b><small>ADMIN PANEL</small></div></div>
        <nav><Link className="active" to="/admin">▦ Dashboard</Link><Link to="/admin/products">▣ Products</Link><Link to="/admin/orders">▤ Orders</Link><Link to="/admin/customers">♙ Customers</Link></nav>
        <Link className="admin-store-link" to="/">← Back to store</Link>
      </aside>
      <section className="admin-main">
        <header className="admin-header"><div><span className="eyebrow">STORE MANAGEMENT</span><h1>Dashboard</h1><p>Monitor your store, orders and inventory.</p></div><Link className="primary-button" to="/admin/products">+ Add product</Link></header>
        <div className="admin-kpis"><article><small>Total sales</small><strong>{formatPrice(revenue)}</strong><span>From recorded orders</span></article><article><small>Orders</small><strong>{orders.length}</strong><span>Customer orders</span></article><article><small>Products</small><strong>{products.length}</strong><span>Catalogue items</span></article><article className={lowStock.length ? 'warning' : ''}><small>Low stock</small><strong>{lowStock.length}</strong><span>Needs attention</span></article></div>
        <div className="admin-grid-two">
          <section className="admin-panel"><div className="admin-panel-head"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Recent orders</h2></div><Link to="/admin/orders">View all →</Link></div>{orders.length ? <div className="admin-table">{orders.slice(0, 5).map((order) => <div className="admin-order-row" key={order.id}><div><b>#{order.id}</b><small>{order.customer?.name || 'Customer'} · {order.date}</small></div><span className={`admin-status ${String(order.status).toLowerCase()}`}>{order.status}</span><strong>{formatPrice(Number(order.total || 0))}</strong></div>)}</div> : <div className="admin-empty">No customer orders have been recorded yet.</div>}</section>
          <section className="admin-panel"><div className="admin-panel-head"><div><span className="eyebrow">INVENTORY</span><h2>Low stock</h2></div><Link to="/admin/products">Manage →</Link></div><div className="stock-list">{lowStock.map((product) => <div key={product.id}><img src={product.image} alt=""/><span><b>{product.name}</b><small>{product.category}</small></span><strong>{product.stock} left</strong></div>)}</div></section>
        </div>
        <section className="admin-panel quick-panel"><div className="admin-panel-head"><div><span className="eyebrow">QUICK ACTIONS</span><h2>Manage your store</h2></div></div><div className="quick-actions"><Link to="/admin/products"><b>▣</b><span><strong>Products</strong><small>Add, edit and update stock</small></span>→</Link><Link to="/admin/orders"><b>▤</b><span><strong>Orders</strong><small>Review and update orders</small></span>→</Link><Link to="/admin/customers"><b>♙</b><span><strong>Customers</strong><small>View customer activity</small></span>→</Link></div></section>
        <div className="admin-demo-note">Demo admin interface: data is currently stored in browser localStorage. Authentication, permissions and database-backed management will be connected when the production backend is implemented.</div>
      </section>
    </div>
  </main>
}
