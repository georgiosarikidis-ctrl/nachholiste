import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

// ─── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode
  color?: string
  bg?: string
  className?: string
}

export function Badge({ children, color, bg, className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', className)}
      style={{ color: color, backgroundColor: bg }}
    >
      {children}
    </span>
  )
}

// ─── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variantClasses: Record<string, string> = {
  primary:   'bg-violet-600 hover:bg-violet-700 text-white font-semibold',
  secondary: 'bg-surface-2 hover:bg-surface-3 text-foreground border border-border',
  ghost:     'hover:bg-surface-2 text-foreground',
  danger:    'bg-rose-500 hover:bg-rose-600 text-white font-semibold',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed select-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'

// ─── Input ─────────────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground',
        'placeholder:text-muted-foreground outline-none',
        'focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

// ─── Textarea ──────────────────────────────────────────────────────────────────

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground',
        'placeholder:text-muted-foreground outline-none resize-vertical min-h-[80px]',
        'focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

// ─── Select ────────────────────────────────────────────────────────────────────

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground',
        'outline-none cursor-pointer',
        'focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all',
        className
      )}
      {...props}
    />
  )
)
Select.displayName = 'Select'

// ─── Label ─────────────────────────────────────────────────────────────────────

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5', className)}>
      {children}
    </label>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  children: React.ReactNode
  onClose: () => void
  title?: string
}

export function Modal({ children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-1 border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: string
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
      <div className="text-5xl mb-4">{icon}</div>
      <div className="text-base font-semibold mb-1">{title}</div>
      {subtitle && <div className="text-sm">{subtitle}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Spinner ───────────────────────────────────────────────────────────────────

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-7 h-7 border-2 border-border border-t-violet-500 rounded-full animate-spin" />
    </div>
  )
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="bg-surface-3 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
