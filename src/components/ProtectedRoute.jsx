import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ admin = false, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <main className="section"><div className="empty-state"><h1>Loading...</h1><p>Please wait while we verify your account.</p></div></main>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
