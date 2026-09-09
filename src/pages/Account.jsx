import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

const orders = [
  { id: '#SG-1048', date: 'Sep 08, 2026', status: 'Processing', total: '₦685,000' },
  { id: '#SG-1032', date: 'Aug 29, 2026', status: 'Delivered', total: '₦35,000' },
]

export default function Account() {
  const { count: wishlistCount } = useWishlist()

  return (
    <main className="section account-page">
      <div className="page-intro"><span className="eyebrow">CUSTOMER ACCOUNT</span><h1>Welcome back.</h1><p>Manage your orders, profile and saved shopping preferences.</p></div>
      <div className="account-layout">
        <aside className="account-sidebar"><div className="account-avatar">SG</div><h3>Soft-Gate Customer</h3><p>customer@example.com</p><nav><a className="active" href="#overview">Overview</a><a href="#orders">My orders</a><Link to="/wishlist">Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link><a href="#profile">Profile settings</a></nav></aside>
        <div className="account-content">
          <section className="account-cards" id="overview"><article><small>Orders</small><strong>2</strong><span>View your purchases</span></article><article><small>Wishlist</small><strong>{wishlistCount}</strong><span>Saved products</span></article><article><small>Account status</small><strong>✓</strong><span>Active customer</span></article></section>
          <section className="orders-panel" id="orders"><div className="panel-heading"><div><span className="eyebrow">ORDER HISTORY</span><h2>Recent orders</h2></div><Link to="/shop" className="text-link">Continue shopping →</Link></div><div className="orders-table">{orders.map((order) => <div className="order-row" key={order.id}><div><b>{order.id}</b><small>{order.date}</small></div><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span><strong>{order.total}</strong><button type="button">View order</button></div>)}</div></section>
          <section className="account-help"><div><span className="eyebrow">NEED HELP?</span><h2>We're here for you.</h2><p>Questions about an order, delivery or a product? Our support team can help.</p></div><Link className="secondary-button" to="/contact">Contact support</Link></section>
        </div>
      </div>
    </main>
  )
}
