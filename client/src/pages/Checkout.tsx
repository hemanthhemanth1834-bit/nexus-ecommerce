import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck,
  ClipboardCheck,
  CreditCard,
  Check,
  ChevronRight,
  Package,
  ShieldCheck,
} from 'lucide-react'
import { api } from '@/utils/api'
import { formatPrice, getProductImages } from '@/utils/helpers'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import Button from '@/components/ui/Button'
import { Navigate } from 'react-router-dom'
import type { Order } from '@/types'

const steps = [
  { id: 1, label: 'Shipping', icon: Truck },
  { id: 2, label: 'Review', icon: ClipboardCheck },
  { id: 3, label: 'Payment', icon: CreditCard },
]

interface ShippingForm {
  name: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
}

interface PaymentForm {
  cardNumber: string
  expiry: string
  cvv: string
  nameOnCard: string
}

export default function Checkout() {
  const { user, loading: authLoading } = useAuth()
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState('')

  const [shipping, setShipping] = useState<ShippingForm>({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  })

  const [payment, setPayment] = useState<PaymentForm>({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: '',
  })

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: '/checkout' }} replace />
  }

  if (items.length === 0 && !orderComplete) {
    return <Navigate to="/cart" replace />
  }

  const shippingCost = total >= 50 ? 0 : 9.99
  const tax = total * 0.08
  const grandTotal = total + shippingCost + tax

  const updateShipping = (field: keyof ShippingForm, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }))
  }

  const updatePayment = (field: keyof PaymentForm, value: string) => {
    setPayment((prev) => ({ ...prev, [field]: value }))
  }

  const validateShipping = (): boolean => {
    if (!shipping.name || !shipping.email || !shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
      setError('Please fill in all shipping fields')
      return false
    }
    return true
  }

  const validatePayment = (): boolean => {
    if (!payment.cardNumber || !payment.expiry || !payment.cvv || !payment.nameOnCard) {
      setError('Please fill in all payment fields')
      return false
    }
    if (payment.cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid card number')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (currentStep === 1 && !validateShipping()) return
    if (currentStep === 3) {
      handlePlaceOrder()
      return
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setError('')
    setCurrentStep((prev) => prev - 1)
  }

  const handlePlaceOrder = async () => {
    if (!validatePayment()) return
    setLoading(true)
    setError('')

    try {
      const res = await api.post<{ order?: Order }>(`/orders`, {
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name: shipping.name,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
          phone: shipping.phone,
        },
        paymentMethod: {
          type: 'card',
          last4: payment.cardNumber.replace(/\s/g, '').slice(-4),
        },
      })
      const order = res.order || (res as unknown as Order)
      setOrderId(String(order.id) || 'ORD-' + Date.now())
      setOrderComplete(true)
      clearCart()
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check size={36} className="text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mb-2">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <p className="text-sm text-surface-400 dark:text-surface-500 mb-8">
            Order ID: <span className="font-mono font-medium text-surface-700 dark:text-surface-300">{orderId}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate(`/orders/${orderId}`)}>
              View Order
            </Button>
            <Button variant="secondary" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </motion.div>
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
            Checkout
          </h1>

          <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400'
                    }`}
                  >
                    {currentStep > step.id ? <Check size={16} /> : step.id}
                  </div>
                  <span
                    className={`hidden sm:inline text-sm font-medium ${
                      currentStep >= step.id
                        ? 'text-surface-900 dark:text-white'
                        : 'text-surface-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight size={16} className="mx-2 text-surface-300 dark:text-surface-600" />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm max-w-2xl mx-auto">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6"
                  >
                    <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">
                      Shipping Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={shipping.name}
                          onChange={(e) => updateShipping('name', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={shipping.email}
                          onChange={(e) => updateShipping('email', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          Address
                        </label>
                        <input
                          type="text"
                          value={shipping.address}
                          onChange={(e) => updateShipping('address', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value={shipping.city}
                          onChange={(e) => updateShipping('city', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          State
                        </label>
                        <input
                          type="text"
                          value={shipping.state}
                          onChange={(e) => updateShipping('state', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={shipping.zip}
                          onChange={(e) => updateShipping('zip', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={shipping.phone}
                          onChange={(e) => updateShipping('phone', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6"
                  >
                    <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">
                      Review Your Order
                    </h2>

                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-200 dark:bg-surface-700 shrink-0">
                            {(() => { const imgs = getProductImages(item.product || {}); return imgs.length > 0; })() ? (
                              <img
                                src={getProductImages(item.product || {})[0]}
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={18} className="text-surface-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                              {item.product?.name}
                            </p>
                            <p className="text-xs text-surface-500 dark:text-surface-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-surface-900 dark:text-white shrink-0">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                      <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-2">
                        Ship to:
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        {shipping.name}<br />
                        {shipping.address}<br />
                        {shipping.city}, {shipping.state} {shipping.zip}
                      </p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6"
                  >
                    <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">
                      Payment Details
                    </h2>

                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm mb-6">
                      This is a test checkout. No real payment will be processed.
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          value={payment.nameOnCard}
                          onChange={(e) => updatePayment('nameOnCard', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={payment.cardNumber}
                          onChange={(e) => updatePayment('cardNumber', e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                            Expiry
                          </label>
                          <input
                            type="text"
                            value={payment.expiry}
                            onChange={(e) => updatePayment('expiry', e.target.value)}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                            CVV
                          </label>
                          <input
                            type="text"
                            value={payment.cvv}
                            onChange={(e) => updatePayment('cvv', e.target.value)}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-6">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : currentStep === 3 ? (
                    <>
                      <ShieldCheck size={18} className="mr-2" />
                      Place Order
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <h3 className="font-bold text-surface-900 dark:text-white mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-surface-600 dark:text-surface-400">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-medium text-surface-900 dark:text-white">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-surface-600 dark:text-surface-400">
                    <span>Shipping</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {shippingCost === 0 ? <span className="text-green-500">Free</span> : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-surface-600 dark:text-surface-400">
                    <span>Tax</span>
                    <span className="font-medium text-surface-900 dark:text-white">{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-surface-900 dark:text-white">Total</span>
                      <span className="font-bold text-xl text-surface-900 dark:text-white">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
