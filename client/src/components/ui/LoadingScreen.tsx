import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-0 dark:bg-surface-950">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-brand-200 dark:border-brand-800 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-brand-500 rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-surface-500">Loading...</p>
      </motion.div>
    </div>
  )
}
