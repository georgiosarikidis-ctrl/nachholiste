'use client'

import { useState } from 'react'
import { cn, getPriority, getStatus, getCategory, getDueDateStyle } from '@/lib/utils'
import { Badge } from '@/components/ui'
import { STATUSES } from '@/lib/constants'
import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: Task['status']) => void
  index?: number
}

export function TaskCard({ task, onToggle, onEdit, onDelete, onStatusChange, index = 0 }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)

  const prio = getPriority(task.priority)
  const status = getStatus(task.status)
  const cat = getCategory(task.category)
  const dueDateStyle = getDueDateStyle(task)
  const isDone = task.status === 'erledigt'

  return (
    <div
      className={cn(
        'group relative bg-surface-1 border rounded-xl px-4 py-3.5',
        'transition-all duration-150 hover:-translate-y-px hover:shadow-md',
        'animate-in fade-in slide-in-from-bottom-2',
        dueDateStyle.isUrgent && !isDone ? 'border-rose-500/20' : 'border-border',
        isDone && 'opacity-55'
      )}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: isDone ? '#10B981' : prio.color,
        animationDelay: `${index * 40}ms`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
            'transition-all duration-200',
            isDone
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-border hover:border-violet-400'
          )}
        >
          {isDone && <span className="text-[9px] text-white font-bold">✓</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={cn(
                'text-sm font-medium leading-snug',
                isDone && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </span>
            <Badge color={prio.color} bg={prio.bg}>
              {prio.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {cat.icon} {cat.label}
            </span>
          </div>

          {/* Description preview */}
          {task.description && (
            <p
              className={cn(
                'text-xs text-muted-foreground mb-2 leading-relaxed',
                !expanded && 'truncate'
              )}
            >
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Inline status selector */}
            <select
              value={task.status}
              onChange={(e) => onStatusChange(e.target.value as Task['status'])}
              onClick={(e) => e.stopPropagation()}
              className="text-xs rounded-md px-2 py-0.5 border outline-none cursor-pointer transition-all"
              style={{
                color: status.color,
                borderColor: `${status.color}50`,
                background: status.bg,
              }}
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id} style={{ background: 'inherit', color: 'inherit' }}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Due date */}
            {task.due_date && (
              <span className={cn('text-xs font-medium', dueDateStyle.className)}>
                {dueDateStyle.label}
              </span>
            )}

            {/* Tags */}
            {task.tags?.map((tag) => (
              <span key={tag} className="text-[10px] text-muted-foreground bg-surface-2 rounded-md px-1.5 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {task.description && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-surface-2 text-muted-foreground text-xs transition-colors"
              title={expanded ? 'Weniger' : 'Mehr'}
            >
              {expanded ? '▲' : '▼'}
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-surface-2 text-muted-foreground transition-colors"
            title="Bearbeiten"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M9 2L11 4L4 11H2V9L9 2Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400 transition-colors"
            title="Löschen"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 3H10M4 3V2H8V3M5 5.5V9M7 5.5V9M3 3L3.5 10H8.5L9 3H3Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
