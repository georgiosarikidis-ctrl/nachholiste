// ─── Core Domain Types ────────────────────────────────────────────────────────

export type Priority = 'niedrig' | 'mittel' | 'hoch' | 'kritisch'
export type Status = 'offen' | 'in_bearbeitung' | 'wartet' | 'erledigt' | 'verschoben'
export type Category =
  | 'privat'
  | 'arbeit'
  | 'studium'
  | 'lernen'
  | 'auto'
  | 'gesundheit'
  | 'finanzen'
  | 'sonstiges'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  category: Category
  priority: Priority
  status: Status
  due_date: string | null        // ISO date string YYYY-MM-DD
  reminder_date: string | null   // ISO datetime string
  repeat_rule: RepeatRule | null
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  deleted_at: string | null
}

export type RepeatRule = 'daily' | 'weekly' | 'monthly' | 'none'

export type NewTask = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export type UpdateTask = Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>

// ─── UI Config Types ──────────────────────────────────────────────────────────

export interface PriorityConfig {
  id: Priority
  label: string
  color: string
  bg: string
  dot: string
}

export interface StatusConfig {
  id: Status
  label: string
  color: string
  bg: string
}

export interface CategoryConfig {
  id: Category
  label: string
  icon: string
}

export interface ViewConfig {
  id: string
  label: string
  icon: string
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number
  open: number
  done: number
  overdue: number
  today: number
  thisWeek: number
  highPriority: number
  byCat: Array<CategoryConfig & { count: number }>
  completionRate: number
}

// ─── Filter & Sort ────────────────────────────────────────────────────────────

export interface TaskFilters {
  search: string
  category: Category | 'alle'
  priority: Priority | 'alle'
  status: Status | 'alle'
  sortBy: 'due_date' | 'priority' | 'created_at' | 'title'
  sortDir: 'asc' | 'desc'
}

// ─── Supabase DB Row (snake_case as returned by Supabase) ─────────────────────

export interface TaskRow {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  priority: string
  status: string
  due_date: string | null
  reminder_date: string | null
  repeat_rule: string | null
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  deleted_at: string | null
}
