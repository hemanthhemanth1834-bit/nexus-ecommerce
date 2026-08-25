import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Button from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
        Error
      </h3>
      <p className="max-w-sm text-sm text-surface-500 dark:text-surface-400 mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </motion.div>
  )
}
