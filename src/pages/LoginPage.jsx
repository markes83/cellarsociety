import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      addToast('Credenciais inválidas. Tente novamente.', 'error')
    } else {
      navigate('/loja')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: `linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 100%)`,
    }}>
      {/* Painel esquerdo — decorativo */}
      <div className="hide-mobile" style={{
        flex: 1,
        background: 'var(--burgundy)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Círculos decorativos */}
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%', border: '1px solid rgba(245,240,232,0.1)',
          top: -100, left: -100,
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300,
          borderRadius: '50%', border: '1px solid rgba(245,240,232,0.08)',
          bottom: -80, right: -80,
        }} />

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '5rem', marginBottom: 24 }}>🍷</div>
          <h1 style={{ color: 'var(--cream)', fontSize: '2.8rem', marginBottom: 16, fontWeight: 300 }}>
            Clube dos Vinhos
          </h1>
          <p style={{
            color: 'rgba(245,240,232,0.65)',
            fontSize: '1rem',
            fontFamily: 'var(--font-body)',
            maxWidth: 300,
            lineHeight: 1.7,
            fontWeight: 300,
          }}>
            Uma selecção cuidada de vinhos excepcionais, partilhada entre membros apaixonados.
          </p>
          <div style={{
            marginTop: 48,
            display: 'flex', gap: 24, justifyContent: 'center',
            color: 'rgba(245,240,232,0.4)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            <span>Loja Privada</span>
            <span>·</span>
            <span>Feed Social</span>
            <span>·</span>
            <span>Encomendas</span>
          </div>
        </div>
      </div>

      {/* Formulário de login */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <h2 style={{ marginBottom: 8 }}>Bem-vindo de volta</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Acesso reservado a membros
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group">
              <label>E-mail</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="o.seu@email.pt"
                required
              />
            </div>

            <div className="input-group">
              <label>Palavra-passe</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: 8, width: '100%' }}
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </form>

          <p style={{ marginTop: 32, textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted)' }}>
            Não é membro? Contacte o administrador do clube.
          </p>
        </div>
      </div>
    </div>
  )
}
