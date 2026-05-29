'use client'

import type { ToastType } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

interface ToastProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>
  dismiss: (id: string) => void
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-emerald-500',
  error:   'bg-rose-500',
  info:    'bg-violet-500',
  warning: 'bg-amber-500',
}

export function ToastContainer({ toasts, dismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto px-5 py-2.5 rounded-xl text-white text-sm font-medium shadow-2xl',
            'animate-in slide-in-from-bottom-4 fade-in duration-300',
            typeStyles[t.type]
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
