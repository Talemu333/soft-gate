import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const OrderContext = createContext(null)

const readOrders = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('softgate-orders') || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const readCustomer = () => {
  try {
    return JSON.parse(localStorage.getItem('softgate-customer') || 'null')
  } catch {
    return null
  }
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(readOrders)

  useEffect(() => {
    const syncOrders = () => setOrders(readOrders())
    const syncCustomer = () => setOrders((current) => [...current])

    window.addEventListener('storage', syncOrders)
    window.addEventListener('softgate-orders-updated', syncOrders)
    window.addEventListener('softgate-customer-updated', syncCustomer)

    return () => {
      window.removeEventListener('storage', syncOrders)
      window.removeEventListener('softgate-orders-updated', syncOrders)
      window.removeEventListener('softgate-customer-updated', syncCustomer)
    }
  }, [])

  const replaceOrders = (next) => {
    setOrders(next)
    localStorage.setItem('softgate-orders', JSON.stringify(next))
    window.dispatchEvent(new Event('softgate-orders-updated'))
  }

  const createOrder = (order) => {
    const next = [order, ...orders]
    replaceOrders(next)
    return order
  }

  const updateOrderStatus = (id, status) => {
    replaceOrders(orders.map((order) => order.id === id ? { ...order, status } : order))
  }

  const getCustomerOrders = (email) => {
    if (!email) return []
    return orders.filter((order) => order.customer?.email?.toLowerCase() === email.toLowerCase())
  }

  const customers = useMemo(() => {
    const map = new Map()

    orders.forEach((order) => {
      const customer = order.customer || {}
      const key = customer.email?.toLowerCase() || customer.phone || customer.name || order.id
      const current = map.get(key) || {
        name: customer.name || 'Customer',
        email: customer.email || '—',
        phone: customer.phone || '—',
        orders: 0,
        spend: 0,
        lastOrder: order.date || '—',
      }
      current.orders += 1
      current.spend += Number(order.total || 0)
      current.lastOrder = order.date || current.lastOrder
      map.set(key, current)
    })

    const saved = readCustomer()
    if (saved?.email) {
      const key = saved.email.toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          name: saved.name || 'Customer',
          email: saved.email,
          phone: saved.phone || '—',
          orders: 0,
          spend: 0,
          lastOrder: 'No orders yet',
        })
      }
    }

    return [...map.values()].sort((a, b) => b.spend - a.spend)
  }, [orders])

  const value = useMemo(() => ({
    orders,
    customers,
    createOrder,
    updateOrderStatus,
    getCustomerOrders,
    replaceOrders,
  }), [orders, customers])

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrders() {
  const value = useContext(OrderContext)
  if (!value) throw new Error('useOrders must be used inside OrderProvider')
  return value
}
