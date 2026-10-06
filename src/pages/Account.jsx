import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useOrders } from '../context/OrderContext'
import { useAuth } from '../context/AuthContext'

const formatPrice = (value) => '₦' + Number(value || 0).toLocaleString('en-NG')

export default function Account() {
  const { count: wishlistCount } = useWishlist()
  const { orders } = useOrders()
  const { user, logout } = useAuth()
  const [params, setParams] = useSearchParams()
  const selectedOrder = orders.find((order) => order.id === params.get('order'))

  const name = user?.name || 'Customer'
  const email = user?.email || ''
  const phone = user?.phone || ''

  const initials = useMemo(
    () => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
    [name],
  )

  return <main className="section account-page">
    <div className="page-intro">
      <span className="eyebrow">CUSTOMER ACCOUNT</span>
      <h1>Welcome, {name.split(' ')[0]}.</h1>
      <p>Manage your orders, profile and saved shopping preferences.</p>
    </div>
    <div className="account-layout">
      <aside className="account-sidebar">
        <div className="account-avatar">{initials}</div>
        <h3>{name}</h3>
        <p>{email}</p>
        <nav>
          <a className="active" href="#overview">Overview</a>
          <a href="#orders">My orders</a>
          <Link to="/wishlist">Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link>
          <a href="#profile">Profile settings</a>
        </nav>
        <button className="secondary-button full" type="button" onClick={logout}>Sign out</button>
      </aside>
      <div className="account-content">
        <section className="account-cards" id="overview">
          <article><small>Orders</small><strong>{orders.length}</strong><span>View your purchases</span></article>
          <article><small>Wishlist</small><strong>{wishlistCount}</strong><span>Saved products</span></article>
          <article><small>Account status</small><strong>✓</strong><span>Active customer</span></article>
        </section>
        {selectedOrder && <section className="account-order-detail">
          <div className="panel-heading"><div><span className="eyebrow">ORDER DETAILS</span><h2>Order #{selectedOrder.id}</h2><p>{selectedOrder.date}</p></div><button className="secondary-button" type="button" onClick={() => setParams({})}>Back to orders</button></div>
          <div className="order-progress">
            {['Processing', 'Confirmed', 'Shipped', 'Delivered'].map((stage) => <span className={stage === selectedOrder.status ? 'current' : ''} key={stage}>{stage}</span>)}
          </div>
          <div className="order-detail-grid">
            <div><h3>Items</h3>{selectedOrder.items?.map((item) => <div className="order-detail-item" key={item.productId}><img src={item.image} alt="" /><div><b>{item.name}</b><span>{item.quantity} × {formatPrice(item.price)}</span></div><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div>
            <aside className="summary"><span>ORDER SUMMARY</span><div><span>Subtotal</span><b>{formatPrice(selectedOrder.subtotal)}</b></div><div><span>Delivery</span><b>{selectedOrder.delivery ? formatPrice(selectedOrder.delivery) : 'FREE'}</b></div><div><span>Payment</span><b>Bank transfer · {selectedOrder.paymentStatus}</b></div><div className="total-row"><strong>Total</strong><strong>{formatPrice(selectedOrder.total)}</strong></div></aside>
          </div>
          <div className="order-delivery-card"><h3>Delivery information</h3><p><b>{selectedOrder.customer?.name}</b><br />{selectedOrder.customer?.address}<br />{selectedOrder.customer?.city}<br />{selectedOrder.customer?.phone} · {selectedOrder.customer?.email}</p></div>
        </section>}
        <section className="orders-panel" id="orders">
          <div className="panel-heading">
            <div><span className="eyebrow">ORDER HISTORY</span><h2>Recent orders</h2></div>
            <Link to="/shop" className="text-link">Continue shopping →</Link>
          </div>
          {orders.length ? <div className="orders-table">{orders.map((order) => <div className="order-row" key={order.id}>
            <div><b>#{order.id}</b><small>{order.date}</small></div>
            <span className={`order-status ${String(order.status).toLowerCase()}`}>{order.status}</span>
            <strong>₦{Number(order.total).toLocaleString('en-NG')}</strong>
            <Link to={`/account?order=${encodeURIComponent(order.id)}`} className="text-link">View order</Link>
          </div>)}</div> : <div className="admin-empty">
            <h2>No orders yet</h2><p>Your completed purchases will appear here.</p>
            <Link to="/shop" className="primary-button">Start shopping →</Link>
          </div>}
        </section>
        <section className="account-help" id="profile">
          <div><span className="eyebrow">PROFILE</span><h2>Your account details.</h2><p>{phone ? `Phone: ${phone}` : 'Add your phone number during checkout when placing an order.'}</p></div>
          <Link className="secondary-button" to="/contact">Contact support</Link>
        </section>
      </div>
    </div>
  </main>
}
