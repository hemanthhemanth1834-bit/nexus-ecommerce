import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { api } from '@/utils/api'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null; loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('nexus-token')
    if (token) {
      api.setToken(token)
      api.get<User>('/auth/me')
        .then(res => setUser(res))
        .catch(() => { api.setToken(null) })
        .finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<User & { token: string }>('/auth/login', { email, password })
    api.setToken(res.token); setUser(res)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<User & { token: string }>('/auth/register', { name, email, password })
    api.setToken(res.token); setUser(res)
  }, [])

  const logout = useCallback(() => { api.setToken(null); setUser(null) }, [])

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const res = await api.put<User>('/auth/me', data)
    setUser(res)
  }, [])

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
