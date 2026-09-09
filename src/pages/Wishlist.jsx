import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const { items } = useWishlist()
  return (
    <main className="section account-page">
      <div className="page-intro"><span className="eyebrow">MY SHOPPING</span><h1>Wishlist</h1><p>Save products you want to come back to later.</p></div>
      {items.length ? <div className="product-grid">{items.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><div className="empty-icon">♡</div><h2>Your wishlist is empty</h2><p>Tap the heart on any product to save it here.</p><Link className="primary-button" to="/shop">Browse products</Link></div>}
    </main>
  )
}
