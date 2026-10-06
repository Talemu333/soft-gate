import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart, unavailableItems } = useCart()
  const delivery = subtotal >= 500000 || subtotal === 0 ? 0 : 5000
  const total = subtotal + delivery
  const hasUnavailable = unavailableItems.length > 0

  if (!items.length) return <main className="section empty-cart"><div className="empty-state"><div className="empty-cart-icon">🛒</div><span className="eyebrow">YOUR CART</span><h1>Your cart is empty</h1><p>Looks like you haven't added anything yet.</p><Link className="primary-button" to="/shop">Start shopping →</Link></div></main>

  return <main className="section cart-page">
    <div className="page-intro"><span className="eyebrow">SHOPPING CART</span><h1>Your cart</h1><p>{items.length} product{items.length > 1 ? 's' : ''} · {items.reduce((s, i) => s + i.quantity, 0)} item(s)</p></div>
    {hasUnavailable && <div className="cart-warning" role="alert"><strong>One or more items need your attention.</strong><span>Some products are no longer available. Remove them before checkout.</span></div>}
    <div className="cart-layout">
      <div className="cart-items">
        <div className="cart-list-header">Product <span>Quantity</span><span>Total</span></div>
        {items.map(item => {
          const unavailable = item.available === false || Number(item.stock) <= 0
          const limited = !unavailable && Number(item.quantity) >= Number(item.stock) && Number(item.stock) <= 6
          return <div className={`cart-item ${unavailable ? 'cart-item-unavailable' : ''}`} key={item.id}>
            <Link to={`/product/${item.id}`} className="cart-thumb"><img src={item.image} alt={item.name}/></Link>
            <div className="cart-product">
              <Link to={`/product/${item.id}`}><h3>{item.name}</h3></Link>
              <p>{formatPrice(item.price)}</p>
              {unavailable ? <span className="cart-status unavailable">No longer available</span> : limited ? <span className="cart-status limited">Only {item.stock} available</span> : <span className="cart-status available">✓ In stock</span>}
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
            <div className="quantity">
              <button disabled={unavailable || item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
              <b>{item.quantity}</b>
              <button disabled={unavailable || item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">+</button>
            </div>
            <strong>{formatPrice(item.price * item.quantity)}</strong>
          </div>
        })}
      </div>
      <aside className="summary">
        <span>ORDER SUMMARY</span>
        <div><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div>
        <div><span>Delivery</span><b>{delivery ? formatPrice(delivery) : 'FREE'}</b></div>
        <hr/>
        <div className="total-row"><strong>Total</strong><strong>{formatPrice(total)}</strong></div>
        {hasUnavailable
          ? <button className="primary-button full" type="button" disabled>Remove unavailable items to continue</button>
          : <Link className="primary-button full" to="/checkout">Proceed to checkout →</Link>}
        <p className="secure-note">🔒 Secure checkout · Stock and totals are verified again before your order is saved.</p>
      </aside>
    </div>
  </main>
}
