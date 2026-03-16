import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function PerfilPage() {
  const { profile, fetchProfile, user, isAdmin } = useAuth()
  const { addToast } = useToast()
  const [nome, setNome] = useState(profile?.nome || '')
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ nome })
      .eq('id', user.id)
    setSaving(false)
    if (error) return addToast('Erro ao guardar', 'error')
    await fetchProfile(user.id)
    addToast('Perfil actualizado!', 'success')
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth: 520 }}>

          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              Conta
            </p>
            <h1>O meu perfil</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--burgundy)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '2rem',
            }}>
              {profile?.nome?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{profile?.nome}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4 }}>{user?.email}</p>
              <span className={`badge ${isAdmin ? 'badge-gold' : 'badge-muted'}`} style={{ marginTop: 6, display: 'inline-block' }}>
                {isAdmin ? 'Administrador' : 'Membro'}
              </span>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
            <h3 style={{ marginBottom: 24 }}>Editar informações</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label>Nome</label>
                <input className="input" value={nome}
                  onChange={e => setNome(e.target.value)} placeholder="O seu nome" />
              </div>
              <div className="input-group">
                <label>E-mail</label>
                <input className="input" value={user?.email || ''} disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'A guardar...' : 'Guardar alterações'}
              </button>
            </form>
          </div>

          <div style={{
            marginTop: 20, padding: '14px 18px',
            background: 'rgba(92,26,26,0.04)', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              Membro desde{' '}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
