import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ProductProvider } from './context/ProductContext'
import { OrderProvider } from './context/OrderContext'
import { api } from './lib/api'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Account from './pages/Account'
import Wishlist from './pages/Wishlist'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminCustomers from './pages/AdminCustomers'
import './account.css'
import './auth.css'
import './admin.css'

function AdminGuard({ children }) {
  const [state, setState] = useState('checking')
  useEffect(() => {
    if (!localStorage.getItem('softgate-token')) { setState('unauthenticated'); return }
    api.me().then(({ user }) => setState(user?.role === 'admin' ? 'allowed' : 'forbidden')).catch(() => setState('unauthenticated'))
  }, [])
  if (state === 'checking') return <main className="section"><div className="empty-state"><h1>Checking admin access…</h1></div></main>
  if (state === 'unauthenticated') return <Navigate to="/login" replace />
  if (state === 'forbidden') return <Navigate to="/account" replace />
  return children
}

function ProtectedAdmin({ children }) { return <AdminGuard>{children}</AdminGuard> }

export default function App() {
  return (
    <BrowserRouter>
      <ProductProvider>
        <OrderProvider>
          <CartProvider>
            <WishlistProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
                  <Route path="/admin/products" element={<ProtectedAdmin><AdminProducts /></ProtectedAdmin>} />
                  <Route path="/admin/orders" element={<ProtectedAdmin><AdminOrders /></ProtectedAdmin>} />
                  <Route path="/admin/customers" element={<ProtectedAdmin><AdminCustomers /></ProtectedAdmin>} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </Layout>
            </WishlistProvider>
          </CartProvider>
        </OrderProvider>
      </ProductProvider>
    </BrowserRouter>
  )
}
