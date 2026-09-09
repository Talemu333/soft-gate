import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { formatPrice } from '../data/products'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductDetails() {
  const { id } = useParams()
  const { products } = useProducts()
  const product = products.find((item) => item.id === Number(id))
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  if (!product) {
    return <main className="section"><div className="empty-state"><h1>Product not found</h1><p>The product may have been removed or the link is incorrect.</p><Link to="/shop" className="primary-button">Back to shop</Link></div></main>
  }

  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4)
  const saved = isWishlisted(product.id)
  const outOfStock = Number(product.stock) <= 0
  const add = () => {
    if (outOfStock) return
    addToCart(product, qty)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2200)
  }

  return (
    <main className="product-detail-page">
      <div className="breadcrumbs"><Link to="/">Home</Link><span>›</span><Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>›</span><b>{product.name}</b></div>
      <section className="detail-card">
        <div className="detail-gallery">
          <div className="detail-main-image">
            <img src={product.image} alt={product.name} />
            {product.badge && <span className="product-badge">{product.badge}</span>}
            {discount > 0 && <span className="discount-badge">-{discount}%</span>}
          </div>
          <div className="thumbnail-row"><img src={product.image} alt={`${product.name} preview`} /></div>
        </div>

        <div className="detail-copy">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="detail-rating"><span>★★★★★</span> <b>{product.rating}</b> <span>({product.reviews} reviews)</span></div>
          <div className="detail-price"><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}{discount > 0 && <em>{discount}% OFF</em>}</div>
          <p>{product.description}</p>
          <div className={`stock-line ${outOfStock ? 'low-stock' : ''}`}>{outOfStock ? '✕ Out of stock' : <>✓ In stock <span>•</span> {product.stock <= 6 ? `Only ${product.stock} left` : 'Ready for delivery'}</>}</div>

          <div className="spec-box"><h3>Key features</h3><ul>{(product.specs || []).map((spec) => <li key={spec}>✓ {spec}</li>)}</ul></div>

          <div className="purchase-row">
            <div className="quantity" aria-label="Quantity">
              <button type="button" disabled={outOfStock} onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
              <b>{qty}</b>
              <button type="button" disabled={outOfStock} onClick={() => setQty(Math.min(product.stock, qty + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button className="primary-button buy-button" type="button" onClick={add} disabled={outOfStock}>{outOfStock ? 'Out of stock' : added ? '✓ Added to cart' : 'Add to cart'}</button>
            <button className={`wishlist-large ${saved ? 'active' : ''}`} type="button" onClick={() => toggleWishlist(product)} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}>{saved ? '♥' : '♡'}</button>
          </div>

          <div className="delivery-note">▣ <div><b>Delivery information</b><small>Delivery options and final delivery cost are calculated during checkout based on your location.</small></div></div>
        </div>
      </section>

      {related.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">YOU MAY ALSO LIKE</span><h2>More from {product.category}</h2></div><Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="text-link">View all →</Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </main>
  )
}
