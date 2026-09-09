import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart()
  const delivery = subtotal >= 500000 || subtotal === 0 ? 0 : 5000
  const total = subtotal + delivery
  if (!items.length) return <main className="section empty-cart"><div className="empty-state"><div className="empty-cart-icon">🛒</div><span className="eyebrow">YOUR CART</span><h1>Your cart is empty</h1><p>Looks like you haven't added anything yet.</p><Link className="primary-button" to="/shop">Start shopping →</Link></div></main>
  return <main className="section cart-page"><div className="page-intro"><span className="eyebrow">SHOPPING CART</span><h1>Your cart</h1><p>{items.length} product{items.length > 1 ? 's' : ''} · {items.reduce((s, i) => s + i.quantity, 0)} item(s)</p></div><div className="cart-layout"><div className="cart-items"><div className="cart-list-header">Product <span>Quantity</span><span>Total</span></div>{items.map(item => <div className="cart-item" key={item.id}><Link to={`/product/${item.id}`} className="cart-thumb"><img src={item.image} alt={item.name}/></Link><div className="cart-product"><Link to={`/product/${item.id}`}><h3>{item.name}</h3></Link><p>{formatPrice(item.price)}</p><button onClick={() => removeFromCart(item.id)}>Remove</button></div><div className="quantity"><button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button></div><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div><aside className="summary"><span>ORDER SUMMARY</span><div><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div><div><span>Delivery</span><b>{delivery ? formatPrice(delivery) : 'FREE'}</b></div><hr/><div className="total-row"><strong>Total</strong><strong>{formatPrice(total)}</strong></div><Link className="primary-button full" to="/checkout">Proceed to checkout →</Link><p className="secure-note">🔒 Secure checkout · Your details are protected</p></aside></div></main>
}
