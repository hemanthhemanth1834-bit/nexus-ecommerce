import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, Star, RotateCcw } from 'lucide-react'
import { clsx } from 'clsx'

export interface FilterState {
  categories: string[]
  priceRange: [number, number]
  minRating: number
  inStockOnly: boolean
}

interface FilterPanelProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  categories?: string[]
  isOpen?: boolean
  onToggle?: () => void
}

const defaultCategories = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Beauty',
]

const pricePresets = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 - $50', min: 25, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $200', min: 100, max: 200 },
  { label: '$200+', min: 200, max: 99999 },
]

export default function FilterPanel({
  filters,
  onChange,
  categories = defaultCategories,
  isOpen = false,
  onToggle,
}: FilterPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const visible = onToggle ? isOpen : mobileOpen
  const toggle = onToggle ?? (() => setMobileOpen(!mobileOpen))

  const updateFilter = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial })
  }

  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    updateFilter({ categories: next })
  }

  const clearAll = () => {
    onChange({
      categories: [],
      priceRange: [0, 500],
      minRating: 0,
      inStockOnly: false,
    })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 500 ||
    filters.minRating > 0 ||
    filters.inStockOnly

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
          Category
        </h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="h-4 w-4 rounded border-surface-300 dark:border-surface-600 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-100 transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={filters.priceRange[0]}
            onChange={(e) =>
              updateFilter({
                priceRange: [Number(e.target.value), filters.priceRange[1]],
              })
            }
            className="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-3 py-1.5 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Min"
          />
          <span className="text-surface-400">-</span>
          <input
            type="number"
            min={0}
            value={filters.priceRange[1]}
            onChange={(e) =>
              updateFilter({
                priceRange: [filters.priceRange[0], Number(e.target.value)],
              })
            }
            className="w-full rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 px-3 py-1.5 text-sm text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Max"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pricePresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() =>
                updateFilter({ priceRange: [preset.min, preset.max] })
              }
              className={clsx(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                filters.priceRange[0] === preset.min &&
                  filters.priceRange[1] === preset.max
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => updateFilter({ minRating: filters.minRating === rating ? 0 : rating })}
              className={clsx(
                'flex items-center gap-2 w-full rounded-lg px-3 py-1.5 text-sm transition-colors',
                filters.minRating === rating
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
              )}
            >
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={clsx(
                      'h-3.5 w-3.5',
                      i < rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-surface-300 dark:text-surface-600'
                    )}
                  />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => updateFilter({ inStockOnly: e.target.checked })}
              className="sr-only peer"
            />
            <div className="h-6 w-11 rounded-full bg-surface-200 dark:bg-surface-700 peer-checked:bg-brand-600 transition-colors" />
            <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow peer-checked:translate-x-5 transition-transform" />
          </div>
          <span className="text-sm text-surface-600 dark:text-surface-400">In Stock Only</span>
        </label>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={toggle}
        className="lg:hidden flex items-center gap-2 rounded-xl border border-surface-200 dark:border-surface-700 px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors mb-4"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="h-5 w-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
            {filters.categories.length + (filters.inStockOnly ? 1 : 0) + (filters.minRating > 0 ? 1 : 0)}
          </span>
        )}
      </button>

      <div className="hidden lg:block">{content}</div>

      <AnimatePresence>
        {visible && onToggle === undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={toggle}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-surface-950 p-6 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  Filters
                </h2>
                <button
                  onClick={toggle}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
