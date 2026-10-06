import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [adminProducts, setAdminProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProducts = async () => {
    try {
      setError('')
      const data = await api('/api/products')
      setProducts(data.products || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  const loadAdminProducts = async () => {
    const data = await api('/api/products?includeInactive=true')
    setAdminProducts(data.products || [])
    return data.products || []
  }

  const addProduct = async (product) => {
    const data = await api('/api/products', { method: 'POST', body: JSON.stringify(product) })
    setProducts((current) => [data.product, ...current])
    setAdminProducts((current) => [data.product, ...current.filter((item) => item.id !== data.product.id)])
    return data.product
  }

  const updateProduct = async (id, changes) => {
    const data = await api(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(changes) })
    if (data.product.active) {
      setProducts((current) => current.some((product) => product.id === Number(id))
        ? current.map((product) => product.id === Number(id) ? data.product : product)
        : [data.product, ...current])
    } else {
      setProducts((current) => current.filter((product) => product.id !== Number(id)))
    }
    setAdminProducts((current) => current.map((product) => product.id === Number(id) ? data.product : product))
    return data.product
  }

  const removeProduct = async (id) => {
    await api(`/api/products/${id}`, { method: 'DELETE' })
    setProducts((current) => current.filter((product) => product.id !== Number(id)))
    setAdminProducts((current) => current.map((product) => product.id === Number(id) ? { ...product, active: false } : product))
  }

  const categories = useMemo(() => ['All', ...new Set(products.map((product) => product.category).filter(Boolean))], [products])
  const adminCategories = useMemo(() => ['All', ...new Set(adminProducts.map((product) => product.category).filter(Boolean))], [adminProducts])

  const value = useMemo(() => ({
    products, adminProducts, categories, adminCategories, loading, error, refreshProducts: loadProducts,
    loadAdminProducts, addProduct, updateProduct, removeProduct,
  }), [products, adminProducts, categories, adminCategories, loading, error])

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const value = useContext(ProductContext)
  if (!value) throw new Error('useProducts must be used inside ProductProvider')
  return value
}
