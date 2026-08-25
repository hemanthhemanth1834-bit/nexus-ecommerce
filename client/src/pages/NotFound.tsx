import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-[10rem] md:text-[14rem] font-black leading-none bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white mt-4">
            Page Not Found
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mt-3 max-w-md mx-auto">
            The page you are looking for does not exist or has been moved.
            Let us get you back on track.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <Link to="/">
            <Button variant="primary" size="lg">
              <Home size={18} className="mr-2" />
              Go Home
            </Button>
          </Link>
          <Button variant="secondary" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-16"
        >
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-brand-400/40"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
