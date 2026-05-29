'use client'

interface HeaderProps {
  search: string
  onSearch: (v: string) => void
  onNewTask: () => void
  onToggleSidebar: () => void
  darkMode: boolean
  onToggleDark: () => void
  userEmail?: string
  onLogout: () => void
}

export function Header({
  search, onSearch, onNewTask, onToggleSidebar, darkMode, onToggleDark, userEmail, onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-[100] h-14 bg-surface-1 border-b border-border flex items-center gap-3 px-4 flex-shrink-0">
      <button
        onClick={onToggleSidebar}
        className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-foreground/60"
        aria-label="Menü"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect y="3" width="18" height="1.5" rx="0.75" fill="currentColor" />
          <rect y="8.25" width="18" height="1.5" rx="0.75" fill="currentColor" />
          <rect y="13.5" width="18" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">⌕</span>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Aufgaben suchen…"
          className="w-full bg-surface-2 border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground outline-none focus:border-violet-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onNewTask}
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <span className="text-base leading-none">+</span>
          <span className="hidden sm:inline">Neue Aufgabe</span>
        </button>

        <button
          onClick={onToggleDark}
          className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-foreground/60 text-sm"
          title="Dark / Light Mode"
        >
          {darkMode ? '☀' : '☾'}
        </button>

        {userEmail && (
          <div className="relative group">
            <button className="w-8 h-8 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
              {userEmail[0].toUpperCase()}
            </button>
            <div className="absolute right-0 top-full mt-1 bg-surface-1 border border-border rounded-xl p-1 shadow-xl hidden group-hover:block min-w-[160px] z-50">
              <div className="px-3 py-1.5 text-xs text-muted-foreground truncate border-b border-border mb-1">
                {userEmail}
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-2 rounded-lg transition-colors text-rose-400"
              >
                Abmelden
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
