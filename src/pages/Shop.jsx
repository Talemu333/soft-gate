import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formatPrice } from '../lib/format'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'

const PRICE_STEP = 10000

export default function Shop() {
  const { products, categories, loading, error } = useProducts()
  const [params, setParams] = useSearchParams()
  const category = params.get('category') || 'All'
  const search = params.get('search') || ''
  const sort = params.get('sort') || 'featured'
  const inStockOnly = params.get('stock') === 'in-stock'
  const maxProductPrice = Math.max(10000, ...products.map((product) => Number(product.price) || 0))
  const requestedMaxPrice = Number(params.get('maxPrice'))
  const maxPrice = Number.isFinite(requestedMaxPrice) && requestedMaxPrice >= 10000
    ? Math.min(requestedMaxPrice, maxProductPrice)
    : maxProductPrice

  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const categoryCounts = useMemo(() => categories.reduce((counts, name) => {
    counts[name] = name === 'All' ? products.length : products.filter((product) => product.category === name).length
    return counts
  }, {}), [categories, products])

  const updateParams = (changes = {}) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || value === false) next.delete(key)
      else next.set(key, String(value))
    })
    setParams(next)
  }

  const chooseCategory = (value) => updateParams({ category: value === 'All' ? null : value })
  const clearFilters = () => {
    setSearchInput('')
    setParams({})
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = products.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category
      const searchable = `${product.name} ${product.category} ${product.description} ${(product.specs || []).join(' ')}`.toLowerCase()
      const matchesSearch = searchable.includes(term)
      const matchesPrice = Number(product.price) <= maxPrice
      const matchesStock = !inStockOnly || Number(product.stock) > 0
      return matchesCategory && matchesSearch && matchesPrice && matchesStock
    })

    if (sort === 'low') list.sort((a, b) => a.price - b.price)
    if (sort === 'high') list.sort((a, b) => b.price - a.price)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    if (sort === 'discount') list.sort((a, b) => ((b.oldPrice || 0) - b.price) - ((a.oldPrice || 0) - a.price))
    return list
  }, [category, search, sort, maxPrice, inStockOnly, products])

  const hasFilters = search || category !== 'All' || maxPrice !== maxProductPrice || sort !== 'featured' || inStockOnly

  return (
    <main className="catalog-page">
      <div className="catalog-header">
        <div>
          <span className="eyebrow">SOFT-GATE STORE</span>
          <h1>{category === 'All' ? 'Shop all products' : category}</h1>
          <p>Quality technology for work, study, business and everyday life.</p>
        </div>
        <div className="catalog-count">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</div>
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
          <input
            type="range"
            min="10000"
            max={maxProductPrice}
            step={PRICE_STEP}
            value={Math.min(maxPrice, maxProductPrice)}
            onChange={(event) => updateParams({ maxPrice: event.target.value })}
            aria-label="Maximum price"
          />
          <div className="price-range"><span>₦10k</span><b>{formatPrice(maxPrice)}</b></div>

          <label className="stock-filter">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => updateParams({ stock: event.target.checked ? 'in-stock' : null })}
            />
            <span>In stock only</span>
          </label>

          {hasFilters && (
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
            <label className="catalog-search">⌕
              <input
                value={searchInput}
                onChange={(event) => {
                  const value = event.target.value
                  setSearchInput(value)
                  updateParams({ search: value.trim() || null })
                }}
                placeholder="Search products, brands or features..."
                aria-label="Search products"
              />
            </label>
            <select value={sort} onChange={(event) => updateParams({ sort: event.target.value === 'featured' ? null : event.target.value })} aria-label="Sort products">
              <option value="featured">Sort: Featured</option>
              <option value="low">Price: Low to high</option>
              <option value="high">Price: High to low</option>
              <option value="rating">Top rated</option>
              <option value="discount">Biggest savings</option>
            </select>
          </div>

          {hasFilters && (
            <div className="applied-filters" aria-label="Applied filters">
              {category !== 'All' && <button type="button" onClick={() => chooseCategory('All')}>Category: {category} ×</button>}
              {search && <button type="button" onClick={() => { setSearchInput(''); updateParams({ search: null }) }}>Search: “{search}” ×</button>}
              {inStockOnly && <button type="button" onClick={() => updateParams({ stock: null })}>In stock only ×</button>}
              {maxPrice !== maxProductPrice && <button type="button" onClick={() => updateParams({ maxPrice: null })}>Up to {formatPrice(maxPrice)} ×</button>}
              {sort !== 'featured' && <button type="button" onClick={() => updateParams({ sort: null })}>Sort: {sort === 'low' ? 'Lowest price' : sort === 'high' ? 'Highest price' : sort === 'rating' ? 'Top rated' : 'Biggest savings'} ×</button>}
            </div>
          )}

          {loading ? (
            <div className="empty-state"><h2>Loading products...</h2><p>Please wait while we load the latest Soft-Gate catalog.</p></div>
          ) : error ? (
            <div className="empty-state"><h2>We couldn't load the products</h2><p>{error}</p><button className="primary-button" onClick={() => window.location.reload()} type="button">Try again</button></div>
          ) : filtered.length ? (
            <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
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
