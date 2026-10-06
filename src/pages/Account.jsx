import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useWishlist } from '../context/WishlistContext'
import { useOrders } from '../context/OrderContext'
import { useAuth } from '../context/AuthContext'

export default function Account() {
  const { count: wishlistCount } = useWishlist()
  const { orders } = useOrders()
  const { user, logout, changePassword } = useAuth()
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const name = user?.name || 'Customer'
  const email = user?.email || ''
  const phone = user?.phone || ''

  const initials = useMemo(() => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(), [name])

  const submitPasswordChange = async (event) => {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    setChangingPassword(true)
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword)
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordMessage('Your password has been changed successfully.')
    } catch (error) {
      setPasswordError(error.message)
    } finally {
      setChangingPassword(false)
    }
  }

  return <main className="section account-page">
    <div className="page-intro"><span className="eyebrow">CUSTOMER ACCOUNT</span><h1>Welcome, {name.split(' ')[0]}.</h1><p>Manage your orders, profile and saved shopping preferences.</p></div>
    <div className="account-layout">
      <aside className="account-sidebar"><div className="account-avatar">{initials}</div><h3>{name}</h3><p>{email}</p><nav><a className="active" href="#overview">Overview</a><a href="#orders">My orders</a><Link to="/wishlist">Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link><a href="#profile">Profile settings</a></nav><button className="secondary-button full" type="button" onClick={logout}>Sign out</button></aside>
      <div className="account-content">
        <section className="account-cards" id="overview"><article><small>Orders</small><strong>{orders.length}</strong><span>View your purchases</span></article><article><small>Wishlist</small><strong>{wishlistCount}</strong><span>Saved products</span></article><article><small>Account status</small><strong>✓</strong><span>Active customer</span></article></section>
        <section className="orders-panel" id="orders"><div className="panel-heading"><div><span className="eyebrow">ORDER HISTORY</span><h2>Recent orders</h2></div><Link to="/shop" className="text-link">Continue shopping →</Link></div>{orders.length ? <div className="orders-table">{orders.map((order) => <div className="order-row" key={order.id}><div><b>#{order.id}</b><small>{order.date}</small></div><span className={`order-status ${String(order.status).toLowerCase()}`}>{order.status}</span><strong>₦{Number(order.total).toLocaleString('en-NG')}</strong><Link to={`/account?order=${encodeURIComponent(order.id)}`} className="text-link">View order</Link></div>)}</div> : <div className="admin-empty"><h2>No orders yet</h2><p>Your completed purchases will appear here.</p><Link to="/shop" className="primary-button">Start shopping →</Link></div>}</section>
        <section className="account-help" id="profile"><div><span className="eyebrow">PROFILE</span><h2>Your account details.</h2><p>{phone ? `Phone: ${phone}` : 'Add your phone number during checkout when placing an order.'}</p></div><Link className="secondary-button" to="/contact">Contact support</Link></section>
        <section className="orders-panel account-password">
          <div className="panel-heading"><div><span className="eyebrow">SECURITY</span><h2>Change password</h2></div></div>
          <form className="auth-form" onSubmit={submitPasswordChange}>
            <label>Current password<input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords((current) => ({ ...current, currentPassword: e.target.value }))} required autoComplete="current-password" /></label>
            <label>New password<input type="password" value={passwords.newPassword} onChange={(e) => setPasswords((current) => ({ ...current, newPassword: e.target.value }))} required minLength="8" maxLength="72" autoComplete="new-password" /></label>
            <label>Confirm new password<input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords((current) => ({ ...current, confirmPassword: e.target.value }))} required minLength="8" maxLength="72" autoComplete="new-password" /></label>
            <button className="primary-button" type="submit" disabled={changingPassword}>{changingPassword ? 'Changing…' : 'Change password'}</button>
            {passwordMessage && <p className="auth-message">{passwordMessage}</p>}
            {passwordError && <p className="auth-message" role="alert">{passwordError}</p>}
          </form>
        </section>
      </div>
    </div>
  </main>
}