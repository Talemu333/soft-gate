import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([])

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('softgate-token')) {
      setItems([])
      return
    }
    try {
      const data = await api.getWishlist()
      setItems(data.items || [])
    } catch (error) {
      if (error.message !== 'Unauthorized.') setItems([])
    }
  }, [])

  useEffect(() => {
    refresh()
    const sync = () => refresh()
    window.addEventListener('softgate-auth-updated', sync)
    return () => window.removeEventListener('softgate-auth-updated', sync)
  }, [refresh])

  const toggleWishlist = useCallback(async (product) => {
    if (!localStorage.getItem('softgate-token')) throw new Error('Please sign in to use your wishlist.')
    const exists = items.some((item) => item.id === product.id)
    if (exists) {
      await api.removeWishlist(product.id)
      setItems((current) => current.filter((item) => item.id !== product.id))
    } else {
      const data = await api.toggleWishlist(product.id)
      setItems(data.items || [...items, product])
    }
  }, [items])

  const isWishlisted = useCallback((id) => items.some((item) => item.id === id), [items])

  const value = useMemo(() => ({ items, toggleWishlist, isWishlisted, count: items.length, refresh }), [items, toggleWishlist, isWishlisted, refresh])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const value = useContext(WishlistContext)
  if (!value) throw new Error('useWishlist must be used inside WishlistProvider')
  return value
}
