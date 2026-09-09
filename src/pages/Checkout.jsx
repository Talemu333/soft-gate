import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { formatPrice } from '../data/products'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [payment, setPayment] = useState('transfer')
  const [placed, setPlaced] = useState(false)
  const delivery = subtotal >= 500000 ? 0 : 5000
  const total = subtotal + delivery
  const submit = (e) => { e.preventDefault(); setPlaced(true); clearCart(); setTimeout(() => navigate('/shop'), 1800) }
  if (!items.length && !placed) return <main className="section"><div className="empty-state"><h1>Your cart is empty</h1><p>Add products before proceeding to checkout.</p><Link to="/shop" className="primary-button">Shop products</Link></div></main>
  if (placed) return <main className="section"><div className="empty-state success-state"><div>✓</div><h1>Order received</h1><p>Your order has been recorded in this demo. Production payment and order processing will be connected to the backend.</p></div></main>
  return <main className="checkout-page section"><div className="checkout-head"><span className="eyebrow">SECURE CHECKOUT</span><h1>Complete your order</h1><div className="checkout-steps"><b>1. Delivery</b><span>→</span><span>2. Payment</span><span>→</span><span>3. Confirmation</span></div></div><form className="checkout-layout" onSubmit={submit}><div className="checkout-form"><section className="checkout-box"><h2>Delivery information</h2><div className="form-grid"><label>First & last name<input required placeholder="Your full name"/></label><label>Phone number<input required placeholder="0800 000 0000"/></label><label>Email address<input type="email" required placeholder="you@example.com"/></label><label>City<input required placeholder="Lagos"/></label></div><label>Delivery address<textarea required placeholder="House number, street, area..."></textarea></label></section><section className="checkout-box"><h2>Payment method</h2><label className={`payment-option ${payment === 'transfer' ? 'active' : ''}`}><input type="radio" name="payment" value="transfer" checked={payment === 'transfer'} onChange={() => setPayment('transfer')}/><span><b>Bank transfer</b><small>Pay by bank transfer after placing your order.</small></span></label><label className={`payment-option ${payment === 'card' ? 'active' : ''}`}><input type="radio" name="payment" value="card" checked={payment === 'card'} onChange={() => setPayment('card')}/><span><b>Card payment</b><small>Secure card gateway will be connected before launch.</small></span></label></section><button className="primary-button full place-order">Place order · {formatPrice(total)}</button></div><aside className="summary"><span>ORDER SUMMARY</span>{items.map(item => <div className="mini-order" key={item.id}><span>{item.name} × {item.quantity}</span><b>{formatPrice(item.price * item.quantity)}</b></div>)}<hr/><div><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div><div><span>Delivery</span><b>{delivery ? formatPrice(delivery) : 'FREE'}</b></div><div className="total-row"><strong>Total</strong><strong>{formatPrice(total)}</strong></div><Link to="/cart">← Edit cart</Link></aside></form></main>
}
