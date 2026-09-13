import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const useCart = () => useContext(CartContext)

const STORAGE_KEY = 'shaheer_cart'

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock || 99) }
            : i
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url,
          stock: product.stock,
          quantity,
        },
      ]
    })
  }

  const increaseQuantity = (id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock || 99) } : i))
    )
  }

  const decreaseQuantity = (id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i))
    )
  }

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0)

  const value = {
    items,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
