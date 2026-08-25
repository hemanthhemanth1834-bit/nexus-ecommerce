import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = []
    const delta = 2
    const left = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)

    pages.push(1)

    if (left > 2) pages.push('...')

    for (let i = left; i <= right; i++) {
      pages.push(i)
    }

    if (right < totalPages - 1) pages.push('...')

    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  return (
    <nav className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={clsx(
          'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
          page <= 1
            ? 'cursor-not-allowed text-surface-300 dark:text-surface-600'
            : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageNumbers().map((pageNum, i) =>
        pageNum === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-surface-400"
          >
            ...
          </span>
        ) : (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200',
              pageNum === page
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
            )}
          >
            {pageNum}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={clsx(
          'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
          page >= totalPages
            ? 'cursor-not-allowed text-surface-300 dark:text-surface-600'
            : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
