'use client'

import { cn } from '@/lib/utils'
import { VIEWS, CATEGORIES } from '@/lib/constants'
import { ProgressBar } from '@/components/ui'
import type { DashboardStats } from '@/types'

interface SidebarProps {
  view: string
  setView: (v: string) => void
  stats: DashboardStats
  isOpen: boolean
  onClose: () => void
  filterCat: string
  setFilterCat: (c: string) => void
}

export function Sidebar({
  view, setView, stats, isOpen, onClose, filterCat, setFilterCat,
}: SidebarProps) {
  const nav = (v: string) => { setView(v); onClose() }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[150] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 h-screen w-56 z-[160] md:z-auto',
          'bg-surface-1 border-r border-border flex flex-col overflow-y-auto',
          'transition-transform duration-250 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="px-4 h-14 flex items-center border-b border-border flex-shrink-0">
          <span className="font-display text-xl tracking-tight">
            <span className="text-violet-400">nach</span>holen
          </span>
        </div>

        {/* Views */}
        <div className="pt-4 pb-2">
          <div className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Ansichten
          </div>
          {VIEWS.map((v) => {
            const badge =
              v.id === 'heute' ? stats.today
              : v.id === 'ueberfaellig' ? stats.overdue
              : null
            return (
              <button
                key={v.id}
                onClick={() => nav(v.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-all duration-150',
                  'border-l-2 hover:bg-surface-2',
                  view === v.id
                    ? 'border-violet-500 bg-violet-500/10 text-violet-400 font-semibold'
                    : 'border-transparent text-foreground/70'
                )}
              >
                <span className="w-4 text-center text-sm">{v.icon}</span>
                <span className="flex-1">{v.label}</span>
                {badge !== null && badge > 0 && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white',
                      v.id === 'ueberfaellig' ? 'bg-rose-500' : 'bg-violet-500'
                    )}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Categories */}
        <div className="pt-4 pb-2">
          <div className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Kategorien
          </div>
          {CATEGORIES.map((c) => {
            const count = stats.byCat.find((x) => x.id === c.id)?.count ?? 0
            return (
              <button
                key={c.id}
                onClick={() => { setFilterCat(c.id); nav('alle') }}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-1.5 text-xs text-left transition-all',
                  'hover:bg-surface-2',
                  filterCat === c.id && view === 'alle'
                    ? 'bg-surface-2 text-foreground font-medium'
                    : 'text-foreground/60'
                )}
              >
                <span>{c.icon}</span>
                <span className="flex-1">{c.label}</span>
                {count > 0 && <span className="text-muted-foreground">{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Footer progress */}
        <div className="mt-auto p-4 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Fortschritt</span>
            <span>{stats.completionRate}%</span>
          </div>
          <ProgressBar value={stats.done} max={stats.total} />
          <div className="text-[11px] text-muted-foreground mt-1.5">
            {stats.done} von {stats.total} erledigt
          </div>
        </div>
      </aside>
    </>
  )
}
