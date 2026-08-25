import { useState } from 'react'
import { Star } from 'lucide-react'
import { clsx } from 'clsx'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const displayRating = hovered ?? rating

  const getStarState = (index: number) => {
    const value = index + 1
    if (value <= Math.floor(displayRating)) return 'full'
    if (value - 0.5 <= displayRating) return 'half'
    return 'empty'
  }

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div
        className={clsx('flex', interactive && 'cursor-pointer')}
        onMouseLeave={() => interactive && setHovered(null)}
      >
        {Array.from({ length: maxStars }).map((_, i) => {
          const state = getStarState(i)
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              className={clsx(
                'relative p-0 border-0 bg-transparent',
                interactive && 'cursor-pointer hover:scale-110 transition-transform'
              )}
              onMouseEnter={() => interactive && setHovered(i)}
              onClick={() => handleClick(i)}
            >
              {state === 'full' && (
                <Star
                  className={clsx(sizeClasses[size], 'fill-amber-400 text-amber-400')}
                />
              )}
              {state === 'half' && (
                <div className="relative">
                  <Star
                    className={clsx(sizeClasses[size], 'text-surface-300 dark:text-surface-600')}
                  />
                  <div className="absolute inset-0 overflow-hidden w-[50%]">
                    <Star
                      className={clsx(sizeClasses[size], 'fill-amber-400 text-amber-400')}
                    />
                  </div>
                </div>
              )}
              {state === 'empty' && (
                <Star
                  className={clsx(sizeClasses[size], 'text-surface-300 dark:text-surface-600')}
                />
              )}
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-medium text-surface-600 dark:text-surface-400">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
