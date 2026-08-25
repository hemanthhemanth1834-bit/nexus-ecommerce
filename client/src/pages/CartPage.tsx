import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice, getProductImages } from '@/utils/helpers'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart()

  const shipping = total >= 50 ? 0 : 9.99
  const tax = total * 0.08
  const grandTotal = total + shipping + tax

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={{
            label: 'Start Shopping',
            onClick: () => window.location.href = '/products',
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-8">
            Shopping Cart
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800"
              >
                <Link
                  to={`/products/${item.productId}`}
                  className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800"
                >
                  {(() => { const imgs = getProductImages(item.product || {}); return imgs.length > 0; })() ? (
                    <img
                      src={getProductImages(item.product || {})[0]}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={24} className="text-surface-400" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.productId}`}
                    className="font-semibold text-surface-900 dark:text-white hover:text-brand-500 transition-colors line-clamp-1"
                  >
                    {item.product?.name}
                  </Link>

                  <p className="text-brand-500 font-bold mt-1">
                    {formatPrice(item.product?.price || 0)}
                    {item.product?.compareAtPrice && item.product.compareAtPrice > (item.product?.price || 0) && (
                      <span className="text-sm text-surface-400 line-through ml-2">
                        {formatPrice(item.product.compareAtPrice)}
                      </span>
                    )}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="inline-flex items-center rounded-lg border border-surface-300 dark:border-surface-700">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors rounded-l-lg"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium text-surface-900 dark:text-white min-w-[36px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors rounded-r-lg"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="hidden sm:block text-right shrink-0">
                  <p className="font-bold text-surface-900 dark:text-white">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="sticky top-24 p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800"
            >
              <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-surface-600 dark:text-surface-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-surface-900 dark:text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-surface-600 dark:text-surface-400">
                  <span>Shipping</span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {shipping === 0 ? (
                      <span className="text-green-500">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-surface-600 dark:text-surface-400">
                  <span>Estimated Tax</span>
                  <span className="font-medium text-surface-900 dark:text-white">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-surface-200 dark:border-surface-700 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-surface-900 dark:text-white">Total</span>
                    <span className="font-bold text-xl text-surface-900 dark:text-white">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-3 text-center">
                  Add {formatPrice(50 - total)} more for free shipping
                </p>
              )}

              <div className="mt-6 space-y-3">
                <Link to="/checkout" className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link to="/products" className="block">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft size={16} className="mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
