import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return (
    <div className="loading-center" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (adminOnly && !isAdmin) return <Navigate to="/loja" replace />

  return children
}
