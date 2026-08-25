import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { clsx } from 'clsx'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import type { Product } from '@/types'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import { getDiscountPercent, getProductImages } from '@/utils/helpers'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const [hovered, setHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [adding, setAdding] = useState(false)

  const inWishlist = isWishlisted(product.id)
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount ? getDiscountPercent(product.price, product.compareAtPrice!) : 0
  const isNew = product.createdAt
    ? new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    : false

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    await addItem(product.id, 1)
    setAdding(false)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  const displayPrice = product.price
  const stockStatus =
    product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : 'in'

  const productImages = getProductImages(product)
  const displayImage = product.image || productImages[0] || ''

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div
          className={clsx(
            'relative rounded-2xl overflow-hidden',
            'bg-white dark:bg-surface-900',
            'border border-surface-200 dark:border-surface-800',
            'transition-all duration-300',
            'hover:shadow-xl hover:border-surface-300 dark:hover:border-surface-700',
            'hover:[perspective:1000px]'
          )}
          style={{
            transform: hovered
              ? 'rotateX(2deg) rotateY(-2deg)'
              : 'rotateX(0deg) rotateY(0deg)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.3s ease',
          }}
        >
          <div className="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-800">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                onLoad={() => setImageLoaded(true)}
                className={clsx(
                  'w-full h-full object-cover transition-all duration-500',
                  hovered && 'scale-110',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-surface-400">
                <Eye className="h-12 w-12" />
              </div>
            )}

            <div
              className={clsx(
                'absolute inset-0 bg-black/0 transition-colors duration-300',
                hovered && 'bg-black/5'
              )}
            />

            {isNew && (
              <div className="absolute top-3 left-3">
                <Badge variant="brand">New</Badge>
              </div>
            )}

            {hasDiscount && (
              <div className="absolute top-3 right-3">
                <Badge variant="danger">-{discountPercent}%</Badge>
              </div>
            )}

            <motion.button
              onClick={handleToggleWishlist}
              className={clsx(
                'absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full',
                'bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm',
                'shadow-lg transition-all duration-200',
                inWishlist
                  ? 'text-red-500'
                  : 'text-surface-500 hover:text-red-500',
                hasDiscount ? 'top-14' : ''
              )}
              whileTap={{ scale: 0.85 }}
            >
              <Heart
                className={clsx('h-4 w-4', inWishlist && 'fill-current')}
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-3 left-3 right-3"
            >
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200',
                  'bg-brand-600 hover:bg-brand-700 text-white shadow-lg',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'active:scale-[0.98]'
                )}
              >
                {adding ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </motion.div>
          </div>

          <div className="p-4">
            {product.category && (
              <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mb-1.5">
                {typeof product.category === 'string' ? product.category : product.category.name}
              </p>
            )}

            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate mb-1.5">
              {product.name}
            </h3>

            <div className="flex items-center gap-1.5 mb-2">
              <StarRating rating={product.rating ?? 0} size="sm" />
              {product.reviewCount !== undefined && (
                <span className="text-xs text-surface-500 dark:text-surface-400">
                  ({product.reviewCount})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-surface-900 dark:text-surface-100">
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-surface-400 line-through">
                  ${product.compareAtPrice!.toFixed(2)}
                </span>
              )}
            </div>

            {stockStatus !== 'in' && (
              <div className="mt-2">
                {stockStatus === 'low' ? (
                  <Badge variant="warning" dot>Only {product.stock} left</Badge>
                ) : (
                  <Badge variant="danger" dot>Out of stock</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
