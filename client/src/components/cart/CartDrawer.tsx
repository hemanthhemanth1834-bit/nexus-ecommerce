import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useCart } from '@/context/CartContext'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { getProductImages } from '@/utils/helpers'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const drawerVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.2 },
  },
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, total: subtotal } = useCart()

  const shipping = subtotal >= 50 ? 0 : 9.99
  const total = subtotal + shipping

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md flex flex-col bg-white dark:bg-surface-950 shadow-2xl"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-surface-600 dark:text-surface-400" />
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  Cart ({items.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is empty"
                  description="Add some products to your cart to get started."
                  action={{
                    label: 'Browse Products',
                    onClick: onClose,
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        className="flex gap-4"
                      >
                        <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800">
                          {(() => { const imgs = getProductImages(item.product || {}); return imgs.length > 0; })() ? (
                            <img
                              src={getProductImages(item.product || {})[0]}
                              alt={item.product?.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-surface-400">
                              <ShoppingBag className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                            {item.product?.name}
                          </h3>
                          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                            ${(item.product?.price ?? 0).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, Math.max(1, item.quantity - 1))
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-surface-200 dark:border-surface-700 text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-medium text-surface-900 dark:text-surface-100 w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-surface-200 dark:border-surface-700 text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-surface-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                            ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-surface-200 dark:border-surface-800 px-6 py-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Subtotal</span>
                  <span className="font-medium text-surface-900 dark:text-surface-100">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500 dark:text-surface-400">Shipping</span>
                  <span
                    className={clsx(
                      'font-medium',
                      shipping === 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-surface-900 dark:text-surface-100'
                    )}
                  >
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <hr className="border-surface-200 dark:border-surface-800" />
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-surface-900 dark:text-surface-100">
                    Total
                  </span>
                  <span className="text-base font-bold text-surface-900 dark:text-surface-100">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <Link to="/checkout" onClick={onClose}>
                  <Button variant="primary" size="lg" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
