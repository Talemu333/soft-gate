import { Link } from 'react-router-dom'
import { useState } from 'react'
import { formatPrice } from '../data/products'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrderContext'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { createOrder } = useOrders()
  const [payment, setPayment] = useState('transfer')
  const [placed, setPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', address: '' })
  const delivery = subtotal >= 500000 ? 0 : 5000
  const total = subtotal + delivery

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const submit = (event) => {
    event.preventDefault()
    const id = `SG-${Date.now().toString().slice(-6)}`
    const order = {
      id,
      date: new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString(),
      status: 'Processing',
      subtotal,
      delivery,
      total,
      payment,
      items: items.map(({ id: productId, name, price, quantity, image }) => ({ productId, name, price, quantity, image })),
      customer: form,
    }
    createOrder(order)
    localStorage.setItem('softgate-customer', JSON.stringify({ name: form.name, email: form.email, phone: form.phone }))
    window.dispatchEvent(new Event('softgate-customer-updated'))
    setOrderId(id)
    setPlaced(true)
    clearCart()
  }

  if (!items.length && !placed) return <main className="section"><div className="empty-state"><div>🛒</div><h1>Your cart is empty</h1><p>Add products before proceeding to checkout.</p><Link to="/shop" className="primary-button">Shop products →</Link></div></main>
  if (placed) return <main className="section"><div className="empty-state success-state"><div>✓</div><span className="eyebrow">ORDER CONFIRMED</span><h1>Thank you for your order.</h1><span className="order-reference">Order #{orderId}</span><p>Your order has been received and is now being prepared. Production payment processing and delivery tracking will be connected to the backend.</p><div className="hero-actions"><Link to="/account" className="primary-button">View my orders</Link><Link to="/shop" className="secondary-button">Continue shopping</Link></div></div></main>

  return <main className="checkout-page section">
    <div className="checkout-head"><span className="eyebrow">SECURE CHECKOUT</span><h1>Complete your order</h1><div className="checkout-steps"><b>1. Delivery</b><span>→</span><b>2. Payment</b><span>→</span><span>3. Confirmation</span></div></div>
    <form className="checkout-layout" onSubmit={submit}>
      <div className="checkout-form">
        <section className="checkout-box"><h2>Delivery information</h2><div className="form-grid"><label>Full name<input value={form.name} onChange={(e) => update('name', e.target.value)} required placeholder="Your full name" autoComplete="name" /></label><label>Phone number<input value={form.phone} onChange={(e) => update('phone', e.target.value)} required pattern="[0-9+() -]{8,}" placeholder="0800 000 0000" autoComplete="tel" /></label><label>Email address<input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="you@example.com" autoComplete="email" /></label><label>City<input value={form.city} onChange={(e) => update('city', e.target.value)} required placeholder="Lagos" autoComplete="address-level2" /></label></div><label>Delivery address<textarea value={form.address} onChange={(e) => update('address', e.target.value)} required placeholder="House number, street, area..." autoComplete="street-address"></textarea></label></section>
        <section className="checkout-box"><h2>Payment method</h2><label className={`payment-option ${payment === 'transfer' ? 'active' : ''}`}><input type="radio" name="payment" value="transfer" checked={payment === 'transfer'} onChange={() => setPayment('transfer')} /><span><b>Bank transfer</b><small>Place your order and receive transfer instructions from Soft-Gate.</small></span></label><label className={`payment-option ${payment === 'card' ? 'active' : ''}`}><input type="radio" name="payment" value="card" checked={payment === 'card'} onChange={() => setPayment('card')} /><span><b>Card payment</b><small>Secure payment gateway will be connected before production launch.</small></span></label></section>
        <button className="primary-button full place-order" type="submit">Place order · {formatPrice(total)}</button>
        <p className="secure-note">🔒 Your checkout details are handled securely. No card information is stored by this demo.</p>
      </div>
      <aside className="summary"><span>ORDER SUMMARY</span>{items.map(item => <div className="mini-order" key={item.id}><span>{item.name} × {item.quantity}</span><b>{formatPrice(item.price * item.quantity)}</b></div>)}<hr/><div><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div><div><span>Delivery</span><b>{delivery ? formatPrice(delivery) : 'FREE'}</b></div><div className="total-row"><strong>Total</strong><strong>{formatPrice(total)}</strong></div><Link to="/cart">← Edit cart</Link></aside>
    </form>
  </main>
}
