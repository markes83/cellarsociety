import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import Navbar from '../components/Navbar'

const TIPOS = ['todos', 'tinto', 'branco', 'rosé', 'espumante', 'sobremesa']

export default function LojaPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('visible', true)
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = products.filter(p => {
    const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo
    const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase())
      || p.regiao?.toLowerCase().includes(search.toLowerCase())
      || p.casta?.toLowerCase().includes(search.toLowerCase())
    return matchTipo && matchSearch
  })

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
              Selecção actual
            </p>
            <h1>A nossa adega</h1>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 32 }}>
            <input
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar vinho, região, casta..."
              style={{ maxWidth: 280 }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TIPOS.map(t => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  className={`btn btn-sm ${filtroTipo === t ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {t === 'todos' ? 'Todos' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: 12 }}>🍾</p>
              <p>Nenhum vinho encontrado</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 24,
            }}>
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
