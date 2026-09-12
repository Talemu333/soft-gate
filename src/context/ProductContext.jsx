import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async () => {
    try { setError(''); const data = await api.getProducts(); setProducts(data.products || []) }
    catch (err) { setError(err.message); setProducts([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])
  const addProduct = async (product) => { const data = await api.createProduct(product); setProducts((current) => [...current, data.product]); return data.product }
  const updateProduct = async (id, changes) => { const data = await api.updateProduct(id, changes); setProducts((current) => current.map((p) => p.id === id ? data.product : p)); return data.product }
  const removeProduct = async (id) => { await api.deleteProduct(id); setProducts((current) => current.filter((p) => p.id !== id)) }
  const replaceProducts = refresh
  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category).filter(Boolean))], [products])
  const value = useMemo(() => ({ products, categories, loading, error, refresh, addProduct, updateProduct, removeProduct, replaceProducts }), [products, categories, loading, error])
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() { const value = useContext(ProductContext); if (!value) throw new Error('useProducts must be used inside ProductProvider'); return value }
