import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Navbar from '../components/Navbar'

function Stars({ nota, onSelect }) {
  return (
    <div className="stars" style={{ gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={onSelect ? () => onSelect(n) : undefined}
          style={{
            fontSize: '1.1rem',
            cursor: onSelect ? 'pointer' : 'default',
            color: n <= nota ? 'var(--gold)' : 'var(--cream-dark)',
          }}
        >★</span>
      ))}
    </div>
  )
}

export default function FeedPage() {
  const { user, profile } = useAuth()
  const { addToast } = useToast()
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [userLikes, setUserLikes] = useState(new Set())

  // Formulário nova review
  const [form, setForm] = useState({ product_id: '', nota: 5, comentario: '', foto_url: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
    fetchProducts()
    fetchUserLikes()
  }, [])

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(nome, avatar_url), products(nome, tipo, regiao)')
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('id, nome').eq('visible', true).order('nome')
    setProducts(data || [])
  }

  async function fetchUserLikes() {
    const { data } = await supabase.from('review_likes').select('review_id').eq('user_id', user.id)
    setUserLikes(new Set((data || []).map(l => l.review_id)))
  }

  async function toggleLike(reviewId, currentCount) {
    const liked = userLikes.has(reviewId)
    if (liked) {
      await supabase.from('review_likes').delete().match({ user_id: user.id, review_id: reviewId })
      await supabase.from('reviews').update({ likes_count: currentCount - 1 }).eq('id', reviewId)
      setUserLikes(prev => { const s = new Set(prev); s.delete(reviewId); return s })
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes_count: r.likes_count - 1 } : r))
    } else {
      await supabase.from('review_likes').insert({ user_id: user.id, review_id: reviewId })
      await supabase.from('reviews').update({ likes_count: currentCount + 1 }).eq('id', reviewId)
      setUserLikes(prev => new Set([...prev, reviewId]))
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes_count: r.likes_count + 1 } : r))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.product_id) return addToast('Escolha um vinho', 'error')
    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: form.product_id,
      nota: form.nota,
      comentario: form.comentario || null,
      foto_url: form.foto_url || null,
    })
    setSubmitting(false)
    if (error) return addToast('Erro ao publicar', 'error')
    addToast('Avaliação publicada!', 'success')
    setShowForm(false)
    setForm({ product_id: '', nota: 5, comentario: '', foto_url: '' })
    fetchReviews()
  }

  async function handleDelete(reviewId) {
    if (!confirm('Apagar esta avaliação?')) return
    await supabase.from('reviews').delete().eq('id', reviewId)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
    addToast('Avaliação apagada', 'info')
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth: 680 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                Comunidade
              </p>
              <h1>Feed de vinhos</h1>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancelar' : '+ Partilhar avaliação'}
            </button>
          </div>

          {/* Formulário nova avaliação */}
          {showForm && (
            <div style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 24,
              marginBottom: 32,
            }}>
              <h3 style={{ marginBottom: 20 }}>Nova avaliação</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Vinho</label>
                  <select className="input" value={form.product_id}
                    onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
                    <option value="">Escolher vinho...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label>Nota</label>
                  <Stars nota={form.nota} onSelect={n => setForm(f => ({ ...f, nota: n }))} />
                </div>

                <div className="input-group">
                  <label>Comentário</label>
                  <textarea className="input" value={form.comentario}
                    onChange={e => setForm(f => ({ ...f, comentario: e.target.value }))}
                    placeholder="Partilhe a sua experiência com este vinho..."
                    rows={4} style={{ resize: 'vertical' }} />
                </div>

                <div className="input-group">
                  <label>URL de fotografia (opcional)</label>
                  <input className="input" value={form.foto_url}
                    onChange={e => setForm(f => ({ ...f, foto_url: e.target.value }))}
                    placeholder="https://..." />
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'A publicar...' : 'Publicar avaliação'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews */}
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: 12 }}>🍷</p>
              <p>Ainda não há avaliações. Seja o primeiro!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {reviews.map(review => (
                <div key={review.id} style={{
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                }}>
                  {review.foto_url && (
                    <img src={review.foto_url} alt="foto"
                      style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '18px 20px' }}>

                    {/* Cabeçalho */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'var(--burgundy)', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontSize: '1rem',
                        }}>
                          {review.profiles?.nome?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 400, fontSize: '0.9rem' }}>{review.profiles?.nome}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                            {new Date(review.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      {review.user_id === user.id && (
                        <button onClick={() => handleDelete(review.id)}
                          style={{ background: 'none', color: 'var(--muted)', fontSize: '0.75rem', padding: 4 }}>
                          Apagar
                        </button>
                      )}
                    </div>

                    {/* Vinho */}
                    {review.products && (
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--burgundy)' }}>
                          {review.products.nome}
                        </p>
                        {review.products.regiao && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{review.products.regiao}</p>
                        )}
                      </div>
                    )}

                    <Stars nota={review.nota} />

                    {review.comentario && (
                      <p style={{ marginTop: 10, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--ink-2)' }}>
                        {review.comentario}
                      </p>
                    )}

                    {/* Like */}
                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => toggleLike(review.id, review.likes_count)}
                        style={{
                          background: 'none', border: 'none',
                          display: 'flex', alignItems: 'center', gap: 5,
                          color: userLikes.has(review.id) ? 'var(--burgundy)' : 'var(--muted)',
                          fontSize: '0.85rem', cursor: 'pointer', padding: '4px 0',
                          transition: 'color 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '1rem' }}>{userLikes.has(review.id) ? '♥' : '♡'}</span>
                        {review.likes_count > 0 && review.likes_count}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
