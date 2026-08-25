import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Star,
  ChevronRight,
  Package,
  Truck,
  RotateCcw,
  Shield,
  Send,
} from 'lucide-react'
import { api } from '@/utils/api'
import { formatPrice, getDiscountPercent, formatDate, getProductImages } from '@/utils/helpers'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import StarRating from '@/components/ui/StarRating'
import ProductGrid from '@/components/product/ProductGrid'
import type { Product, Review } from '@/types'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const [productRes, reviewsRes] = await Promise.all([
          api.get<Product>(`/products/${id}`),
          api.get<{ reviews?: Review[] }>(`/reviews/product/${id}`),
        ])

        const productData = productRes
        setProduct(productData)
        const reviewsList = reviewsRes.reviews || (reviewsRes as unknown as Review[])
        setReviews(reviewsList)

        const revs = reviewsList
        if (revs.length > 0) {
          const avg = revs.reduce((sum: number, r: Review) => sum + r.rating, 0) / revs.length
          setAverageRating(Math.round(avg * 10) / 10)
        }

        if (productData.category) {
          try {
            const catSlug =
              typeof productData.category === 'string'
                ? productData.category
                : productData.category.slug || productData.category.id
            const relatedRes = await api.get<{ products?: Product[] }>(`/products?category=${catSlug}&limit=4`)
            const related = (relatedRes.products || (relatedRes as unknown as Product[])).filter(
              (p: Product) => String(p.id) !== id
            )
            setRelatedProducts(related.slice(0, 4))
          } catch {
          }
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product.id, quantity)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/checkout')
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewComment.trim() || !id) return
    setSubmittingReview(true)
    try {
      const res = await api.post<{ review?: Review }>(`/reviews/product/${id}`, {
        rating: reviewRating,
        comment: reviewComment,
      })
      setReviews([res.review || (res as unknown as Review), ...reviews])
      setReviewComment('')
      setReviewRating(5)
    } catch {
    } finally {
      setSubmittingReview(false)
    }
  }

  const images = product ? getProductImages(product) : []

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto text-surface-400 mb-4" />
          <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
            Product not found
          </h2>
          <Link to="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const discount = product.compareAtPrice ? getDiscountPercent(product.price, product.compareAtPrice) : 0

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 mb-6">
          <Link to="/" className="hover:text-brand-500 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" className="hover:text-brand-500 transition-colors">Products</Link>
          <ChevronRight size={14} />
          <span className="text-surface-900 dark:text-white truncate">{product.name}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-10"
        >
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 aspect-square group">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={64} className="text-surface-300 dark:text-surface-600" />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="danger">-{discount}%</Badge>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-brand-500'
                        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                <StarRating rating={averageRating || product.rating || 0} />
                <span className="text-sm text-surface-500 dark:text-surface-400 ml-1">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold text-surface-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-surface-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="mt-6 text-surface-600 dark:text-surface-400 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-6 flex items-center gap-2">
              <span className="text-sm text-surface-500 dark:text-surface-400">Availability:</span>
              {product.stock > 0 ? (
                <Badge variant="success">In Stock ({product.stock})</Badge>
              ) : (
                <Badge variant="danger">Out of Stock</Badge>
              )}
            </div>

            {product.stock > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Quantity
                </label>
                <div className="inline-flex items-center rounded-xl border border-surface-300 dark:border-surface-700">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors rounded-l-xl"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 py-3 font-medium text-surface-900 dark:text-white min-w-[48px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors rounded-r-xl"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart size={18} className="mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={isWishlisted ? 'text-red-500 border-red-500' : ''}
              >
                <Heart size={18} className={isWishlisted ? 'fill-red-500' : ''} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <Truck size={18} className="text-brand-500 shrink-0" />
                <span className="text-xs text-surface-600 dark:text-surface-400">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <RotateCcw size={18} className="text-brand-500 shrink-0" />
                <span className="text-xs text-surface-600 dark:text-surface-400">30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <Shield size={18} className="text-brand-500 shrink-0" />
                <span className="text-xs text-surface-600 dark:text-surface-400">Warranty</span>
              </div>
            </div>
          </div>
        </motion.div>

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">
              Specifications
            </h2>
            <div className="rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden">
              {Object.entries(product.specifications).map(([key, value], idx) => (
                <div
                  key={key}
                  className={`flex ${
                    idx % 2 === 0
                      ? 'bg-surface-50 dark:bg-surface-800/50'
                      : 'bg-white dark:bg-surface-900'
                  }`}
                >
                  <div className="w-48 shrink-0 px-5 py-3 text-sm font-medium text-surface-600 dark:text-surface-400 border-r border-surface-200 dark:border-surface-800">
                    {key}
                  </div>
                  <div className="px-5 py-3 text-sm text-surface-900 dark:text-white">
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">
            Customer Reviews
          </h2>

          {reviews.length > 0 && (
            <div className="flex items-center gap-6 mb-8 p-6 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800">
              <div className="text-center">
                <div className="text-4xl font-bold text-surface-900 dark:text-white">
                  {averageRating}
                </div>
                <StarRating rating={averageRating} />
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                  {reviews.length} reviews
                </p>
              </div>
            </div>
          )}

          {user && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
              <h3 className="font-semibold text-surface-900 dark:text-white mb-4">
                Write a Review
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-0.5"
                    >
                      <Star
                        size={24}
                        className={`transition-colors ${
                          star <= reviewRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-surface-300 dark:text-surface-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your thoughts about this product..."
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submittingReview || !reviewComment.trim()}
              >
                <Send size={14} className="mr-2" />
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-surface-500 dark:text-surface-400 text-center py-8">
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 text-sm font-semibold">
                        {(review.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-surface-900 dark:text-white text-sm">
                        {review.user?.name || 'Anonymous'}
                      </span>
                    </div>
                    <span className="text-xs text-surface-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">
              Related Products
            </h2>
            <ProductGrid products={relatedProducts} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
