'use client'

import { useMemo } from 'react'
import { cn, getCategory, getPriority, getDueDateStyle, greetingByTime, formatDate } from '@/lib/utils'
import { ProgressBar } from '@/components/ui'
import type { Task, DashboardStats } from '@/types'

interface DashboardProps {
  tasks: Task[]
  stats: DashboardStats
  setView: (v: string) => void
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
}

export function Dashboard({ tasks, stats, setView, onToggle, onEdit }: DashboardProps) {
  const today = new Date().toISOString().slice(0, 10)
  const overdueTasks = tasks
    .filter((t) => t.due_date && t.due_date < today && t.status !== 'erledigt')
    .slice(0, 4)
  const todayTasks = tasks
    .filter((t) => t.due_date === today && t.status !== 'erledigt')
    .slice(0, 4)
  const highPrio = tasks
    .filter((t) => (t.priority === 'hoch' || t.priority === 'kritisch') && t.status !== 'erledigt')
    .slice(0, 4)

  const statCards = [
    { label: 'Heute fällig',   value: stats.today,        color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', icon: '◉', action: 'heute' },
    { label: 'Überfällig',     value: stats.overdue,      color: '#D63E5E', bg: 'rgba(214,62,94,0.1)',   icon: '⚡', action: 'ueberfaellig' },
    { label: 'Hohe Priorität', value: stats.highPriority, color: '#E8724A', bg: 'rgba(232,114,74,0.1)',  icon: '↑', action: 'alle' },
    { label: 'Erledigt',       value: stats.done,         color: '#10B981', bg: 'rgba(16,185,129,0.1)',  icon: '✓', action: 'erledigt' },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl tracking-tight mb-1">
          {greetingByTime()} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {stats.open > 0 && ` · ${stats.open} offene Aufgaben`}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <button
            key={s.label}
            onClick={() => setView(s.action)}
            className="text-left bg-surface-1 border border-border rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150 group"
          >
            <div className="text-lg mb-2 opacity-70" style={{ color: s.color }}>{s.icon}</div>
            <div className="text-2xl font-bold tracking-tight mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-surface-1 border border-border rounded-xl p-5">
        <div className="flex justify-between text-sm mb-3">
          <span className="font-semibold">Gesamtfortschritt</span>
          <span className="text-muted-foreground">{stats.done} / {stats.total} erledigt</span>
        </div>
        <ProgressBar value={stats.done} max={stats.total} />
        <div className="text-xs text-muted-foreground mt-2">
          {stats.completionRate}% aller Aufgaben abgeschlossen
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashCard
          title="⚡ Überfällig"
          titleColor="#D63E5E"
          tasks={overdueTasks}
          emptyText="Nichts überfällig 🎉"
          onMore={stats.overdue > 4 ? () => setView('ueberfaellig') : undefined}
          onToggle={onToggle}
          onEdit={onEdit}
        />
        <DashCard
          title="◉ Heute fällig"
          titleColor="#A78BFA"
          tasks={todayTasks}
          emptyText="Heute ist nichts fällig"
          onMore={stats.today > 4 ? () => setView('heute') : undefined}
          onToggle={onToggle}
          onEdit={onEdit}
        />
      </div>

      {/* High priority */}
      {highPrio.length > 0 && (
        <DashCard
          title="↑ Hohe Priorität"
          titleColor="#E8724A"
          tasks={highPrio}
          emptyText=""
          onToggle={onToggle}
          onEdit={onEdit}
        />
      )}

      {/* Category breakdown */}
      {stats.byCat.length > 0 && (
        <div className="bg-surface-1 border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Offene Aufgaben nach Kategorie</h3>
          <div className="space-y-3">
            {stats.byCat.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center gap-3 text-sm">
                <span className="w-5">{c.icon}</span>
                <span className="w-24 text-muted-foreground truncate">{c.label}</span>
                <div className="flex-1 bg-surface-3 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-violet-500/60 rounded-full transition-all duration-500"
                    style={{ width: `${(c.count / (stats.byCat[0]?.count || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-muted-foreground text-xs w-4 text-right">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Mini dash card ───────────────────────────────────────────────────────────

function DashCard({
  title, titleColor, tasks, emptyText, onMore, onToggle, onEdit,
}: {
  title: string
  titleColor: string
  tasks: Task[]
  emptyText: string
  onMore?: () => void
  onToggle: (t: Task) => void
  onEdit: (t: Task) => void
}) {
  return (
    <div className="bg-surface-1 border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: titleColor }}>{title}</h3>
        {onMore && (
          <button onClick={onMore} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Alle →
          </button>
        )}
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <MiniTaskRow key={t.id} task={t} onToggle={() => onToggle(t)} onEdit={() => onEdit(t)} />
          ))}
        </div>
      )}
    </div>
  )
}

function MiniTaskRow({ task, onToggle, onEdit }: { task: Task; onToggle: () => void; onEdit: () => void }) {
  const prio = getPriority(task.priority)
  return (
    <div className="flex items-center gap-2 py-1 border-b border-border/50 last:border-0 group">
      <button
        onClick={onToggle}
        className="w-4 h-4 rounded-full border border-border hover:border-violet-400 flex-shrink-0 transition-colors"
      />
      <span className="flex-1 text-xs truncate">{task.title}</span>
      <span className="text-[10px] font-semibold" style={{ color: prio.color }}>
        {prio.label.slice(0, 3).toUpperCase()}
      </span>
      <button onClick={onEdit} className="opacity-0 group-hover:opacity-60 text-xs transition-opacity">✎</button>
    </div>
  )
}
