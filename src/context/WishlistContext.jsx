import { createContext, useContext, useMemo, useState } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('softgate-wishlist') || '[]') } catch { return [] }
  })

  const persist = (next) => {
    setItems(next)
    localStorage.setItem('softgate-wishlist', JSON.stringify(next))
  }

  const toggleWishlist = (product) => {
    const exists = items.some((item) => item.id === product.id)
    persist(exists ? items.filter((item) => item.id !== product.id) : [...items, product])
  }

  const isWishlisted = (id) => items.some((item) => item.id === id)

  const value = useMemo(() => ({ items, toggleWishlist, isWishlisted, count: items.length }), [items])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const value = useContext(WishlistContext)
  if (!value) throw new Error('useWishlist must be used inside WishlistProvider')
  return value
}
