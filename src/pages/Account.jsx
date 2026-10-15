import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useWishlist } from '../context/WishlistContext'
import { useOrders } from '../context/OrderContext'
import { useAuth } from '../context/AuthContext'

const formatPrice = (value) => '₦' + Number(value || 0).toLocaleString('en-NG')
const orderStatuses = ['All orders', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

function paymentLabel(status) {
  const labels = { pending: 'Awaiting payment', paid: 'Paid', failed: 'Payment failed', refunded: 'Refunded' }
  return labels[String(status || '').toLowerCase()] || 'Not available'
}

export default function Account() {
  const { count: wishlistCount } = useWishlist()
  const { orders, loading: ordersLoading, ordersError, refreshOrders } = useOrders()
  const { user, logout } = useAuth()
  const [params, setParams] = useSearchParams()
  const [orderSearch, setOrderSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All orders')
  const orderDetailRef = useRef(null)
  const orderParam = params.get('order')
  const selectedOrder = orders.find((order) => String(order.id) === orderParam)

  useEffect(() => {
    if (!selectedOrder || !orderParam || !orderDetailRef.current) return
    orderDetailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [orderParam, selectedOrder])

  const name = user?.name || 'Customer'
  const email = user?.email || ''
  const phone = user?.phone || ''
  const initials = useMemo(
    () => name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
    [name],
  )

  const activeOrders = orders.filter((order) => ['Processing', 'Confirmed', 'Shipped'].includes(order.status)).length
  const totalSpent = orders.reduce((sum, order) => sum + (order.status === 'Cancelled' ? 0 : Number(order.total || 0)), 0)
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'All orders' || order.status === statusFilter
    const search = orderSearch.trim().toLowerCase()
    const matchesSearch = !search || [order.id, order.status, order.date].some((value) => String(value || '').toLowerCase().includes(search))
    return matchesStatus && matchesSearch
  })

  return <main className="section account-page">
    <div className="page-intro">
      <span className="eyebrow">CUSTOMER ACCOUNT</span>
      <h1>Welcome, {name.split(' ')[0]}.</h1>
      <p>Track purchases, check order updates and manage your saved shopping preferences.</p>
    </div>
    <div className="account-layout">
      <aside className="account-sidebar">
        <div className="account-avatar" aria-hidden="true">{initials || 'C'}</div>
        <h3>{name}</h3>
        <p>{email}</p>
        <nav aria-label="Account navigation">
          <a className="active" href="#overview">Overview</a>
          <a href="#orders">My orders</a>
          <Link to="/wishlist">Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link>
          <a href="#profile">Account details</a>
        </nav>
        <button className="secondary-button full" type="button" onClick={logout}>Sign out</button>
      </aside>
      <div className="account-content">
        <section className="account-cards" id="overview" aria-label="Account overview">
          <article><small>Total orders</small><strong>{orders.length}</strong><span>All purchases on this account</span></article>
          <article><small>In progress</small><strong>{activeOrders}</strong><span>Processing, confirmed or shipped</span></article>
          <article><small>Total spent</small><strong className="account-spend">{formatPrice(totalSpent)}</strong><span>Excludes cancelled orders</span></article>
          <article><small>Wishlist</small><strong>{wishlistCount}</strong><span>Products saved in this browser</span></article>
        </section>
        {selectedOrder && <section className="account-order-detail" ref={orderDetailRef} tabIndex={-1} aria-labelledby="order-detail-title">
          <div className="panel-heading"><div><span className="eyebrow">ORDER DETAILS</span><h2 id="order-detail-title">Order #{selectedOrder.id}</h2><p>{selectedOrder.date}</p></div><button className="secondary-button" type="button" onClick={() => setParams({})}>Back to orders</button></div>
          {selectedOrder.status === 'Cancelled' ? (
            <div className="order-cancelled" role="status">
              <strong>Order cancelled</strong>
              <span>This order was cancelled before shipment. If you need help, please contact our support team.</span>
            </div>
          ) : (
            <div className="order-progress" aria-label={`Order status: ${selectedOrder.status}`}>
              {['Processing', 'Confirmed', 'Shipped', 'Delivered'].map((stage, index, stages) => {
                const currentIndex = stages.indexOf(selectedOrder.status)
                const stageClass = stage === selectedOrder.status ? 'current' : index < currentIndex ? 'complete' : ''
                return <span className={stageClass} key={stage}>{stage}</span>
              })}
            </div>
          )}
          <div className="order-detail-grid">
            <div><h3>Items in this order</h3>{selectedOrder.items?.map((item, index) => <div className="order-detail-item" key={`${item.productId}-${index}`}>{item.image ? <img src={item.image} alt="" loading="lazy" /> : <div className="order-item-image-placeholder" aria-hidden="true">SG</div>}<div><b>{item.name}</b><span>{item.quantity} × {formatPrice(item.price)}</span></div><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div>
            <aside className="summary"><span>ORDER SUMMARY</span><div><span>Subtotal</span><b>{formatPrice(selectedOrder.subtotal)}</b></div><div><span>Delivery</span><b>{selectedOrder.delivery ? formatPrice(selectedOrder.delivery) : 'FREE'}</b></div><div><span>Payment method</span><b>Bank transfer</b></div><div className="account-payment-status"><span>Payment status</span><b>{paymentLabel(selectedOrder.paymentStatus)}</b></div><div className="total-row"><strong>Total</strong><strong>{formatPrice(selectedOrder.total)}</strong></div></aside>
          </div>
          <div className="order-delivery-card"><h3>Delivery information</h3><p><b>{selectedOrder.customer?.name}</b><br />{selectedOrder.customer?.address}<br />{selectedOrder.customer?.city}<br />{selectedOrder.customer?.phone} · {selectedOrder.customer?.email}</p></div>
        </section>}
        <section className="orders-panel" id="orders">
          <div className="panel-heading">
            <div><span className="eyebrow">ORDER HISTORY</span><h2>My orders</h2></div>
            <Link to="/shop" className="text-link">Continue shopping →</Link>
          </div>
          {ordersError && <div className="admin-demo-note" role="alert">
            <p>We couldn't load your order history: {ordersError}</p>
            <button className="secondary-button" type="button" onClick={() => refreshOrders().catch(() => {})}>Try again</button>
          </div>}
          {ordersLoading && !orders.length ? <div className="admin-empty" role="status"><h2>Loading your orders…</h2><p>Please wait while we retrieve your order history.</p></div>
            : orders.length ? <>
              <div className="account-order-filters">
                <label className="account-order-search">Search orders
                  <input type="search" value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Order number, status or date" />
                </label>
                <label className="account-order-status-filter">Filter by status
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <span className="account-order-result-count">{filteredOrders.length} of {orders.length} orders</span>
              </div>
              {filteredOrders.length ? <div className="orders-table">{filteredOrders.map((order) => <div className="order-row" key={order.id}>
                <div><b>#{order.id}</b><small>{order.date}</small></div>
                <span className={`order-status ${String(order.status).toLowerCase()}`}>{order.status}</span>
                <strong>{formatPrice(order.total)}</strong>
                <Link to={`/account?order=${encodeURIComponent(order.id)}`} className="text-link">View order</Link>
              </div>)}</div> : <div className="admin-empty account-filter-empty"><h2>No matching orders</h2><p>Try a different search or status filter.</p><button className="secondary-button" type="button" onClick={() => { setOrderSearch(''); setStatusFilter('All orders') }}>Clear filters</button></div>}
            </>
            : !ordersError && <div className="admin-empty">
              <h2>No orders yet</h2><p>Your purchases will appear here after you place an order while signed in, or when an eligible previous order is linked to your account.</p>
              <Link to="/shop" className="primary-button">Start shopping →</Link>
            </div>}
        </section>
        <section className="account-help" id="profile">
          <div><span className="eyebrow">ACCOUNT DETAILS</span><h2>Your account information.</h2><div className="account-profile-details"><p><span>Full name</span><strong>{name}</strong></p><p><span>Email address</span><strong>{email || 'Not provided'}</strong></p><p><span>Phone number</span><strong>{phone || 'Not added yet'}</strong></p></div><p className="account-profile-note">Need to update your details? Contact our support team and we’ll help you.</p></div>
          <Link className="secondary-button" to="/contact">Contact support</Link>
        </section>
      </div>
    </div>
  </main>
}
