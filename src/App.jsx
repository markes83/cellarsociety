import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage      from './pages/LoginPage'
import LojaPage       from './pages/LojaPage'
import CarrinhoPage   from './pages/CarrinhoPage'
import EncomendasPage from './pages/EncomendasPage'
import FeedPage       from './pages/FeedPage'
import AdminPage      from './pages/AdminPage'
import PerfilPage     from './pages/PerfilPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/loja" replace />} />
              <Route path="/loja" element={<ProtectedRoute><LojaPage /></ProtectedRoute>} />
              <Route path="/carrinho" element={<ProtectedRoute><CarrinhoPage /></ProtectedRoute>} />
              <Route path="/encomendas" element={<ProtectedRoute><EncomendasPage /></ProtectedRoute>} />
              <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/loja" replace />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
