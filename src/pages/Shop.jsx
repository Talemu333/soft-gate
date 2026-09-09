import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatPrice } from '../data/products'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'

const PRICE_STEP = 10000

export default function Shop() {
  const { products, categories } = useProducts()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') || '')
  const [sort, setSort] = useState('featured')
  const maxProductPrice = Math.max(10000, ...products.map((product) => Number(product.price) || 0))
  const [maxPrice, setMaxPrice] = useState(maxProductPrice)
  const category = params.get('category') || 'All'

  useEffect(() => {
    setMaxPrice(maxProductPrice)
  }, [maxProductPrice])

  const categoryCounts = useMemo(() => categories.reduce((counts, name) => {
    counts[name] = name === 'All' ? products.length : products.filter((product) => product.category === name).length
    return counts
  }, {}), [categories, products])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = products.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category
      const searchable = `${product.name} ${product.category} ${product.description} ${(product.specs || []).join(' ')}`.toLowerCase()
      return matchesCategory && searchable.includes(term) && Number(product.price) <= maxPrice && Number(product.stock) > 0
    })

    if (sort === 'low') list.sort((a, b) => a.price - b.price)
    if (sort === 'high') list.sort((a, b) => b.price - a.price)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    if (sort === 'discount') list.sort((a, b) => ((b.oldPrice || 0) - b.price) - ((a.oldPrice || 0) - a.price))
    return list
  }, [category, search, sort, maxPrice, products])

  const chooseCategory = (value) => setParams(value === 'All' ? {} : { category: value, ...(search ? { search } : {}) })
  const clearFilters = () => {
    setSearch('')
    setMaxPrice(maxProductPrice)
    setSort('featured')
    setParams({})
  }

  return (
    <main className="catalog-page">
      <div className="catalog-header">
        <div>
          <span className="eyebrow">SOFT-GATE STORE</span>
          <h1>{category === 'All' ? 'Shop all products' : category}</h1>
          <p>Quality technology for work, study, business and everyday life.</p>
        </div>
        <div className="catalog-count">{filtered.length} of {categoryCounts[category] || 0} products</div>
      </div>

      <div className="catalog-body">
        <aside className="filters-panel">
          <div className="filter-title">Categories</div>
          {categories.map((name) => (
            <button key={name} className={category === name ? 'selected' : ''} onClick={() => chooseCategory(name)} type="button">
              <span>{name}</span><span>{categoryCounts[name]}</span>
            </button>
          ))}

          <div className="filter-title price-title">Maximum price</div>
          <input type="range" min="10000" max={maxProductPrice} step={PRICE_STEP} value={Math.min(maxPrice, maxProductPrice)} onChange={(event) => setMaxPrice(Number(event.target.value))} aria-label="Maximum price" />
          <div className="price-range"><span>₦10k</span><b>{formatPrice(maxPrice)}</b></div>
          {(search || category !== 'All' || maxPrice !== maxProductPrice || sort !== 'featured') && (
            <button type="button" onClick={clearFilters} className="selected">Clear all filters <span>×</span></button>
          )}
        </aside>

        <section className="catalog-results">
          <div className="catalog-toolbar">
            <div className="mobile-category">
              <select value={category} onChange={(event) => chooseCategory(event.target.value)} aria-label="Category">
                {categories.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <label className="catalog-search">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, brands or features..." aria-label="Search products" /></label>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
              <option value="featured">Sort: Featured</option>
              <option value="low">Price: Low to high</option>
              <option value="high">Price: High to low</option>
              <option value="rating">Top rated</option>
              <option value="discount">Biggest savings</option>
            </select>
          </div>

          {filtered.length ? (
            <>
              <div className="catalog-count" style={{ marginBottom: 12 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
              <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            </>
          ) : (
            <div className="empty-state">
              <div>⌕</div>
              <h2>No products found</h2>
              <p>Try a different search, category or price range.</p>
              <button className="primary-button" onClick={clearFilters} type="button">Clear filters</button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
