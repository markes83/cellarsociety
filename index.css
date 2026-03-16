import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'

const EMPTY_FORM = {
  nome: '', descricao: '', preco: '', stock: '',
  imagem_url: '', regiao: '', ano: '', casta: '',
  tipo: 'tinto', visible: true,
}

const statusConfig = {
  pendente:   { label: 'Pendente',  class: 'badge-muted' },
  confirmado: { label: 'Confirmado', class: 'badge-gold' },
  enviado:    { label: 'Enviado',   class: 'badge-green' },
  entregue:   { label: 'Entregue', class: 'badge-green' },
  cancelado:  { label: 'Cancelado', class: 'badge-burgundy' },
}

const STATUS_OPTIONS = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado']

export default function AdminPage() {
  const { addToast } = useToast()
  const [tab, setTab] = useState('produtos')

  // Produtos
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Encomendas
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState({})

  // Membros
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchOrders()
    fetchMembers()
  }, [])

  // ── PRODUTOS ──────────────────────────────────────────────
  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoadingProducts(false)
  }

  function openNew() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openEdit(product) {
    setForm({
      nome: product.nome || '',
      descricao: product.descricao || '',
      preco: product.preco || '',
      stock: product.stock || '',
      imagem_url: product.imagem_url || '',
      regiao: product.regiao || '',
      ano: product.ano || '',
      casta: product.casta || '',
      tipo: product.tipo || 'tinto',
      visible: product.visible ?? true,
    })
    setEditingId(product.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSaveProduct(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      preco: parseFloat(form.preco),
      stock: parseInt(form.stock, 10),
      ano: form.ano ? parseInt(form.ano, 10) : null,
    }
    let error
    if (editingId) {
      ;({ error } = await supabase.from('products').update(payload).eq('id', editingId))
    } else {
      ;({ error } = await supabase.from('products').insert(payload))
    }
    setSaving(false)
    if (error) return addToast('Erro ao guardar produto', 'error')
    addToast(editingId ? 'Produto actualizado!' : 'Produto criado!', 'success')
    setShowForm(false)
    setEditingId(null)
    fetchProducts()
  }

  async function toggleVisible(product) {
    const { error } = await supabase
      .from('products')
      .update({ visible: !product.visible })
      .eq('id', product.id)
    if (error) return addToast('Erro ao actualizar visibilidade', 'error')
    addToast(`Produto ${!product.visible ? 'visível' : 'ocultado'}`, 'success')
    fetchProducts()
  }

  async function handleDeleteProduct(id) {
    if (!confirm('Apagar este produto definitivamente?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return addToast('Erro ao apagar produto', 'error')
    addToast('Produto apagado', 'info')
    fetchProducts()
  }

  // ── ENCOMENDAS ────────────────────────────────────────────
  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(nome)')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoadingOrders(false)
  }

  async function fetchOrderItems(orderId) {
    if (orderItems[orderId]) return
    const { data } = await supabase
      .from('order_items')
      .select('*, products(nome)')
      .eq('order_id', orderId)
    setOrderItems(prev => ({ ...prev, [orderId]: data || [] }))
  }

  function toggleOrder(id) {
    if (expandedOrder === id) { setExpandedOrder(null); return }
    setExpandedOrder(id)
    fetchOrderItems(id)
  }

  async function updateOrderStatus(orderId, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) return addToast('Erro ao actualizar estado', 'error')
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    addToast('Estado actualizado', 'success')
  }

  // ── MEMBROS ───────────────────────────────────────────────
  async function fetchMembers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setMembers(data || [])
    setLoadingMembers(false)
  }

  async function toggleRole(member) {
    const newRole = member.role === 'admin' ? 'member' : 'admin'
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', member.id)
    if (error) return addToast('Erro ao actualizar papel', 'error')
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: newRole } : m))
    addToast(`${member.nome} é agora ${newRole === 'admin' ? 'administrador' : 'membro'}`, 'success')
  }

  const tabStyle = (t) => ({
    padding: '10px 20px',
    borderBottom: tab === t ? '2px solid var(--burgundy)' : '2px solid transparent',
    color: tab === t ? 'var(--burgundy)' : 'var(--muted)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    background: 'none',
    cursor: 'pointer',
    fontWeight: tab === t ? '500' : '300',
    transition: 'color 0.15s',
  })

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">

          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              Painel de controlo
            </p>
            <h1>Administração</h1>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32, gap: 4 }}>
            {['produtos', 'encomendas', 'membros'].map(t => (
              <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* ── PRODUTOS ── */}
          {tab === 'produtos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  {products.length} produto{products.length !== 1 ? 's' : ''} no inventário
                </p>
                <button className="btn btn-primary" onClick={openNew}>+ Novo produto</button>
              </div>

              {showForm && (
                <div style={{
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 32,
                }}>
                  <h3 style={{ marginBottom: 24 }}>{editingId ? 'Editar produto' : 'Novo produto'}</h3>
                  <form onSubmit={handleSaveProduct}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Nome *</label>
                        <input className="input" value={form.nome} required
                          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                          placeholder="Ex: Quinta do Crasto Reserva 2020" />
                      </div>
                      <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Descrição</label>
                        <textarea className="input" value={form.descricao} rows={3}
                          onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                          style={{ resize: 'vertical' }} placeholder="Notas de prova, características..." />
                      </div>
                      <div className="input-group">
                        <label>Preço (€) *</label>
                        <input className="input" type="number" step="0.01" min="0" required
                          value={form.preco} onChange={e => setForm(f => ({ ...f, preco: e.target.value }))}
                          placeholder="0.00" />
                      </div>
                      <div className="input-group">
                        <label>Stock *</label>
                        <input className="input" type="number" min="0" required
                          value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                          placeholder="0" />
                      </div>
                      <div className="input-group">
                        <label>Tipo</label>
                        <select className="input" value={form.tipo}
                          onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                          {['tinto', 'branco', 'rosé', 'espumante', 'sobremesa'].map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Região</label>
                        <input className="input" value={form.regiao}
                          onChange={e => setForm(f => ({ ...f, regiao: e.target.value }))}
                          placeholder="Ex: Douro, Alentejo..." />
                      </div>
                      <div className="input-group">
                        <label>Ano</label>
                        <input className="input" type="number" min="1900" max="2099"
                          value={form.ano} onChange={e => setForm(f => ({ ...f, ano: e.target.value }))}
                          placeholder="2020" />
                      </div>
                      <div className="input-group">
                        <label>Casta</label>
                        <input className="input" value={form.casta}
                          onChange={e => setForm(f => ({ ...f, casta: e.target.value }))}
                          placeholder="Ex: Touriga Nacional, Alvarinho..." />
                      </div>
                      <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label>URL da imagem</label>
                        <input className="input" value={form.imagem_url}
                          onChange={e => setForm(f => ({ ...f, imagem_url: e.target.value }))}
                          placeholder="https://..." />
                      </div>
                      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="checkbox" id="visible" checked={form.visible}
                          onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))}
                          style={{ width: 16, height: 16, accentColor: 'var(--burgundy)' }} />
                        <label htmlFor="visible" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                          Visível na loja
                        </label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'A guardar...' : (editingId ? 'Actualizar' : 'Criar produto')}
                      </button>
                      <button type="button" className="btn btn-outline"
                        onClick={() => { setShowForm(false); setEditingId(null) }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loadingProducts ? (
                <div className="loading-center"><div className="spinner" /></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                  {products.map(p => (
                    <div key={p.id}>
                      <ProductCard product={p} onAdminToggle={toggleVisible} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(p)}>Editar</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--burgundy)' }}
                          onClick={() => handleDeleteProduct(p.id)}>Apagar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ENCOMENDAS ── */}
          {tab === 'encomendas' && (
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>
                {orders.length} encomenda{orders.length !== 1 ? 's' : ''} no total
              </p>
              {loadingOrders ? (
                <div className="loading-center"><div className="spinner" /></div>
              ) : orders.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '60px 0' }}>Sem encomendas ainda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {orders.map(order => {
                    const sc = statusConfig[order.status] || statusConfig.pendente
                    const isOpen = expandedOrder === order.id
                    return (
                      <div key={order.id} style={{
                        background: 'white', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                          <button onClick={() => toggleOrder(order.id)}
                            style={{ flex: 1, background: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <span className={`badge ${sc.class}`}>{sc.label}</span>
                            <div>
                              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>
                                #{order.id.slice(-6).toUpperCase()} — {order.profiles?.nome || 'Membro'}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                                {new Date(order.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </button>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--burgundy)' }}>
                            {Number(order.total).toFixed(2)} €
                          </span>
                          <select className="input" value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                            onClick={e => e.stopPropagation()} style={{ width: 130 }}>
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{statusConfig[s].label}</option>
                            ))}
                          </select>
                        </div>
                        {isOpen && (
                          <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border)' }}>
                            {order.morada_entrega && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                📍 {order.morada_entrega}
                              </p>
                            )}
                            {!orderItems[order.id] ? (
                              <div style={{ padding: 16 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                            ) : (
                              <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {orderItems[order.id].map(item => (
                                  <div key={item.id} style={{ display: 'flex', gap: 10, fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--muted)', minWidth: 24 }}>×{item.quantidade}</span>
                                    <span style={{ flex: 1 }}>{item.products?.nome || '—'}</span>
                                    <span style={{ color: 'var(--muted)' }}>{(item.preco_unitario * item.quantidade).toFixed(2)} €</span>
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
          )}

          {/* ── MEMBROS ── */}
          {tab === 'membros' && (
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 24 }}>
                {members.length} membro{members.length !== 1 ? 's' : ''} registado{members.length !== 1 ? 's' : ''}
              </p>
              {loadingMembers ? (
                <div className="loading-center"><div className="spinner" /></div>
              ) : (
                <div style={{
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                }}>
                  {members.map((member, i) => (
                    <div key={member.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 20px',
                      borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: member.role === 'admin' ? 'var(--gold)' : 'var(--burgundy)',
                        color: 'white', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontFamily: 'var(--font-display)',
                        fontSize: '1rem', flexShrink: 0,
                      }}>
                        {member.nome?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.9rem' }}>{member.nome}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                          Desde {new Date(member.created_at).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`badge ${member.role === 'admin' ? 'badge-gold' : 'badge-muted'}`}>
                        {member.role === 'admin' ? 'Admin' : 'Membro'}
                      </span>
                      <button className="btn btn-outline btn-sm" onClick={() => toggleRole(member)}>
                        {member.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
