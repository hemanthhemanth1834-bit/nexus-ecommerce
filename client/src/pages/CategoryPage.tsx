import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { api } from '@/utils/api'
import ProductGrid from '@/components/product/ProductGrid'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import type { Product } from '@/types'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!slug) return
      setLoading(true)
      try {
        const res = await api.get<{ products?: Product[] }>(`/products?category=${slug}`)
        setProducts(res.products || (res as unknown as Product[]))

        try {
          const catRes = await api.get<{ name?: string; description?: string }>(`/categories/${slug}`)
          const cat = catRes
          setCategoryName(cat.name || slug)
          setCategoryDescription(cat.description || '')
        } catch {
          setCategoryName(slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()))
        }
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryProducts()
  }, [slug])

  return (
    <div className="min-h-screen">
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-800">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white capitalize">
              {categoryName || 'Category'}
            </h1>
            {categoryDescription && (
              <p className="text-surface-500 dark:text-surface-400 mt-2 max-w-2xl">
                {categoryDescription}
              </p>
            )}
            {!loading && (
              <p className="text-surface-400 dark:text-surface-500 mt-1 text-sm">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products in this category"
            description="Check back later or explore other categories."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ProductGrid products={products} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
