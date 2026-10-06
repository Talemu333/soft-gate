import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)

  const loadOrders = async () => {
    if (!user) {
      setOrders([])
      return
    }
    setLoading(true)
    try {
      const data = user.role === 'admin'
        ? await api('/api/admin/orders')
        : await api('/api/orders/mine')
      setOrders(data.orders || [])
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    if (user?.role !== 'admin') {
      setCustomers([])
      return
    }
    const data = await api('/api/admin/customers')
    setCustomers(data.customers || [])
  }

  useEffect(() => {
    loadOrders().catch(() => setOrders([]))
    loadCustomers().catch(() => setCustomers([]))
  }, [user?.id, user?.role])

  const createOrder = async (order) => {
    const data = await api('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    })
    if (user) setOrders((current) => [data.order, ...current])
    return data.order
  }

  const updateOrderStatus = async (id, status) => {
    await api(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order))
  }

  const getCustomerOrders = (email) => {
    if (!email) return []
    return orders.filter((order) => order.customer?.email?.toLowerCase() === email.toLowerCase())
  }

  const value = useMemo(() => ({
    orders, customers, loading, createOrder, updateOrderStatus, getCustomerOrders,
    refreshOrders: loadOrders, refreshCustomers: loadCustomers,
  }), [orders, customers, loading])

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrders() {
  const value = useContext(OrderContext)
  if (!value) throw new Error('useOrders must be used inside OrderProvider')
  return value
}
