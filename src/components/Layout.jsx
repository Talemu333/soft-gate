import { Link, NavLink } from 'react-router-dom'

export default function Layout({ children, cartCount = 0 }) {
  const nav = [
    ['Home', '/'],
    ['Shop', '/shop'],
    ['About', '/about'],
    ['Contact', '/contact'],
  ]

  return (
    <div className="app-shell">
      <div className="announcement">Quality computers &amp; technology solutions · Trusted service · Nationwide delivery</div>
      <header className="navbar">
        <Link className="brand" to="/">
          <span className="brand-mark">S</span>
          <span><strong>SOFT-GATE</strong><small>ENTERPRISES COMPUTER</small></span>
        </Link>
        <nav className="nav-links">
          {nav.map(([label, path]) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>)}
        </nav>
        <div className="nav-actions">
          <Link className="account-link" to="/login">Account</Link>
          <Link className="cart-button" to="/cart">Cart <b>{cartCount}</b></Link>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <div><Link className="brand footer-brand" to="/"><span className="brand-mark">S</span><span><strong>SOFT-GATE</strong><small>ENTERPRISES COMPUTER</small></span></Link><p>Computers, accessories and technology solutions you can count on.</p></div>
        <div><h4>Shop</h4><Link to="/shop?category=Laptops">Laptops</Link><Link to="/shop?category=Desktops">Desktops</Link><Link to="/shop?category=Accessories">Accessories</Link></div>
        <div><h4>Company</h4><Link to="/about">About us</Link><Link to="/contact">Contact</Link><Link to="/login">My account</Link></div>
        <div><h4>Support</h4><p>Sales &amp; support<br />Lagos, Nigeria<br />Mon–Sat · 8am–6pm</p></div>
      </footer>
      <div className="copyright">© 2026 Soft-Gate Enterprises Computer. All rights reserved.</div>
    </div>
  )
}
