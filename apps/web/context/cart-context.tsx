'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Product } from '@/services/api'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  totalAmount: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {
        localStorage.removeItem('cart')
      }
    }
    setMounted(true)
  }, [])

  // Save to localStorage when cart changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        )
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const isInCart = useCallback((productId: string) => {
    return items.some((item) => item.product.id === productId)
  }, [items])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  )

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <CartContext.Provider
        value={{
          items: [],
          itemCount: 0,
          totalAmount: 0,
          addItem: () => {},
          removeItem: () => {},
          updateQuantity: () => {},
          clearCart: () => {},
          isInCart: () => false,
        }}
      >
        {children}
      </CartContext.Provider>
    )
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
