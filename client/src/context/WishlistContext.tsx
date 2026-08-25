import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api } from '@/utils/api'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import type { WishlistItem } from '@/types'

interface WishlistContextType {
  items: WishlistItem[]; loading: boolean
  toggleWishlist: (productId: number) => Promise<void>
  isWishlisted: (productId: number) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()

  const fetchWishlist = useCallback(async () => {
    if (!user) { setItems([]); return }
    try { setLoading(true); const res = await api.get<WishlistItem[]>('/wishlist'); setItems(res) }
    catch { /* ignore */ } finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchWishlist() }, [fetchWishlist])

  const toggleWishlist = useCallback(async (productId: number) => {
    if (!user) { addToast('warning', 'Please log in to manage your wishlist'); return }
    const isCurrentlyWishlisted = items.some(i => i.productId === productId)
    if (isCurrentlyWishlisted) {
      await api.delete(`/wishlist/${productId}`); setItems(prev => prev.filter(i => i.productId !== productId)); addToast('info', 'Removed from wishlist')
    } else { await api.post('/wishlist', { productId }); await fetchWishlist(); addToast('success', 'Added to wishlist') }
  }, [user, items, fetchWishlist, addToast])

  const isWishlisted = useCallback((productId: number) => items.some(i => i.productId === productId), [items])

  return <WishlistContext.Provider value={{ items, loading, toggleWishlist, isWishlisted }}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
