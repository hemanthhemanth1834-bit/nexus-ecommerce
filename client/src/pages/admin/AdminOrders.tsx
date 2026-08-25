import { Fragment, useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react'
import { api } from '@/utils/api'
import { formatPrice, formatDate } from '@/utils/helpers'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { useToast } from '@/context/ToastContext'

interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number
}

interface Order {
  id: number
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  items: OrderItem[]
  user: { id: number; name: string; email: string }
}

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

type StatusFilter = (typeof STATUS_OPTIONS)[number]

const statusBadgeVariant: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

const paymentBadgeVariant: Record<string, 'success' | 'danger' | 'warning'> = {
  paid: 'success',
  unpaid: 'danger',
  refunded: 'warning',
}

export default function AdminOrders() {
  const { addToast: toast } = useToast()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    api
      .get<Order[]>('/orders?limit=50')
      .then(setOrders)
      .catch(() => toast('error', 'Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return orders
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  async function updateStatus(orderId: number, newStatus: string) {
    setUpdatingId(orderId)
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      toast('success', 'Order status updated')
    } catch {
      toast('error', 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold"
      >
        Orders
      </motion.h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === s
                ? 'bg-brand-500 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={filter === 'all' ? 'No orders have been placed yet.' : `No ${filter} orders.`}
          icon={ShoppingCart}
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500 w-8" />
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-surface-500">Payment</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-surface-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <Fragment key={order.id}>
                    <tr className="border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <button onClick={() => toggleExpand(order.id)} className="p-1 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-md transition-colors">
                          {expandedId === order.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono">#{order.id}</td>
                      <td className="py-3 px-4 text-sm">{order.user.name}</td>
                      <td className="py-3 px-4 text-sm text-surface-500">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4 text-sm">{order.items.length}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusBadgeVariant[order.status] ?? 'info'}>{order.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={paymentBadgeVariant[order.paymentStatus] ?? 'info'}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium">{formatPrice(order.total)}</td>
                    </tr>
                    <AnimatePresence>
                      {expandedId === order.id && (
                        <tr>
                          <td colSpan={8} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 py-4 bg-surface-50 dark:bg-surface-800/50 space-y-4">
                                {/* Items list */}
                                <div>
                                  <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">
                                    Items
                                  </h4>
                                  <div className="space-y-1">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex justify-between text-sm">
                                        <span>
                                          {item.name} × {item.quantity}
                                        </span>
                                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {/* Update status */}
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium">Update status:</span>
                                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                    <Button
                                      key={s}
                                      variant={order.status === s ? 'primary' : 'secondary'}
                                      size="sm"
                                      disabled={updatingId === order.id || order.status === s}
                                      onClick={() => updateStatus(order.id, s)}
                                      className="capitalize text-xs"
                                    >
                                      {s}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
