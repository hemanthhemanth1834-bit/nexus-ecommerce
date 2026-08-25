import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Users } from 'lucide-react'
import { api } from '@/utils/api'
import { formatDate } from '@/utils/helpers'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { useToast } from '@/context/ToastContext'

interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

export default function AdminUsers() {
  const { addToast: toast } = useToast()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api
      .get<AdminUser[]>('/admin/users')
      .then(setUsers)
      .catch(() => toast('error', 'Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, search])

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold"
      >
        Users
      </motion.h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No users found"
          description={search ? 'Try a different search.' : 'No users registered yet.'}
          icon={Users}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-mono text-surface-500">#{user.id}</td>
                    <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-surface-500">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === 'admin' ? 'info' : 'default'}>{user.role}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-surface-500">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
