import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, List, Package } from 'lucide-react'
import { clsx } from 'clsx'
import type { Product } from '@/types'
import ProductCard from './ProductCard'
import EmptyState from '@/components/ui/EmptyState'

interface ProductGridProps {
  products: Product[]
  total?: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export default function ProductGrid({ products, total }: ProductGridProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="Try adjusting your filters or search query to find what you're looking for."
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Showing{' '}
          <span className="font-medium text-surface-900 dark:text-surface-100">
            {products.length}
          </span>{' '}
          {total !== undefined && total !== products.length && (
            <>
              of{' '}
              <span className="font-medium text-surface-900 dark:text-surface-100">
                {total}
              </span>{' '}
            </>
          )}
          products
        </p>
        <div className="flex items-center gap-1 rounded-xl border border-surface-200 dark:border-surface-700 p-1">
          <button
            onClick={() => setView('grid')}
            className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              view === 'grid'
                ? 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100'
                : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              view === 'list'
                ? 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100'
                : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
