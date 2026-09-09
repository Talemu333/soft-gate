import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { products, formatPrice } from '../data/products'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'

export default function ProductDetails() {
  const { id } = useParams()
  const product = products.find((item) => item.id === Number(id))
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()
  if (!product) return <main className="section"><h1>Product not found</h1><Link to="/shop" className="primary-button">Back to shop</Link></main>
  const discount = Math.round((1 - product.price / product.oldPrice) * 100)
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4)
  const add = () => { addToCart(product, qty); setAdded(true); setTimeout(() => setAdded(false), 2200) }

  return <main className="product-detail-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>›</span><Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>›</span><b>{product.name}</b></div>
    <section className="detail-card"><div className="detail-gallery"><div className="detail-main-image"><img src={product.image} alt={product.name}/>{product.badge && <span className="product-badge">{product.badge}</span>}</div><div className="thumbnail-row"><img src={product.image} alt=""/><img src={product.image} alt=""/><img src={product.image} alt=""/></div></div><div className="detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><div className="detail-rating"><span>★★★★★</span> <b>{product.rating}</b> <span>({product.reviews} reviews)</span></div><div className="detail-price"><strong>{formatPrice(product.price)}</strong><del>{formatPrice(product.oldPrice)}</del><em>{discount}% OFF</em></div><p>{product.description}</p><div className="stock-line">✓ In stock <span>•</span> Ready for delivery</div><div className="spec-box"><h3>Key features</h3><ul>{product.specs.map((spec) => <li key={spec}>✓ {spec}</li>)}</ul></div><div className="purchase-row"><div className="quantity"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><b>{qty}</b><button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button></div><button className="primary-button buy-button" onClick={add}>{added ? '✓ Added to cart' : 'Add to cart'}</button><button className="wishlist-large">♡</button></div><div className="delivery-note">▣ <div><b>Delivery information</b><small>Delivery options are calculated during checkout based on your location.</small></div></div></div></section>
    {related.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">YOU MAY ALSO LIKE</span><h2>More from {product.category}</h2></div><Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="text-link">View all →</Link></div><div className="product-grid">{related.map(p => <ProductCard key={p.id} product={p}/>)}</div></section>}
  </main>
}
