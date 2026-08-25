import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { api } from '@/utils/api'
import { formatPrice, formatDate, getProductImages } from '@/utils/helpers'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import type { Order } from '@/types'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchOrder = async () => {
      try {
        const res = await api.get<{ order?: Order }>(`/orders/${id}`)
        setOrder(res.order || (res as unknown as Order))
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: `/orders/${id}` }} replace />
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto text-surface-400 mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
            Order not found
          </h2>
          <Link to="/orders">
            <Button variant="primary">View Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const total = order.total || 0

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400 hover:text-brand-500 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                Order #{String(order.id).slice(-8).toUpperCase() || 'N/A'}
              </h1>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[order.status] || statusColors.pending
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                  Order Items
                </h2>
                <div className="space-y-3">
                  {order.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-200 dark:bg-surface-700 shrink-0">
                        {(() => { const imgs = getProductImages(item.product || {}); return imgs.length > 0; })() ? (
                          <img
                            src={getProductImages(item.product || {})[0]}
                            alt={item.product?.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={18} className="text-surface-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-900 dark:text-white text-sm truncate">
                          {item.product?.name || item.name || 'Product'}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          Qty: {item.quantity} × {formatPrice(item.price || item.product?.price || 0)}
                        </p>
                      </div>
                      <p className="font-semibold text-surface-900 dark:text-white text-sm shrink-0">
                        {formatPrice((item.price || item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {order.shippingAddress && (
                <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
                    <MapPin size={18} />
                    Shipping Address
                  </h2>
                  <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                    {(() => {
                      try {
                        const addr = JSON.parse(order.shippingAddress);
                        return (
                          <>
                            {addr.name && <>{addr.name}<br /></>}
                            {addr.address}<br />
                            {addr.city}, {addr.state} {addr.zip}
                          </>
                        );
                      } catch {
                        return order.shippingAddress;
                      }
                    })()}
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="sticky top-24 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-surface-600 dark:text-surface-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-surface-900 dark:text-white">Total</span>
                      <span className="font-bold text-xl text-surface-900 dark:text-white">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                    <Calendar size={14} />
                    Ordered: {formatDate(order.createdAt)}
                  </div>
                  {order.status === 'shipped' && (
                    <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 mt-2">
                      <Truck size={14} />
                      In transit
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
