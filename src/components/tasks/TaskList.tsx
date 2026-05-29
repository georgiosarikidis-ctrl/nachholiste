'use client'

import { useMemo } from 'react'
import { TaskCard } from './TaskCard'
import { EmptyState } from '@/components/ui'
import { filterTasks } from '@/lib/utils'
import { CATEGORIES, PRIORITIES, STATUSES, VIEWS } from '@/lib/constants'
import type { Task, TaskFilters } from '@/types'

interface TaskListProps {
  tasks: Task[]
  view: string
  filters: TaskFilters
  onFilterChange: <K extends keyof TaskFilters>(k: K, v: TaskFilters[K]) => void
  onResetFilters: () => void
  hasActiveFilters: boolean
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, s: Task['status']) => void
}

const emptyMessages: Record<string, { icon: string; title: string; subtitle: string }> = {
  alle:         { icon: '✓', title: 'Keine offenen Aufgaben', subtitle: 'Alle Aufgaben erledigt oder noch keine angelegt.' },
  heute:        { icon: '◉', title: 'Heute nichts fällig', subtitle: 'Genieß den Tag!' },
  woche:        { icon: '⬡', title: 'Diese Woche nichts fällig', subtitle: 'Eine entspannte Woche liegt vor dir.' },
  ueberfaellig: { icon: '⚡', title: 'Keine überfälligen Aufgaben', subtitle: 'Alles im grünen Bereich 🎉' },
  erledigt:     { icon: '✓', title: 'Noch nichts erledigt', subtitle: 'Hak deine erste Aufgabe ab!' },
}

export function TaskList({
  tasks, view, filters, onFilterChange, onResetFilters, hasActiveFilters,
  onToggle, onEdit, onDelete, onStatusChange,
}: TaskListProps) {
  const filtered = useMemo(() => filterTasks(tasks, view, filters), [tasks, view, filters])
  const viewConfig = VIEWS.find((v) => v.id === view)
  const empty = emptyMessages[view] ?? emptyMessages.alle

  return (
    <div className="animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-1">
          <h1 className="font-display text-2xl tracking-tight">{viewConfig?.label}</h1>
          <span className="text-muted-foreground text-sm ml-2">({filtered.length})</span>
        </div>

        <div className="flex gap-2 ml-auto flex-wrap">
          {/* Category filter — only for 'alle' view */}
          {view === 'alle' && (
            <FilterSelect
              value={filters.category}
              onChange={(v) => onFilterChange('category', v as TaskFilters['category'])}
              options={[
                { value: 'alle', label: 'Alle Kategorien' },
                ...CATEGORIES.map((c) => ({ value: c.id, label: `${c.icon} ${c.label}` })),
              ]}
            />
          )}

          {view === 'alle' && (
            <FilterSelect
              value={filters.priority}
              onChange={(v) => onFilterChange('priority', v as TaskFilters['priority'])}
              options={[
                { value: 'alle', label: 'Alle Prioritäten' },
                ...PRIORITIES.map((p) => ({ value: p.id, label: `${p.dot} ${p.label}` })),
              ]}
            />
          )}

          {view === 'alle' && (
            <FilterSelect
              value={filters.status}
              onChange={(v) => onFilterChange('status', v as TaskFilters['status'])}
              options={[
                { value: 'alle', label: 'Alle Status' },
                ...STATUSES.filter((s) => s.id !== 'erledigt').map((s) => ({ value: s.id, label: s.label })),
              ]}
            />
          )}

          <FilterSelect
            value={filters.sortBy}
            onChange={(v) => onFilterChange('sortBy', v as TaskFilters['sortBy'])}
            options={[
              { value: 'due_date',   label: 'Fälligkeit' },
              { value: 'priority',   label: 'Priorität' },
              { value: 'created_at', label: 'Erstellt' },
              { value: 'title',      label: 'Titel A–Z' },
            ]}
          />

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg border border-rose-400/30 hover:border-rose-400 transition-colors"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={empty.icon} title={empty.title} subtitle={empty.subtitle} />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              index={i}
              onToggle={() => onToggle(task)}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task.id)}
              onStatusChange={(s) => onStatusChange(task.id, s)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none cursor-pointer focus:border-violet-500 transition-colors"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
