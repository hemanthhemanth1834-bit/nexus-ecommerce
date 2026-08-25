import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { Toast } from '@/types'

interface ToastContextType { toasts: Toast[]; addToast: (type: Toast['type'], message: string) => void; removeToast: (id: string) => void }

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const icons = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info }
const colors = { success: 'bg-emerald-500', error: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-brand-500' }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])
  const removeToast = useCallback((id: string) => { setToasts(prev => prev.filter(t => t.id !== id)) }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => {
            const Icon = icons[toast.type]
            return (
              <motion.div key={toast.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 100, scale: 0.95 }} className="glass-card p-4 flex items-center gap-3 shadow-elevated">
                <div className={`${colors[toast.type]} rounded-full p-1.5`}><Icon className="w-4 h-4 text-white" /></div>
                <p className="text-sm font-medium flex-1">{toast.message}</p>
                <button onClick={() => removeToast(toast.id)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"><X className="w-4 h-4" /></button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
