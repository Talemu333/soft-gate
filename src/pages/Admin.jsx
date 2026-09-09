import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, products as seedProducts } from '../data/products'
import './Admin.css'

const statuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export default function Admin() {
  const [tab, setTab] = useState('Overview')
  const [products, setProducts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('softgate-products') || 'null') || seedProducts } catch { return seedProducts }
  })
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('softgate-orders') || '[]') } catch { return [] }
  })
  const [orderFilter, setOrderFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  const saveProducts = (next) => {
    setProducts(next)
    localStorage.setItem('softgate-products', JSON.stringify(next))
    setNotice('Product catalogue saved locally.')
  }

  const removeProduct = (id) => saveProducts(products.filter((product) => product.id !== id))

  const updateStock = (id, value) => saveProducts(products.map((product) => product.id === id ? { ...product, stock: Math.max(0, Number(value) || 0) } : product))

  const updateOrderStatus = (id, status) => {
    const next = orders.map((order) => order.id === id ? { ...order, status } : order)
    setOrders(next)
    localStorage.setItem('softgate-orders', JSON.stringify(next))
    setNotice(`Order ${id} updated.`)
  }

  const stats = useMemo(() => ({
    sales: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    orders: orders.length,
    products: products.length,
    lowStock: products.filter((product) => product.stock <= 6).length,
  }), [orders, products])

  const filteredProducts = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase()))
  const filteredOrders = orders.filter((order) => orderFilter === 'All' || order.status === orderFilter)
  const customers = useMemo(() => {
    const map = new Map()
    orders.forEach((order) => {
      const key = order.customer?.email || order.customer?.phone || order.id
      const current = map.get(key) || { name: order.customer?.name || 'Customer', email: order.customer?.email || '—', orders: 0, spend: 0 }
      current.orders += 1
      current.spend += Number(order.total || 0)
      map.set(key, current)
    })
    return [...map.values()]
  }, [orders])

  const renderOverview = () => <>
    <div className="admin-kpis">
      <article><span>Total sales</span><strong>{formatPrice(stats.sales)}</strong><small>Recorded orders</small></article>
      <article><span>Orders</span><strong>{stats.orders}</strong><small>All customer orders</small></article>
      <article><span>Products</span><strong>{stats.products}</strong><small>Catalogue items</small></article>
      <article className={stats.lowStock ? 'warning' : ''}><span>Low stock</span><strong>{stats.lowStock}</strong><small>6 units or fewer</small></article>
    </div>
    <div className="admin-two-col">
      <section className="admin-panel"><div className="panel-title"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Recent orders</h2></div><button onClick={() => setTab('Orders')}>View all →</button></div>{orders.length ? orders.slice(0, 6).map((order) => <div className="admin-order" key={order.id}><div><b>{order.id}</b><small>{order.customer?.name || 'Customer'} · {order.date}</small></div><strong>{formatPrice(order.total || 0)}</strong><span className={`status ${String(order.status).toLowerCase()}`}>{order.status}</span></div>) : <div className="admin-empty">No customer orders have been placed yet.</div>}</section>
      <section className="admin-panel"><div className="panel-title"><div><span className="eyebrow">INVENTORY</span><h2>Low-stock alerts</h2></div><button onClick={() => setTab('Products')}>Manage →</button></div>{products.filter((p) => p.stock <= 6).slice(0, 6).map((product) => <div className="stock-row" key={product.id}><div><b>{product.name}</b><small>{product.category}</small></div><span>{product.stock} left</span></div>)}{!products.some((p) => p.stock <= 6) && <div className="admin-empty">Inventory levels look healthy.</div>}</section>
    </div>
    <section className="quick-actions"><div><span className="eyebrow">QUICK ACTIONS</span><h2>Run your store</h2><p>Manage the catalogue, orders and customer activity from one place.</p></div><div className="action-grid"><button onClick={() => setTab('Products')}>＋ Add / edit products</button><button onClick={() => setTab('Orders')}>↗ Manage orders</button><button onClick={() => setTab('Customers')}>♙ Customer records</button><Link to="/shop">↗ View storefront</Link></div></section>
  </>

  const renderProducts = () => <section className="admin-panel full-panel"><div className="panel-title"><div><span className="eyebrow">CATALOGUE</span><h2>Product management</h2></div><input className="admin-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." /></div><div className="admin-table"><div className="table-head"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Action</span></div>{filteredProducts.map((product) => <div className="table-row" key={product.id}><div className="product-cell"><img src={product.image} alt=""/><b>{product.name}</b></div><span>{product.category}</span><strong>{formatPrice(product.price)}</strong><input type="number" min="0" value={product.stock} onChange={(e) => updateStock(product.id, e.target.value)} /><button className="danger" onClick={() => removeProduct(product.id)}>Delete</button></div>)}</div></section>

  const renderOrders = () => <section className="admin-panel full-panel"><div className="panel-title"><div><span className="eyebrow">FULFILMENT</span><h2>Order management</h2></div><div className="filter-pills">{statuses.map((status) => <button className={orderFilter === status ? 'active' : ''} key={status} onClick={() => setOrderFilter(status)}>{status}</button>)}</div></div>{filteredOrders.length ? <div className="admin-table"><div className="table-head"><span>Order</span><span>Customer</span><span>Total</span><span>Status</span><span>Update</span></div>{filteredOrders.map((order) => <div className="table-row" key={order.id}><div><b>{order.id}</b><small>{order.date}</small></div><span>{order.customer?.name || 'Customer'}</span><strong>{formatPrice(order.total || 0)}</strong><span className={`status ${String(order.status).toLowerCase()}`}>{order.status}</span><select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></div>)}</div> : <div className="admin-empty large">No orders match this filter.</div>}</section>

  const renderCustomers = () => <section className="admin-panel full-panel"><div className="panel-title"><div><span className="eyebrow">CUSTOMER RECORDS</span><h2>Customers</h2></div></div>{customers.length ? <div className="admin-table"><div className="table-head"><span>Customer</span><span>Email</span><span>Orders</span><span>Total spend</span><span></span></div>{customers.map((customer) => <div className="table-row" key={customer.email}><div><b>{customer.name}</b></div><span>{customer.email}</span><strong>{customer.orders}</strong><strong>{formatPrice(customer.spend)}</strong><span>Active</span></div>)}</div> : <div className="admin-empty large">Customer records will appear after the first order.</div>}</section>

  return <main className="admin-page"><div className="admin-shell"><aside className="admin-sidebar"><Link to="/" className="admin-brand"><span className="brand-mark">S</span><span><strong>SOFT-GATE</strong><small>ADMIN</small></span></Link><div className="admin-nav">{['Overview', 'Products', 'Orders', 'Customers'].map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item === 'Overview' ? '▦' : item === 'Products' ? '▤' : item === 'Orders' ? '▣' : '♙'}<span>{item}</span></button>)}</div><Link className="store-link" to="/">← Back to storefront</Link></aside><div className="admin-main"><header className="admin-header"><div><span className="eyebrow">BUSINESS CONTROL CENTRE</span><h1>{tab}</h1><p>Manage your Soft-Gate store from one workspace.</p></div><div className="admin-header-actions"><Link to="/shop">View store</Link><Link to="/account">Customer view</Link></div></header>{notice && <button className="admin-notice" onClick={() => setNotice('')}>{notice} ×</button>}{tab === 'Overview' ? renderOverview() : tab === 'Products' ? renderProducts() : tab === 'Orders' ? renderOrders() : renderCustomers()}</div></div></main>
}
