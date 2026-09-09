import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { products, categories } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') || '')
  const [sort, setSort] = useState('featured')
  const category = params.get('category') || 'All'
  const [maxPrice, setMaxPrice] = useState(800000)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = products.filter((p) => (category === 'All' || p.category === category) && p.name.toLowerCase().includes(term) && p.price <= maxPrice)
    if (sort === 'low') list.sort((a, b) => a.price - b.price)
    if (sort === 'high') list.sort((a, b) => b.price - a.price)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [category, search, sort, maxPrice])

  const chooseCategory = (value) => setParams(value === 'All' ? {} : { category: value })

  return <main className="catalog-page">
    <div className="catalog-header"><div><span className="eyebrow">SOFT-GATE STORE</span><h1>Shop all products</h1><p>Quality technology for work, study, business and everyday life.</p></div><div className="catalog-count">{filtered.length} products</div></div>
    <div className="catalog-body">
      <aside className="filters-panel"><div className="filter-title">Categories</div>{categories.map((c) => <button key={c} className={category === c ? 'selected' : ''} onClick={() => chooseCategory(c)}>{c}<span>›</span></button>)}<div className="filter-title price-title">Price</div><input type="range" min="10000" max="800000" step="10000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}/><div className="price-range">₦10k <b>₦{Math.round(maxPrice / 1000)}k</b></div></aside>
      <section className="catalog-results"><div className="catalog-toolbar"><div className="mobile-category"><select value={category} onChange={(e) => chooseCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></div><label className="catalog-search">⌕<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."/></label><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Sort: Featured</option><option value="low">Price: Low to high</option><option value="high">Price: High to low</option><option value="rating">Top rated</option></select></div>{filtered.length ? <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <div className="empty-state"><div>⌕</div><h2>No products found</h2><p>Try another search or category.</p><button className="primary-button" onClick={() => {setSearch(''); setMaxPrice(800000); chooseCategory('All')}}>Clear filters</button></div>}</section>
    </div>
  </main>
}
