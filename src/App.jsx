function App() {
  return (
    <main className="site-shell">
      <nav className="navbar">
        <a className="brand" href="#top" aria-label="Soft-Gate home">
          <span className="brand-mark">S</span>
          <span>
            <strong>SOFT-GATE</strong>
            <small>ENTERPRISES COMPUTER</small>
          </span>
        </a>

        <div className="nav-links" aria-label="Main navigation">
          <a href="#top">Home</a>
          <a href="#products">Products</a>
          <a href="#categories">Categories</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        <button className="cart-button" type="button" aria-label="Shopping cart">
          <span>Cart</span>
          <b>0</b>
        </button>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">YOUR TRUSTED TECH STORE</span>
          <h1>Technology that <em>works</em> for you.</h1>
          <p>
            Shop quality laptops, computers, accessories and office technology
            from a store built around value, reliability and great service.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#products">Shop products <span>→</span></a>
            <a className="secondary-button" href="#categories">Explore categories</a>
          </div>
          <div className="trust-row">
            <div><strong>Quality</strong><span>Carefully selected tech</span></div>
            <div><strong>Reliable</strong><span>Products you can count on</span></div>
            <div><strong>Support</strong><span>Here when you need us</span></div>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="glow" />
          <div className="laptop">
            <div className="screen">
              <div className="screen-brand">S</div>
              <div className="screen-line" />
              <div className="screen-line short" />
              <div className="screen-cards"><i /><i /><i /></div>
            </div>
            <div className="base" />
          </div>
          <div className="floating-card card-one"><span>NEW</span><strong>Premium<br />Laptops</strong></div>
          <div className="floating-card card-two"><strong>Fast &amp;<br />Reliable</strong><span>Tech solutions</span></div>
        </div>
      </section>

      <section className="section categories" id="categories">
        <div className="section-heading">
          <div><span className="eyebrow">SHOP BY CATEGORY</span><h2>Everything you need.</h2></div>
          <p>From everyday computing to complete office setups.</p>
        </div>
        <div className="category-grid">
          <article><span className="category-icon">▣</span><h3>Laptops</h3><p>Business &amp; personal</p><span className="arrow">↗</span></article>
          <article><span className="category-icon">▤</span><h3>Desktops</h3><p>Powerful workstations</p><span className="arrow">↗</span></article>
          <article><span className="category-icon">⌨</span><h3>Accessories</h3><p>Complete your setup</p><span className="arrow">↗</span></article>
          <article><span className="category-icon">▥</span><h3>Office Tech</h3><p>Print, scan &amp; connect</p><span className="arrow">↗</span></article>
        </div>
      </section>

      <section className="section product-preview" id="products">
        <div className="section-heading">
          <div><span className="eyebrow">FEATURED PRODUCTS</span><h2>Built for your next move.</h2></div>
          <a className="text-link" href="#products">View all products →</a>
        </div>
        <div className="product-grid">
          <article className="product-card"><div className="product-image laptop-icon">▱</div><span className="tag">POPULAR</span><h3>Business Laptop</h3><p>Professional performance for work and study.</p><strong>₦450,000</strong></article>
          <article className="product-card"><div className="product-image monitor-icon">▱</div><span className="tag">NEW</span><h3>24&quot; Full HD Monitor</h3><p>Sharp visuals for work, design and entertainment.</p><strong>₦185,000</strong></article>
          <article className="product-card"><div className="product-image accessory-icon">⌨</div><span className="tag">BEST VALUE</span><h3>Wireless Keyboard &amp; Mouse</h3><p>Clean, comfortable and ready for every desk.</p><strong>₦35,000</strong></article>
        </div>
      </section>

      <section className="why" id="about">
        <div><span className="eyebrow">WHY SOFT-GATE</span><h2>A better way to shop for tech.</h2></div>
        <div className="why-grid">
          <div><b>01</b><h3>Quality first</h3><p>We focus on dependable products that deliver real value.</p></div>
          <div><b>02</b><h3>Helpful service</h3><p>Get straightforward guidance before and after your purchase.</p></div>
          <div><b>03</b><h3>Ready for business</h3><p>Equip your home, school or office with confidence.</p></div>
        </div>
      </section>

      <footer id="contact">
        <div><a className="brand footer-brand" href="#top"><span className="brand-mark">S</span><span><strong>SOFT-GATE</strong><small>ENTERPRISES COMPUTER</small></span></a><p>Computers, accessories and technology solutions.</p></div>
        <div><span>CONTACT</span><p>Sales &amp; support<br />Lagos, Nigeria</p></div>
        <div><span>SHOP</span><p>Laptops · Desktops<br />Accessories · Office Tech</p></div>
      </footer>
    </main>
  )
}

export default App
