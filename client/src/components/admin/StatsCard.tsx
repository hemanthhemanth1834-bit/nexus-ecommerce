import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ElementType } from 'react'

interface StatsCardProps {
  icon: ElementType
  label: string
  value: number
  prefix?: string
  suffix?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

function useAnimatedCounter(target: number, duration = 1000) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = performance.now()
    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(eased * target))
      if (progress < 1) {
        start = requestAnimationFrame(step)
      }
    }
    start = requestAnimationFrame(step)
    return () => cancelAnimationFrame(start)
  }, [target, duration])

  return current
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  prefix = '',
  suffix = '',
  trend,
}: StatsCardProps) {
  const animatedValue = useAnimatedCounter(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-white dark:bg-surface-900',
        'border border-surface-200 dark:border-surface-800',
        'hover:shadow-lg transition-shadow duration-300'
      )}
    >
      <div className="absolute top-0 right-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-brand-500/10 to-purple-500/10" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
            <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          {trend && (
            <div
              className={clsx(
                'flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium',
                trend.direction === 'up'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          {prefix}
          {animatedValue.toLocaleString()}
          {suffix}
        </p>
      </div>
    </motion.div>
  )
}
