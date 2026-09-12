import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useWishlist } from '../context/WishlistContext'
import { useOrders } from '../context/OrderContext'
import { api } from '../lib/api'

export default function Account() {
  const navigate = useNavigate()
  const { count: wishlistCount } = useWishlist()
  const { getCustomerOrders, refresh: refreshOrders } = useOrders()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const token = localStorage.getItem('softgate-token')
        if (!token) {
          navigate('/login', { replace: true })
          return
        }

        const data = await api.me()
        if (!active) return
        setCustomer(data.user)
        localStorage.setItem('softgate-user', JSON.stringify(data.user))
        await refreshOrders()
      } catch (error) {
        if (!active) return
        if (error?.status === 401) {
          localStorage.removeItem('softgate-token')
          localStorage.removeItem('softgate-user')
          navigate('/login', { replace: true })
          return
        }

        const storedUser = localStorage.getItem('softgate-user')
        if (storedUser) {
          try {
            setCustomer(JSON.parse(storedUser))
          } catch {
            // Ignore invalid cached user data.
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [navigate, refreshOrders])

  if (loading) return <main className="section"><div className="empty-state"><h1>Loading your account…</h1></div></main>

  const name = customer?.name || 'Soft-Gate Customer'
  const email = customer?.email || 'customer@example.com'
  const liveOrders = getCustomerOrders(email)

  return <main className="section account-page">
    <div className="page-intro"><span className="eyebrow">CUSTOMER ACCOUNT</span><h1>Welcome, {name.split(' ')[0]}.</h1><p>Manage your orders, profile and saved shopping preferences.</p></div>
    <div className="account-layout">
      <aside className="account-sidebar"><div className="account-avatar">{name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><h3>{name}</h3><p>{email}</p><nav><a className="active" href="#overview">Overview</a><a href="#orders">My orders</a><Link to="/wishlist">Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link><a href="#profile">Profile settings</a></nav></aside>
      <div className="account-content">
        <section className="account-cards" id="overview"><article><small>Orders</small><strong>{liveOrders.length}</strong><span>View your purchases</span></article><article><small>Wishlist</small><strong>{wishlistCount}</strong><span>Saved products</span></article><article><small>Account status</small><strong>✓</strong><span>Active customer</span></article></section>
        <section className="orders-panel" id="orders"><div className="panel-heading"><div><span className="eyebrow">ORDER HISTORY</span><h2>Recent orders</h2></div><Link to="/shop" className="text-link">Continue shopping →</Link></div><div className="orders-table">{liveOrders.length ? liveOrders.map((order) => <div className="order-row" key={order.id}><div><b>#{order.id.replace('#', '')}</b><small>{new Date(order.createdAt || order.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</small></div><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span><strong>₦{Number(order.total).toLocaleString('en-NG')}</strong><button type="button">View order</button></div>) : <div className="admin-empty"><p>No orders yet. Start shopping to see your purchases here.</p></div>}</div></section>
        <section className="account-help"><div><span className="eyebrow">NEED HELP?</span><h2>We're here for you.</h2><p>Questions about an order, delivery or a product? Our support team can help.</p></div><Link className="secondary-button" to="/contact">Contact support</Link></section>
      </div>
    </div>
  </main>
}
