import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  format,
  isToday,
  isThisWeek,
  isPast,
  isFuture,
  differenceInDays,
  parseISO,
  startOfDay,
} from 'date-fns'
import { de } from 'date-fns/locale'
import type { Task, DashboardStats, Priority, Status, Category } from '@/types'
import { CATEGORIES, PRIORITIES, STATUSES, MOTIVATION_MESSAGES } from './constants'

// ─── Tailwind class merge ─────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Config lookups ───────────────────────────────────────────────────────────

export const getPriority = (id: Priority) =>
  PRIORITIES.find((p) => p.id === id) ?? PRIORITIES[1]

export const getStatus = (id: Status) =>
  STATUSES.find((s) => s.id === id) ?? STATUSES[0]

export const getCategory = (id: Category) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[7]

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const d = parseISO(dateStr)
    return format(d, 'dd.MM.yyyy', { locale: de })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const d = parseISO(dateStr)
    return format(d, "dd.MM.yyyy 'um' HH:mm", { locale: de })
  } catch {
    return dateStr
  }
}

export function formatRelative(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const d = parseISO(dateStr)
    const days = differenceInDays(startOfDay(d), startOfDay(new Date()))
    if (days === 0) return 'Heute'
    if (days === 1) return 'Morgen'
    if (days === -1) return 'Gestern'
    if (days > 1 && days <= 7) return `In ${days} Tagen`
    if (days < -1) return `Vor ${Math.abs(days)} Tagen`
    return formatDate(dateStr)
  } catch {
    return dateStr
  }
}

export function isTaskOverdue(task: Pick<Task, 'due_date' | 'status'>): boolean {
  if (!task.due_date || task.status === 'erledigt') return false
  try {
    return isPast(startOfDay(parseISO(task.due_date))) && !isToday(parseISO(task.due_date))
  } catch {
    return false
  }
}

export function isTaskToday(task: Pick<Task, 'due_date' | 'status'>): boolean {
  if (!task.due_date || task.status === 'erledigt') return false
  try {
    return isToday(parseISO(task.due_date))
  } catch {
    return false
  }
}

export function isTaskThisWeek(task: Pick<Task, 'due_date' | 'status'>): boolean {
  if (!task.due_date || task.status === 'erledigt') return false
  try {
    return isThisWeek(parseISO(task.due_date), { weekStartsOn: 1 })
  } catch {
    return false
  }
}

export function getDueDateStyle(task: Task): {
  label: string
  className: string
  isUrgent: boolean
} {
  if (!task.due_date) return { label: '', className: '', isUrgent: false }

  if (isTaskOverdue(task)) {
    return { label: '⚡ Überfällig', className: 'text-red-400', isUrgent: true }
  }
  if (isTaskToday(task)) {
    return { label: '◉ Heute fällig', className: 'text-violet-400', isUrgent: true }
  }

  const days = differenceInDays(
    startOfDay(parseISO(task.due_date)),
    startOfDay(new Date())
  )
  if (days === 1) return { label: 'Morgen', className: 'text-yellow-400', isUrgent: false }
  if (days <= 7) return { label: `In ${days} Tagen`, className: 'text-muted-foreground', isUrgent: false }
  return { label: formatDate(task.due_date), className: 'text-muted-foreground', isUrgent: false }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function computeStats(tasks: Task[]): DashboardStats {
  const active = tasks.filter((t) => !t.deleted_at)
  const open = active.filter((t) => t.status !== 'erledigt')
  const done = active.filter((t) => t.status === 'erledigt')
  const overdue = active.filter((t) => isTaskOverdue(t))
  const today = active.filter((t) => isTaskToday(t))
  const thisWeek = active.filter((t) => isTaskThisWeek(t))
  const highPriority = open.filter(
    (t) => t.priority === 'hoch' || t.priority === 'kritisch'
  )

  const byCat = CATEGORIES.map((c) => ({
    ...c,
    count: open.filter((t) => t.category === c.id).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count)

  const total = active.length
  const completionRate = total > 0 ? Math.round((done.length / total) * 100) : 0

  return {
    total,
    open: open.length,
    done: done.length,
    overdue: overdue.length,
    today: today.length,
    thisWeek: thisWeek.length,
    highPriority: highPriority.length,
    byCat,
    completionRate,
  }
}

// ─── Task filtering & sorting ─────────────────────────────────────────────────

export function filterTasks(
  tasks: Task[],
  view: string,
  filters: {
    search: string
    category: string
    priority: string
    status: string
    sortBy: string
    sortDir: string
  }
): Task[] {
  let list = tasks.filter((t) => !t.deleted_at)

  // View filter
  switch (view) {
    case 'heute':
      list = list.filter((t) => isTaskToday(t) && t.status !== 'erledigt')
      break
    case 'woche':
      list = list.filter((t) => isTaskThisWeek(t) && t.status !== 'erledigt')
      break
    case 'ueberfaellig':
      list = list.filter((t) => isTaskOverdue(t))
      break
    case 'erledigt':
      list = list.filter((t) => t.status === 'erledigt')
      break
    case 'alle':
    default:
      list = list.filter((t) => t.status !== 'erledigt')
      break
  }

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  }

  // Attribute filters
  if (filters.category !== 'alle') list = list.filter((t) => t.category === filters.category)
  if (filters.priority !== 'alle') list = list.filter((t) => t.priority === filters.priority)
  if (filters.status !== 'alle') list = list.filter((t) => t.status === filters.status)

  // Sort
  const dir = filters.sortDir === 'desc' ? -1 : 1
  const prioOrder: Priority[] = ['niedrig', 'mittel', 'hoch', 'kritisch']

  list.sort((a, b) => {
    switch (filters.sortBy) {
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return dir * a.due_date.localeCompare(b.due_date)
      case 'priority':
        return dir * (prioOrder.indexOf(b.priority) - prioOrder.indexOf(a.priority))
      case 'title':
        return dir * a.title.localeCompare(b.title)
      case 'created_at':
      default:
        return dir * new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return list
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function randomMotivation(): string {
  return MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)]
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function greetingByTime(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Guten Morgen'
  if (h < 18) return 'Guten Tag'
  return 'Guten Abend'
}

export function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}
