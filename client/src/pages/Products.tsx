import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, Package } from 'lucide-react'
import { api } from '@/utils/api'
import { useDebounce } from '@/hooks/useDebounce'
import Button from '@/components/ui/Button'
import ProductGrid from '@/components/product/ProductGrid'
import FilterPanel from '@/components/product/FilterPanel'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import type { Product, Category } from '@/types'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mobileFilters, setMobileFilters] = useState(false)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const limit = 12
  const totalPages = Math.ceil(total / limit)

  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 400)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      if (key !== 'page') {
        params.set('page', '1')
      }
      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateParam('search', debouncedSearch)
    }
  }, [debouncedSearch, search, updateParam])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params: Record<string, string> = { page: String(page), limit: String(limit) }
        if (search) params.search = search
        if (category) params.category = category
        if (minPrice) params.minPrice = minPrice
        if (maxPrice) params.maxPrice = maxPrice
        if (sort) params.sort = sort

        const queryString = new URLSearchParams(params).toString()
        const res = await api.get<{ products: Product[]; pagination: { total: number } }>(`/products?${queryString}`)
        setProducts(res.products)
        setTotal(res.pagination.total)
      } catch {
        setProducts([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [search, category, minPrice, maxPrice, sort, page])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<{ categories?: Category[]; data?: Category[] }>('/categories')
        setCategories(res.categories || res.data || (res as unknown as Category[]))
      } catch {
      }
    }
    fetchCategories()
  }, [])

  const handleClearFilters = () => {
    setSearchParams({})
    setSearchInput('')
  }

  const hasActiveFilters = search || category || minPrice || maxPrice

  return (
    <div className="min-h-screen">
      <div className="bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-800">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
              All Products
            </h1>
            {!loading && (
              <p className="text-surface-500 dark:text-surface-400 mt-1">
                {total} {total === 1 ? 'product' : 'products'} found
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterPanel
                categories={categories.map((c) => c.slug)}
                filters={{
                  categories: category ? [category] : [],
                  priceRange: [minPrice ? Number(minPrice) : 0, maxPrice ? Number(maxPrice) : 10000],
                  minRating: 0,
                  inStockOnly: false,
                }}
                onChange={(newFilters) => {
                  updateParam('category', newFilters.categories[0] || '')
                  updateParam('minPrice', newFilters.priceRange[0] > 0 ? String(newFilters.priceRange[0]) : '')
                  updateParam('maxPrice', newFilters.priceRange[1] < 10000 ? String(newFilters.priceRange[1]) : '')
                }}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 w-full sm:max-w-sm">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('')
                      updateParam('search', '')
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileFilters(true)}
                >
                  <SlidersHorizontal size={16} className="mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>

                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-surface-500 dark:text-surface-400">Active filters:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm">
                    &quot;{search}&quot;
                    <button onClick={() => { setSearchInput(''); updateParam('search', '') }}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm">
                    {category}
                    <button onClick={() => updateParam('category', '')}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm">
                    ${minPrice || '0'} - ${maxPrice || '∞'}
                    <button onClick={() => { updateParam('minPrice', ''); updateParam('maxPrice', '') }}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-surface-500 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
                title="No products found"
                description="Try adjusting your filters or search terms."
                action={{
                  label: 'Clear Filters',
                  onClick: handleClearFilters,
                }}
              />
            ) : (
              <ProductGrid products={products} />
            )}

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    updateParam('page', String(p))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white dark:bg-surface-900 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Filters</h2>
              <button
                onClick={() => setMobileFilters(false)}
                className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                <X size={20} />
              </button>
            </div>
            <FilterPanel
              categories={categories.map((c) => c.slug)}
              filters={{
                categories: category ? [category] : [],
                priceRange: [minPrice ? Number(minPrice) : 0, maxPrice ? Number(maxPrice) : 10000],
                minRating: 0,
                inStockOnly: false,
              }}
              onChange={(newFilters) => {
                updateParam('category', newFilters.categories[0] || '')
                updateParam('minPrice', newFilters.priceRange[0] > 0 ? String(newFilters.priceRange[0]) : '')
                updateParam('maxPrice', newFilters.priceRange[1] < 10000 ? String(newFilters.priceRange[1]) : '')
              }}
            />
            <Button
              variant="primary"
              className="w-full mt-6"
              onClick={() => setMobileFilters(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
