import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { profile, isAdmin, signOut } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const links = [
    { to: '/loja', label: 'Loja' },
    { to: '/feed', label: 'Feed' },
    { to: '/encomendas', label: 'Encomendas' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 'var(--nav-h)',
      background: 'rgba(245, 240, 232, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      zIndex: 100,
      display: 'flex', alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        {/* Logo */}
        <Link to="/loja" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>🍷</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--burgundy)', letterSpacing: '0.02em' }}>
            Clube dos Vinhos
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hide-mobile" style={{ display: 'flex', gap: 4 }}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="btn btn-ghost"
              style={{
                fontSize: '0.82rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: location.pathname.startsWith(l.to) ? 'var(--burgundy)' : 'var(--ink-2)',
                fontWeight: location.pathname.startsWith(l.to) ? '500' : '300',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Direita: carrinho + perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/carrinho" className="btn btn-ghost btn-sm" style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                background: 'var(--burgundy)', color: 'white',
                borderRadius: '50%', width: 16, height: 16,
                fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {count}
              </span>
            )}
          </Link>

          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--burgundy)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontFamily: 'var(--font-display)',
              }}>
                {profile?.nome?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="hide-mobile" style={{ fontSize: '0.82rem' }}>{profile?.nome?.split(' ')[0]}</span>
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'white', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
                minWidth: 160, overflow: 'hidden',
              }} onMouseLeave={() => setMenuOpen(false)}>
                <Link to="/perfil" onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--ink-2)' }}
                  className="btn-ghost">
                  O meu perfil
                </Link>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                <button onClick={handleSignOut}
                  style={{ display: 'block', width: '100%', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--burgundy)', textAlign: 'left', background: 'none' }}>
                  Terminar sessão
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
