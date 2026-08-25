import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api } from '@/utils/api'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import type { CartItem } from '@/types'

interface CartContextType {
  items: CartItem[]; loading: boolean
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>
  removeItem: (cartItemId: number) => Promise<void>
  clearCart: () => Promise<void>
  total: number; itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return }
    try { setLoading(true); const res = await api.get<{ items: CartItem[] }>('/cart'); setItems(res.items) }
    catch { /* ignore */ } finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addItem = useCallback(async (productId: number, quantity = 1) => {
    if (!user) { addToast('warning', 'Please log in to add items to cart'); return }
    const res = await api.post<{ items: CartItem[] }>('/cart', { productId, quantity })
    setItems(res.items); addToast('success', 'Product added to cart')
  }, [user, addToast])

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    const res = await api.put<{ items: CartItem[] }>(`/cart/${cartItemId}`, { quantity }); setItems(res.items)
  }, [])

  const removeItem = useCallback(async (cartItemId: number) => {
    const res = await api.delete<{ items: CartItem[] }>(`/cart/${cartItemId}`); setItems(res.items); addToast('info', 'Item removed from cart')
  }, [addToast])

  const clearCart = useCallback(async () => { await api.delete('/cart'); setItems([]) }, [])
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return <CartContext.Provider value={{ items, loading, addItem, updateQuantity, removeItem, clearCart, total, itemCount }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
