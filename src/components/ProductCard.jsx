import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/format'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0
  const saved = isWishlisted(product.id)
  const outOfStock = Number(product.stock) <= 0

  const handleWishlist = (event) => {
    event.preventDefault()
    event.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <article className={`product-card ${outOfStock ? 'out-of-stock' : ''}`}>
      <div className="product-media">
        <Link to={`/product/${product.id}`} className="product-image-link" aria-label={`View ${product.name}`}>
          {product.badge && <span className="product-badge">{product.badge}</span>}
          {discount > 0 && <span className="discount-badge">-{discount}%</span>}
          <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
          {outOfStock && <span className="stock-overlay">Out of stock</span>}
        </Link>
        <button className={`wishlist ${saved ? 'active' : ''}`} type="button" onClick={handleWishlist} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}>{saved ? '♥' : '♡'}</button>
      </div>
      <div className="product-info">
        <Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link>
        <div className="product-rating" aria-label={`Rated ${product.rating} out of 5 from ${product.reviews} reviews`}><span>★★★★★</span> <b>{product.rating}</b> <small>({product.reviews})</small></div>
        <div className="price-row"><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div>
        <p className={outOfStock ? 'low-stock' : product.stock <= 6 ? 'low-stock' : 'in-stock'}>{outOfStock ? 'Out of stock' : product.stock <= 6 ? `Only ${product.stock} left` : '✓ In stock'}</p>
        <button className="add-button" type="button" onClick={() => addToCart(product)} disabled={outOfStock}>{outOfStock ? 'Unavailable' : 'Add to cart'}</button>
      </div>
    </article>
  )
}
