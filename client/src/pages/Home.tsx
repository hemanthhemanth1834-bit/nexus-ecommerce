import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  Gem,
  Sparkles,
  Zap,
  Star,
  Send,
} from 'lucide-react'
import { api } from '@/utils/api'
import { formatPrice } from '@/utils/helpers'
import Button from '@/components/ui/Button'
import ProductGrid from '@/components/product/ProductGrid'
import Skeleton from '@/components/ui/Skeleton'
import HeroScene from '@/components/three/HeroScene'
import type { Product, Category } from '@/types'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: 'easeOut' },
}

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free shipping on all orders over $50. Fast and reliable delivery worldwide.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    description: '256-bit SSL encryption. Your payment information is always protected.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support. We are here to help anytime.',
  },
  {
    icon: Gem,
    title: 'Premium Quality',
    description: 'Handpicked products from top brands. Quality guaranteed.',
  },
]

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get<{ products?: Product[]; data?: Product[] }>('/products?featured=true&limit=8')
        setFeaturedProducts(res.products || res.data || (res as unknown as Product[]))
      } catch {
      } finally {
        setLoadingProducts(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const res = await api.get<{ categories?: Category[]; data?: Category[] }>('/categories')
        setCategories(res.categories || res.data || (res as unknown as Category[]))
      } catch {
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchFeatured()
    fetchCategories()
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-purple-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium mb-6">
              <Sparkles size={16} />
              New Collection Available
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-surface-900 dark:text-white leading-tight">
              Discover the{' '}
              <span className="bg-gradient-to-r from-brand-500 to-purple-600 bg-clip-text text-transparent">
                Future
              </span>{' '}
              of Technology
            </h1>
            <p className="mt-6 text-lg text-surface-600 dark:text-surface-400 max-w-lg leading-relaxed">
              Explore our curated collection of premium tech products designed
              to elevate your everyday experience. Innovation meets elegance.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <Link to="/products">
                <Button variant="primary" size="lg">
                  Explore Collection
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/products?featured=true">
                <Button variant="secondary" size="lg">
                  <Zap size={18} className="mr-2" />
                  View Trending
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-10">
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">10K+</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-surface-200 dark:bg-surface-700" />
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">500+</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">Products</p>
              </div>
              <div className="w-px h-10 bg-surface-200 dark:bg-surface-700" />
              <div>
                <p className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-1">
                  <Star size={18} className="fill-yellow-400 text-yellow-400" />
                  4.9
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400">Average Rating</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block relative h-[500px]"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-br from-brand-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10">
              <HeroScene />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">
                Featured Products
              </h2>
              <p className="text-surface-500 dark:text-surface-400 mt-2">
                Our most popular picks, loved by thousands
              </p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1 text-brand-500 hover:text-brand-600 font-medium transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div {...fadeUp}>
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid products={featuredProducts} />
            )}
          </motion.div>

          <div className="sm:hidden mt-8 text-center">
            <Link to="/products">
              <Button variant="secondary">
                View All Products <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-50 dark:bg-surface-900/50">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">
              Shop by Category
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-2">
              Find exactly what you need
            </p>
          </motion.div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : (
            <motion.div {...fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className="group block relative h-48 rounded-2xl overflow-hidden bg-surface-200 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-brand-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10"
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center">
                        <Sparkles size={32} className="text-brand-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
                      {cat._count?.products !== undefined && (
                        <p className="text-white/70 text-sm">
                          {cat._count.products} products
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">
              Why Choose Us
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-2">
              We are committed to providing the best experience
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <feature.icon size={24} className="text-brand-500" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-900 dark:bg-surface-950">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-surface-400 mb-8">
              Subscribe to our newsletter for exclusive deals, new arrivals, and tech insights.
            </p>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400"
              >
                Thanks for subscribing! Check your inbox.
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-surface-800 border border-surface-700 text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
                <Button type="submit" variant="primary" size="lg">
                  <Send size={18} />
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
