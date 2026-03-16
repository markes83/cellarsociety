import { createContext, useContext, useState } from 'react'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  function addItem(product, quantidade = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        )
      }
      return [...prev, { product, quantidade }]
    })
  }

  function removeItem(productId) {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  function updateQuantidade(productId, quantidade) {
    if (quantidade <= 0) return removeItem(productId)
    setItems(prev =>
      prev.map(i => i.product.id === productId ? { ...i, quantidade } : i)
    )
  }

  function clearCart() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.product.preco * i.quantidade, 0)
  const count = items.reduce((sum, i) => sum + i.quantidade, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantidade, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
