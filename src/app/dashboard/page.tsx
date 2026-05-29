'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Dashboard } from '@/components/tasks/Dashboard'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskForm } from '@/components/tasks/TaskForm'
import { DeleteConfirm } from '@/components/tasks/DeleteConfirm'
import { ToastContainer } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui'
import { useTasks } from '@/hooks/useTasks'
import { useFilters } from '@/hooks/useFilters'
import { useToast } from '@/hooks/useToast'
import { randomMotivation } from '@/lib/utils'
import type { Task, NewTask } from '@/types'

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string; id: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView] = useState('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { tasks, stats, loading, add, update, toggle, remove } = useTasks()
  const { filters, setFilter, reset: resetFilters, hasActiveFilters } = useFilters()
  const { toasts, show: showToast, dismiss } = useToast()

  // Dark mode persistence
  useEffect(() => {
    const stored = localStorage.getItem('nachholiste_dark')
    if (stored !== null) setDarkMode(stored === 'true')
  }, [])

  useEffect(() => {
    localStorage.setItem('nachholiste_dark', String(darkMode))
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  // Auth check
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.href = '/'
      else setUser({ email: session.user.email ?? '', id: session.user.id })
      setAuthLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleAdd = async (data: Parameters<typeof add>[0]) => {
    try {
      await add(data)
      showToast('Aufgabe hinzugefügt ✓')
      setShowForm(false)
      setEditTask(null)
    } catch {
      showToast('Fehler beim Speichern', 'error')
    }
  }

  const handleUpdate = async (data: Partial<NewTask>) => {
    if (!editTask) return
    try {
      await update(editTask.id, data)
      showToast('Aufgabe aktualisiert ✓')
      setShowForm(false)
      setEditTask(null)
    } catch {
      showToast('Fehler beim Aktualisieren', 'error')
    }
  }

  const handleToggle = async (task: Task) => {
    try {
      await toggle(task)
      if (task.status !== 'erledigt') showToast(randomMotivation())
    } catch {
      showToast('Fehler', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await remove(deleteId)
      showToast('Aufgabe gelöscht', 'info')
      setDeleteId(null)
    } catch {
      showToast('Fehler beim Löschen', 'error')
    }
  }

  const openEdit = useCallback((task: Task) => {
    setEditTask(task)
    setShowForm(true)
  }, [])

  const handleSearch = (v: string) => {
    setFilter('search', v)
    if (view === 'dashboard') setView('alle')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header
        search={filters.search}
        onSearch={handleSearch}
        onNewTask={() => { setEditTask(null); setShowForm(true) }}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          view={view}
          setView={(v) => { setView(v); if (v !== 'alle') resetFilters() }}
          stats={stats}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          filterCat={filters.category}
          setFilterCat={(c) => setFilter('category', c as typeof filters.category)}
        />

        {/* Main scroll area */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7">
          {loading ? (
            <Spinner />
          ) : view === 'dashboard' ? (
            <Dashboard
              tasks={tasks}
              stats={stats}
              setView={setView}
              onToggle={handleToggle}
              onEdit={openEdit}
            />
          ) : (
            <TaskList
              tasks={tasks}
              view={view}
              filters={filters}
              onFilterChange={setFilter}
              onResetFilters={resetFilters}
              hasActiveFilters={hasActiveFilters}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={setDeleteId}
              onStatusChange={(id, s) => update(id, { status: s })}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {showForm && (
        <TaskForm
          initial={editTask}
          onSave={editTask ? handleUpdate : handleAdd}
          onClose={() => { setShowForm(false); setEditTask(null) }}
        />
      )}

      {deleteId && (
        <DeleteConfirm
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
