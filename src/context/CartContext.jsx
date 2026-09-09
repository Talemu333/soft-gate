import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('softgate-cart') || '[]') } catch { return [] }
  })

  const persist = (next) => {
    setItems(next)
    localStorage.setItem('softgate-cart', JSON.stringify(next))
  }

  const addToCart = (product, quantity = 1) => {
    const existing = items.find((item) => item.id === product.id)
    const next = existing
      ? items.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item)
      : [...items, { ...product, quantity: Math.min(quantity, product.stock) }]
    persist(next)
  }

  const updateQuantity = (id, quantity) => {
    const next = items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item)
    persist(next)
  }

  const removeFromCart = (id) => persist(items.filter((item) => item.id !== id))
  const clearCart = () => persist([])

  const value = useMemo(() => ({
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}
