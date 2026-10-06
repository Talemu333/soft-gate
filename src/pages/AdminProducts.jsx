import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/format'
import { useProducts } from '../context/ProductContext'

export default function AdminProducts() {
  const { adminProducts, adminCategories, loadAdminProducts, addProduct, updateProduct, removeProduct } = useProducts()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('active')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAdminProducts().catch((err) => setError(err.message))
  }, [])

  const filtered = useMemo(() => adminProducts.filter((item) => {
    const term = search.trim().toLowerCase()
    const matchesStatus = status === 'all' || (status === 'active' ? item.active : !item.active)
    return matchesStatus && (category === 'All' || item.category === category) && (!term || `${item.name} ${item.category}`.toLowerCase().includes(term))
  }), [adminProducts, search, category, status])

  const remove = async (id) => {
    if (!window.confirm('Remove this product from the storefront?')) return
    try {
      await removeProduct(id)
    } catch (err) { setError(err.message) }
  }

  const restore = async (product) => {
    try {
      await updateProduct(product.id, { ...product, active: true })
    } catch (err) { setError(err.message) }
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    const nextProduct = {
      name: data.get('name'), category: data.get('category'), price: Number(data.get('price')),
      oldPrice: Number(data.get('oldPrice')) || undefined, stock: Number(data.get('stock')),
      rating: editing?.rating || 5, reviews: editing?.reviews || 0, badge: data.get('badge') || 'New',
      image: editing?.image || adminProducts.find((product) => product.active)?.image || '', description: data.get('description'),
      specs: editing?.specs || [], active: editing?.active !== false,
    }

    try {
      if (editing?.id) await updateProduct(editing.id, nextProduct)
      else await addProduct(nextProduct)
      setEditing(null)
      event.currentTarget.reset()
    } catch (err) { setError(err.message) }
  }

  return <main className="admin-page"><div className="admin-shell"><AdminNav active="products"/><section className="admin-main"><header className="admin-header"><div><span className="eyebrow">CATALOGUE & INVENTORY</span><h1>Products</h1><p>Manage products, pricing and stock levels.</p></div><button className="primary-button" type="button" onClick={() => setEditing({})}>+ Add product</button></header>
    {error && <div className="admin-demo-note" role="alert">{error}</div>}
    <section className="admin-panel"><div className="admin-toolbar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."/><select value={category} onChange={(e) => setCategory(e.target.value)}>{adminCategories.map((name) => <option key={name}>{name}</option>)}</select><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="active">Active</option><option value="inactive">Removed</option><option value="all">All</option></select><span>{filtered.length} products</span></div><div className="product-admin-table"><div className="product-admin-head"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Action</span></div>{filtered.map((product) => <div className="product-admin-row" key={product.id}><div className="admin-product-name"><img src={product.image} alt=""/><span><b>{product.name}</b><small>ID #{product.id}{!product.active ? ' · Removed' : ''}</small></span></div><span>{product.category}</span><strong>{formatPrice(product.price)}</strong><span className={product.stock <= 7 ? 'stock-critical' : 'stock-ok'}>{product.stock} in stock</span><div className="row-actions">{product.active ? <><button onClick={() => setEditing(product)} type="button">Edit</button><button onClick={() => remove(product.id)} type="button">Delete</button></> : <button onClick={() => restore(product)} type="button">Restore</button>}</div></div>)}</div></section>
    {editing && <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}><form className="admin-modal" onSubmit={submit}><div className="admin-modal-head"><div><span className="eyebrow">{editing.id ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</span><h2>{editing.id ? 'Update product' : 'Add product'}</h2></div><button type="button" onClick={() => setEditing(null)}>×</button></div><div className="form-grid"><label>Product name<input name="name" defaultValue={editing.name || ''} required /></label><label>Category<select name="category" defaultValue={editing.category || adminCategories[1] || ''} required>{adminCategories.filter((name) => name !== 'All').map((name) => <option key={name}>{name}</option>)}</select></label><label>Price<input name="price" type="number" min="0" defaultValue={editing.price || ''} required /></label><label>Old price<input name="oldPrice" type="number" min="0" defaultValue={editing.oldPrice || ''} /></label><label>Stock<input name="stock" type="number" min="0" defaultValue={editing.stock ?? ''} required /></label><label>Badge<input name="badge" defaultValue={editing.badge || ''} placeholder="New, Popular..." /></label></div><label>Description<textarea name="description" defaultValue={editing.description || ''} required /></label><button className="primary-button full" type="submit">{editing.id ? 'Save changes' : 'Add product'} →</button></form></div>}
  </section></div></main>
}

function AdminNav({ active }) { return <aside className="admin-sidebar"><div className="admin-brand"><span className="brand-mark">S</span><div><b>SOFT-GATE</b><small>ADMIN PANEL</small></div></div><nav><Link className={active === 'dashboard' ? 'active' : ''} to="/admin">▦ Dashboard</Link><Link className={active === 'products' ? 'active' : ''} to="/admin/products">▣ Products</Link><Link className={active === 'orders' ? 'active' : ''} to="/admin/orders">▤ Orders</Link><Link className={active === 'customers' ? 'active' : ''} to="/admin/customers">♙ Customers</Link></nav><Link className="admin-store-link" to="/">← Back to store</Link></aside> }
export { AdminNav }
