import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { products as seedProducts } from '../data/products'

const ProductContext = createContext(null)

function readProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem('softgate-products') || 'null')
    return Array.isArray(stored) ? stored : seedProducts
  } catch {
    return seedProducts
  }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(readProducts)

  useEffect(() => {
    const syncProducts = () => setProducts(readProducts())
    window.addEventListener('storage', syncProducts)
    window.addEventListener('softgate-products-updated', syncProducts)
    return () => {
      window.removeEventListener('storage', syncProducts)
      window.removeEventListener('softgate-products-updated', syncProducts)
    }
  }, [])

  const replaceProducts = (next) => {
    setProducts(next)
    localStorage.setItem('softgate-products', JSON.stringify(next))
    window.dispatchEvent(new Event('softgate-products-updated'))
  }

  const addProduct = (product) => replaceProducts([...products, product])
  const updateProduct = (id, changes) => replaceProducts(products.map((product) => product.id === id ? { ...product, ...changes } : product))
  const removeProduct = (id) => replaceProducts(products.filter((product) => product.id !== id))

  const categories = useMemo(() => ['All', ...new Set(products.map((product) => product.category).filter(Boolean))], [products])

  const value = useMemo(() => ({
    products,
    categories,
    addProduct,
    updateProduct,
    removeProduct,
    replaceProducts,
  }), [products, categories])

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const value = useContext(ProductContext)
  if (!value) throw new Error('useProducts must be used inside ProductProvider')
  return value
}
