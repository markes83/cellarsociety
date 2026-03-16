import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function CarrinhoPage() {
  const { items, updateQuantidade, removeItem, clearCart, total } = useCart()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [morada, setMorada] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (!morada.trim()) return addToast('Por favor indique a morada de entrega', 'error')
    setLoading(true)

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({ user_id: user.id, total, morada_entrega: morada, notas })
      .select()
      .single()

    if (orderErr) {
      addToast('Erro ao criar encomenda', 'error')
      setLoading(false)
      return
    }

    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.product.id,
      quantidade: i.quantidade,
      preco_unitario: i.product.preco,
    }))

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)

    if (itemsErr) {
      addToast('Erro ao registar itens', 'error')
      setLoading(false)
      return
    }

    clearCart()
    addToast('Encomenda realizada com sucesso!', 'success')
    navigate('/encomendas')
  }

  if (items.length === 0) return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
          <p style={{ fontSize: '3rem', marginBottom: 16 }}>🛒</p>
          <h2 style={{ marginBottom: 12 }}>O carrinho está vazio</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Adicione alguns vinhos para continuar.</p>
          <Link to="/loja" className="btn btn-primary">Ir para a loja</Link>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <h1 style={{ marginBottom: 40 }}>Carrinho</h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>

            {/* Itens */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map(({ product, quantidade }) => (
                <div key={product.id} style={{
                  background: 'white', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 8,
                    background: 'var(--cream-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', overflow: 'hidden', flexShrink: 0,
                  }}>
                    {product.imagem_url
                      ? <img src={product.imagem_url} alt={product.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🍷'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>{product.nome}</p>
                    {product.regiao && <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{product.regiao}</p>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => updateQuantidade(product.id, quantidade - 1)}
                      style={{ width: 28, height: 28, padding: 0, fontSize: '1.1rem' }}>−</button>
                    <span style={{ minWidth: 24, textAlign: 'center' }}>{quantidade}</span>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => updateQuantidade(product.id, quantidade + 1)}
                      style={{ width: 28, height: 28, padding: 0, fontSize: '1.1rem' }}>+</button>
                  </div>

                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', minWidth: 70, textAlign: 'right' }}>
                    {(product.preco * quantidade).toFixed(2)} €
                  </p>

                  <button onClick={() => removeItem(product.id)}
                    style={{ background: 'none', color: 'var(--muted)', fontSize: '1.1rem', padding: 4 }}
                    title="Remover">×</button>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 24, position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
              <h3 style={{ marginBottom: 20 }}>Resumo da encomenda</h3>

              {items.map(({ product, quantidade }) => (
                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--muted)' }}>{product.nome} × {quantidade}</span>
                  <span>{(product.preco * quantidade).toFixed(2)} €</span>
                </div>
              ))}

              <hr className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--burgundy)' }}>
                  {total.toFixed(2)} €
                </span>
              </div>

              <div className="input-group" style={{ marginBottom: 16 }}>
                <label>Morada de entrega *</label>
                <textarea
                  className="input"
                  value={morada}
                  onChange={e => setMorada(e.target.value)}
                  placeholder="Rua, número, código postal, cidade"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 20 }}>
                <label>Notas (opcional)</label>
                <input className="input" value={notas} onChange={e => setNotas(e.target.value)}
                  placeholder="Instruções especiais..." />
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={handleCheckout}
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'A processar...' : 'Confirmar encomenda'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
