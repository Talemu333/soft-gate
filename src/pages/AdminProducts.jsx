import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { products, categories, formatPrice } from '../data/products'

const readProducts = () => {
  try { return JSON.parse(localStorage.getItem('softgate-products') || 'null') || products } catch { return products }
}

export default function AdminProducts() {
  const [items, setItems] = useState(readProducts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => items.filter((item) => {
    const term = search.trim().toLowerCase()
    return (category === 'All' || item.category === category) && (!term || `${item.name} ${item.category}`.toLowerCase().includes(term))
  }), [items, search, category])

  const save = (next) => { setItems(next); localStorage.setItem('softgate-products', JSON.stringify(next)) }
  const remove = (id) => { if (window.confirm('Remove this product from the demo catalogue?')) save(items.filter((item) => item.id !== id)) }

  const submit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const nextProduct = { id: editing?.id || Date.now(), name: data.get('name'), category: data.get('category'), price: Number(data.get('price')), oldPrice: Number(data.get('oldPrice')) || undefined, stock: Number(data.get('stock')), rating: editing?.rating || 5, reviews: editing?.reviews || 0, badge: data.get('badge') || 'New', image: editing?.image || products[0].image, description: data.get('description'), specs: editing?.specs || [] }
    save(editing ? items.map((item) => item.id === editing.id ? nextProduct : item) : [nextProduct, ...items])
    setEditing(null)
    event.currentTarget.reset()
  }

  return <main className="admin-page"><div className="admin-shell"><AdminNav active="products"/><section className="admin-main"><header className="admin-header"><div><span className="eyebrow">CATALOGUE & INVENTORY</span><h1>Products</h1><p>Manage products, pricing and stock levels.</p></div><button className="primary-button" type="button" onClick={() => setEditing({})}>+ Add product</button></header>
    <section className="admin-panel"><div className="admin-toolbar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."/><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((name) => <option key={name}>{name}</option>)}</select><span>{filtered.length} products</span></div><div className="product-admin-table"><div className="product-admin-head"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Action</span></div>{filtered.map((product) => <div className="product-admin-row" key={product.id}><div className="admin-product-name"><img src={product.image} alt=""/><span><b>{product.name}</b><small>ID #{product.id}</small></span></div><span>{product.category}</span><strong>{formatPrice(product.price)}</strong><span className={product.stock <= 7 ? 'stock-critical' : 'stock-ok'}>{product.stock} in stock</span><div className="row-actions"><button onClick={() => setEditing(product)} type="button">Edit</button><button onClick={() => remove(product.id)} type="button">Delete</button></div></div>)}</div></section>
    {editing && <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}><form className="admin-modal" onSubmit={submit}><div className="admin-modal-head"><div><span className="eyebrow">{editing.id ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</span><h2>{editing.id ? 'Update product' : 'Add product'}</h2></div><button type="button" onClick={() => setEditing(null)}>×</button></div><div className="form-grid"><label>Product name<input name="name" defaultValue={editing.name || ''} required /></label><label>Category<select name="category" defaultValue={editing.category || categories[1]}>{categories.slice(1).map((name) => <option key={name}>{name}</option>)}</select></label><label>Price<input name="price" type="number" min="0" defaultValue={editing.price || ''} required /></label><label>Old price<input name="oldPrice" type="number" min="0" defaultValue={editing.oldPrice || ''} /></label><label>Stock<input name="stock" type="number" min="0" defaultValue={editing.stock ?? ''} required /></label><label>Badge<input name="badge" defaultValue={editing.badge || ''} placeholder="New, Popular..." /></label></div><label>Description<textarea name="description" defaultValue={editing.description || ''} required /></label><button className="primary-button full" type="submit">{editing.id ? 'Save changes' : 'Add product'} →</button></form></div>}
  </section></div></main>
}

function AdminNav({ active }) { return <aside className="admin-sidebar"><div className="admin-brand"><span className="brand-mark">S</span><div><b>SOFT-GATE</b><small>ADMIN PANEL</small></div></div><nav><Link className={active === 'dashboard' ? 'active' : ''} to="/admin">▦ Dashboard</Link><Link className={active === 'products' ? 'active' : ''} to="/admin/products">▣ Products</Link><Link className={active === 'orders' ? 'active' : ''} to="/admin/orders">▤ Orders</Link><Link className={active === 'customers' ? 'active' : ''} to="/admin/customers">♙ Customers</Link></nav><Link className="admin-store-link" to="/">← Back to store</Link></aside> }
export { AdminNav }
