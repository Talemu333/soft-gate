import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-media">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        <button className="wishlist" type="button" onClick={(e) => e.preventDefault()} aria-label="Add to wishlist">♡</button>
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-info">
        <Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link>
        <div className="product-rating"><span>★★★★★</span> <b>{product.rating}</b> <small>({product.reviews})</small></div>
        <div className="price-row"><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div>
        <p className={product.stock <= 6 ? 'low-stock' : 'in-stock'}>{product.stock <= 6 ? `Only ${product.stock} left` : '✓ In stock'}</p>
        <button className="add-button" type="button" onClick={() => addToCart(product)}>Add to Cart</button>
      </div>
    </article>
  )
}
