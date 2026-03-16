import { useCart } from '../context/CartContext'
import { useToast } from './Toast'

const tipoColors = {
  tinto: 'badge-burgundy',
  branco: 'badge-gold',
  rosé: 'badge-muted',
  espumante: 'badge-green',
  sobremesa: 'badge-gold',
}

export default function ProductCard({ product, onAdminToggle }) {
  const { addItem } = useCart()
  const { addToast } = useToast()

  function handleAdd() {
    addItem(product)
    addToast(`${product.nome} adicionado ao carrinho`, 'success')
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Imagem */}
      <div style={{
        height: 220, background: 'var(--cream-dark)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        {product.imagem_url ? (
          <img src={product.imagem_url} alt={product.nome}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '4rem', opacity: 0.3 }}>🍷</span>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className={`badge ${tipoColors[product.tipo] || 'badge-muted'}`}>
            {product.tipo || 'vinho'}
          </span>
        </div>
        {onAdminToggle && (
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <button
              onClick={() => onAdminToggle(product)}
              className={`badge ${product.visible ? 'badge-green' : 'badge-muted'}`}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {product.visible ? 'Visível' : 'Oculto'}
            </button>
          </div>
        )}
      </div>

      {/* Corpo */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>{product.nome}</h3>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--burgundy)', whiteSpace: 'nowrap' }}>
            {Number(product.preco).toFixed(2)} €
          </span>
        </div>

        {(product.regiao || product.ano) && (
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)', letterSpacing: '0.04em' }}>
            {[product.regiao, product.ano].filter(Boolean).join(' · ')}
          </p>
        )}

        {product.casta && (
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>{product.casta}</p>
        )}

        {product.descricao && (
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.descricao}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: product.stock > 0 ? '#22643C' : 'var(--muted)' }}>
            {product.stock > 0 ? `${product.stock} em stock` : 'Esgotado'}
          </span>
          {!onAdminToggle && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAdd}
              disabled={product.stock === 0}
              style={{ opacity: product.stock === 0 ? 0.5 : 1 }}
            >
              Adicionar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
