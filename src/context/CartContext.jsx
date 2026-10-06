import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useProducts } from './ProductContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { products, loading: productsLoading, error: productsError } = useProducts()
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('softgate-cart') || '[]') } catch { return [] }
  })

  const persist = (next) => {
    setItems(next)
    localStorage.setItem('softgate-cart', JSON.stringify(next))
  }

  useEffect(() => {
    if (productsLoading || productsError || !products.length) return
    const catalog = new Map(products.map((product) => [Number(product.id), product]))
    let changed = false
    const next = items.map((item) => {
      const product = catalog.get(Number(item.id))
      if (!product) {
        if (item.available !== false || item.stock !== 0) changed = true
        return { ...item, stock: 0, available: false }
      }
      const stock = Number(product.stock) || 0
      const quantity = stock > 0 ? Math.min(Math.max(1, Number(item.quantity) || 1), stock) : Math.max(1, Number(item.quantity) || 1)
      if (item.name !== product.name || Number(item.price) !== Number(product.price) || Number(item.stock) !== stock || item.image !== product.image || item.available !== (stock > 0) || item.quantity !== quantity) changed = true
      return { ...item, ...product, quantity, stock, available: stock > 0 }
    })
    if (changed) persist(next)
  }, [products, productsLoading, productsError])

  const addToCart = (product, quantity = 1) => {
    const stock = Number(product.stock) || 0
    if (stock <= 0) return
    const existing = items.find((item) => item.id === product.id)
    const next = existing
      ? items.map((item) => item.id === product.id ? { ...item, ...product, stock, available: true, quantity: Math.min(item.quantity + quantity, stock) } : item)
      : [...items, { ...product, stock, available: true, quantity: Math.min(Math.max(1, quantity), stock) }]
    persist(next)
  }

  const updateQuantity = (id, quantity) => {
    const item = items.find((current) => current.id === id)
    if (!item || Number(item.stock) <= 0) return
    const next = items.map((current) => current.id === id
      ? { ...current, quantity: Math.max(1, Math.min(Math.floor(Number(quantity) || 1), Number(current.stock))) }
      : current)
    persist(next)
  }

  const removeFromCart = (id) => persist(items.filter((item) => item.id !== id))
  const clearCart = () => persist([])

  const unavailableItems = items.filter((item) => item.available === false || Number(item.stock) <= 0)
  const quantityLimitedItems = items.filter((item) => item.available !== false && Number(item.quantity) >= Number(item.stock) && Number(item.stock) > 0)

  const value = useMemo(() => ({
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    unavailableItems,
    quantityLimitedItems,
    cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }), [items, unavailableItems, quantityLimitedItems])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
