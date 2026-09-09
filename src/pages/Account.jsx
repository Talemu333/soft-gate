import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useWishlist } from '../context/WishlistContext'
import { useOrders } from '../context/OrderContext'

const demoOrders = [
  { id: 'SG-1048', date: '08 Sep 2026', status: 'Processing', total: 685000 },
  { id: 'SG-1032', date: '29 Aug 2026', status: 'Delivered', total: 35000 },
]

export default function Account() {
  const { count: wishlistCount } = useWishlist()
  const { getCustomerOrders } = useOrders()
  const customer = useMemo(() => { try { return JSON.parse(localStorage.getItem('softgate-customer') || 'null') } catch { return null } }, [])
  const liveOrders = getCustomerOrders(customer?.email)
  const orders = liveOrders.length ? liveOrders : demoOrders
  const name = customer?.name || 'Soft-Gate Customer'
  const email = customer?.email || 'customer@example.com'

  return <main className="section account-page">
    <div className="page-intro"><span className="eyebrow">CUSTOMER ACCOUNT</span><h1>Welcome, {name.split(' ')[0]}.</h1><p>Manage your orders, profile and saved shopping preferences.</p></div>
    <div className="account-layout">
      <aside className="account-sidebar"><div className="account-avatar">{name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><h3>{name}</h3><p>{email}</p><nav><a className="active" href="#overview">Overview</a><a href="#orders">My orders</a><Link to="/wishlist">Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link><a href="#profile">Profile settings</a></nav></aside>
      <div className="account-content">
        <section className="account-cards" id="overview"><article><small>Orders</small><strong>{orders.length}</strong><span>View your purchases</span></article><article><small>Wishlist</small><strong>{wishlistCount}</strong><span>Saved products</span></article><article><small>Account status</small><strong>✓</strong><span>Active customer</span></article></section>
        <section className="orders-panel" id="orders"><div className="panel-heading"><div><span className="eyebrow">ORDER HISTORY</span><h2>Recent orders</h2></div><Link to="/shop" className="text-link">Continue shopping →</Link></div><div className="orders-table">{orders.map((order) => <div className="order-row" key={order.id}><div><b>#{order.id.replace('#', '')}</b><small>{order.date}</small></div><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span><strong>₦{Number(order.total).toLocaleString('en-NG')}</strong><button type="button">View order</button></div>)}</div></section>
        <section className="account-help"><div><span className="eyebrow">NEED HELP?</span><h2>We're here for you.</h2><p>Questions about an order, delivery or a product? Our support team can help.</p></div><Link className="secondary-button" to="/contact">Contact support</Link></section>
      </div>
    </div>
  </main>
}
