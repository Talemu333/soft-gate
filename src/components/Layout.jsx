import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'

export default function Layout({ children }) {
  const { cartCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return <div className="app-shell">
    <div className="announcement">Free delivery on selected orders · Trusted technology solutions · Secure shopping</div>
    <header className="site-header">
      <div className="header-main">
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">☰</button>
        <Link className="brand" to="/"><span className="brand-mark">S</span><span><strong>SOFT-GATE</strong><small>ENTERPRISES COMPUTER</small></span></Link>
        <form className="header-search" action="/shop"><input name="search" placeholder="Search for products, brands and categories..."/><button>⌕</button></form>
        <div className="header-actions">
          <Link className="header-action" to="/login"><span className="action-icon">♙</span><span><small>Welcome</small><b>Account</b></span></Link>
          <Link className="header-action" to="/cart"><span className="action-icon">♡</span><span><small>Saved</small><b>Wishlist</b></span></Link>
          <Link className="cart-button" to="/cart"><span>Cart</span><b>{cartCount}</b></Link>
        </div>
      </div>
      <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
        <Link className="category-menu" to="/shop">☰ &nbsp; All Categories</Link>
        <NavLink to="/shop?category=Laptops">Laptops</NavLink>
        <NavLink to="/shop?category=Desktops">Desktops</NavLink>
        <NavLink to="/shop?category=Monitors">Monitors</NavLink>
        <NavLink to="/shop?category=Accessories">Accessories</NavLink>
        <NavLink to="/shop?category=Office%20Tech">Office Tech</NavLink>
        <NavLink to="/shop?category=Storage">Storage</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
    </header>
    {children}
    <footer className="site-footer">
      <div><Link className="brand footer-brand" to="/"><span className="brand-mark">S</span><span><strong>SOFT-GATE</strong><small>ENTERPRISES COMPUTER</small></span></Link><p>Computers, accessories and technology solutions you can count on.</p></div>
      <div><h4>Shop</h4><Link to="/shop?category=Laptops">Laptops</Link><Link to="/shop?category=Desktops">Desktops</Link><Link to="/shop?category=Accessories">Accessories</Link><Link to="/shop?category=Office%20Tech">Office Tech</Link></div>
      <div><h4>Customer Care</h4><Link to="/login">My account</Link><Link to="/contact">Help & contact</Link><Link to="/cart">Shopping cart</Link></div>
      <div><h4>Support</h4><p>Sales & support<br/>Lagos, Nigeria<br/>Mon–Sat · 8am–6pm</p></div>
    </footer>
    <div className="copyright">© 2026 Soft-Gate Enterprises Computer. All rights reserved.</div>
  </div>
}
