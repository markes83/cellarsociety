import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const statusConfig = {
  pendente:    { label: 'Pendente',    class: 'badge-muted' },
  confirmado:  { label: 'Confirmado',  class: 'badge-gold' },
  enviado:     { label: 'Enviado',     class: 'badge-green' },
  entregue:    { label: 'Entregue',    class: 'badge-green' },
  cancelado:   { label: 'Cancelado',   class: 'badge-burgundy' },
}

export default function EncomendasPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState({})

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function fetchItems(orderId) {
    if (items[orderId]) return
    const { data } = await supabase
      .from('order_items')
      .select('*, products(nome, imagem_url, tipo)')
      .eq('order_id', orderId)
    setItems(prev => ({ ...prev, [orderId]: data || [] }))
  }

  function toggleOrder(id) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    fetchItems(id)
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <h1 style={{ marginBottom: 8 }}>As minhas encomendas</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 40, fontSize: '0.9rem' }}>
            {orders.length} encomenda{orders.length !== 1 ? 's' : ''} no total
          </p>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: 12 }}>📦</p>
              <p>Ainda não tem encomendas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map(order => {
                const sc = statusConfig[order.status] || statusConfig.pendente
                const isOpen = expanded === order.id
                return (
                  <div key={order.id} style={{
                    background: 'white', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => toggleOrder(order.id)}
                      style={{
                        width: '100%', padding: '18px 24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'none', cursor: 'pointer', gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                        <span className={`badge ${sc.class}`}>{sc.label}</span>
                        <div style={{ textAlign: 'left', minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                            Encomenda #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
                            {new Date(order.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--burgundy)' }}>
                          {Number(order.total).toFixed(2)} €
                        </span>
                        <span style={{ color: 'var(--muted)', fontSize: '0.9rem', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 24px 20px', borderTop: '1px solid var(--border)' }}>
                        {order.morada_entrega && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                            📍 {order.morada_entrega}
                          </p>
                        )}
                        {!items[order.id] ? (
                          <div style={{ padding: '20px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                        ) : (
                          <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {items[order.id].map(item => (
                              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', minWidth: 28, textAlign: 'center' }}>
                                  ×{item.quantidade}
                                </span>
                                <span style={{ flex: 1, fontSize: '0.9rem' }}>
                                  {item.products?.nome || 'Produto removido'}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                                  {(item.preco_unitario * item.quantidade).toFixed(2)} €
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
