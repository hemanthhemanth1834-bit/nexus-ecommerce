import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import { api } from '@/utils/api'
import { formatPrice, formatDate } from '@/utils/helpers'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  recentOrders: Array<{
    id: number
    total: number
    status: string
    createdAt: string
    user: { name: string; email: string }
  }>
  lowStockProducts: Array<{ id: number; name: string; stock: number; price: number }>
  monthlyRevenue: Array<{ month: string; revenue: number }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<DashboardStats>('/admin/stats')
      .then(setStats)
      .catch((err) => setError(err.message ?? 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!stats) return null

  const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.revenue), 1)

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold"
      >
        Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard icon={DollarSign} label="Total Revenue" value={stats.totalRevenue} prefix="$" trend={{ value: 12, direction: 'up' }} />
        <StatsCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} trend={{ value: 8, direction: 'up' }} />
        <StatsCard icon={Users} label="Customers" value={stats.totalCustomers} trend={{ value: 5, direction: 'up' }} />
        <StatsCard icon={Package} label="Products" value={stats.totalProducts} trend={{ value: 2, direction: 'down' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2 bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800"
        >
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          {stats.monthlyRevenue.length === 0 ? (
            <p className="text-surface-400 text-sm">No revenue data yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {stats.monthlyRevenue.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-surface-500 font-medium">{formatPrice(item.revenue)}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg min-h-[4px]"
                  />
                  <span className="text-xs text-surface-400">{item.month}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Low Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock
          </h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-surface-400 text-sm">All products are well-stocked.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-xl"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-surface-400">{formatPrice(p.price)}</p>
                  </div>
                  <Badge variant={p.stock === 0 ? 'danger' : 'warning'}>{p.stock} left</Badge>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-surface-900 rounded-2xl p-6 border border-surface-200 dark:border-surface-800"
      >
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Order</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-mono">#{order.id}</td>
                  <td className="py-3 px-4 text-sm">{order.user.name}</td>
                  <td className="py-3 px-4 text-sm text-surface-500">{formatDate(order.createdAt)}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        order.status === 'delivered'
                          ? 'success'
                          : order.status === 'cancelled'
                            ? 'danger'
                            : 'info'
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium">{formatPrice(order.total)}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-surface-400 text-sm">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
