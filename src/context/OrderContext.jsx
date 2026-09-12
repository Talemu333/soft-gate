import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([])

  const refreshOrders = useCallback(async () => {
    if (!localStorage.getItem('softgate-token')) {
      setOrders([])
      return []
    }
    try {
      const data = await api.getMyOrders()
      const next = data.orders || []
      setOrders(next)
      return next
    } catch {
      setOrders([])
      return []
    }
  }, [])

  useEffect(() => {
    refreshOrders()
    const sync = () => refreshOrders()
    window.addEventListener('softgate-auth-updated', sync)
    return () => window.removeEventListener('softgate-auth-updated', sync)
  }, [refreshOrders])

  const createOrder = useCallback(async (order) => {
    const data = await api.createOrder({
      customer: order.customer,
      items: (order.items || []).map((item) => ({
        productId: item.productId ?? item.id,
        quantity: Number(item.quantity || item.qty || 1),
      })),
      payment: order.payment || 'transfer',
    })
    const created = data.order
    const next = await refreshOrders()
    return next.find((item) => item.id === created.orderNumber) || created
  }, [refreshOrders])

  const updateOrderStatus = useCallback(async (id, status) => {
    await api.updateOrderStatus(id, status)
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order))
  }, [])

  const getCustomerOrders = useCallback((email) => {
    if (!email) return []
    return orders.filter((order) => order.customer?.email?.toLowerCase() === email.toLowerCase())
  }, [orders])

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
    return [...map.values()].sort((a, b) => b.spend - a.spend)
  }, [orders])

  const replaceOrders = useCallback((next) => setOrders(Array.isArray(next) ? next : []), [])

  const value = useMemo(() => ({
    orders,
    customers,
    createOrder,
    updateOrderStatus,
    getCustomerOrders,
    replaceOrders,
    refreshOrders,
  }), [orders, customers, createOrder, updateOrderStatus, getCustomerOrders, replaceOrders, refreshOrders])

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrders() {
  const value = useContext(OrderContext)
  if (!value) throw new Error('useOrders must be used inside OrderProvider')
  return value
}
