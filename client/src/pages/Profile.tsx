import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Edit2, Save, X, ShoppingBag, Heart } from 'lucide-react'
import { api } from '@/utils/api'
import { formatDate } from '@/utils/helpers'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import { Link, Navigate } from 'react-router-dom'
import Skeleton from '@/components/ui/Skeleton'

export default function Profile() {
  const { user, loading: authLoading, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    const fetchStats = async () => {
      try {
        const res = await api.get<{ orders?: unknown[] }>(`/orders`)
        const orders = res.orders || (res as unknown as unknown[])
        setOrderCount(orders.length)
      } catch {
      }
    }
    fetchStats()
  }, [user])

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: '/profile' }} replace />
  }

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.put('/users/profile', { name, email })
      if (updateProfile) {
        updateProfile({ name, email })
      }
      setEditing(false)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-800">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
              My Profile
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Profile Information
            </h2>
            {!editing ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Edit2 size={16} className="mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setError(''); setName(user.name || ''); setEmail(user.email || '') }}>
                  <X size={16} />
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Save size={16} className="mr-1" /> Save</>
                  )}
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Name
              </label>
              {editing ? (
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                </div>
              ) : (
                <p className="text-surface-900 dark:text-white py-2.5">{user.name || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Email
              </label>
              {editing ? (
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  />
                </div>
              ) : (
                <p className="text-surface-900 dark:text-white py-2.5">{user.email || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Member Since
              </label>
              <p className="text-surface-900 dark:text-white py-2.5 flex items-center gap-2">
                <Calendar size={16} className="text-surface-400" />
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <Link
            to="/orders"
            className="group p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
          >
            <ShoppingBag size={24} className="text-brand-500 mb-3" />
            <h3 className="font-semibold text-surface-900 dark:text-white">
              {orderCount} Orders
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              View order history
            </p>
          </Link>

          <Link
            to="/wishlist"
            className="group p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
          >
            <Heart size={24} className="text-brand-500 mb-3" />
            <h3 className="font-semibold text-surface-900 dark:text-white">
              Wishlist
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              View saved items
            </p>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
