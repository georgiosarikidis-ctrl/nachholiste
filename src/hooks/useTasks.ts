'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  fetchTasks,
  createTask,
  updateTask,
  toggleTaskDone,
  deleteTask,
} from '@/lib/tasks'
import { computeStats } from '@/lib/utils'
import type { Task, NewTask, UpdateTask, DashboardStats } from '@/types'

interface UseTasksReturn {
  tasks: Task[]
  stats: DashboardStats
  loading: boolean
  error: string | null
  add: (payload: NewTask) => Promise<void>
  update: (id: string, payload: UpdateTask) => Promise<void>
  toggle: (task: Task) => Promise<void>
  remove: (id: string) => Promise<void>
  reload: () => Promise<void>
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchTasks()
      setTasks(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    load()
  }, [load])

  // Poll every 30s for cross-device sync
  useEffect(() => {
    const interval = setInterval(() => {
      load()
    }, 30000)
    return () => clearInterval(interval)
  }, [load])

  const add = useCallback(async (payload: NewTask) => {
    try {
      const created = await createTask(payload)
      setTasks((prev) => [created, ...prev])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fehler beim Erstellen')
      throw e
    }
  }, [])

  const update = useCallback(async (id: string, payload: UpdateTask) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...payload, updated_at: new Date().toISOString() } : t
      )
    )
    try {
      const updated = await updateTask(id, payload)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (e: unknown) {
      await load() // rollback
      setError(e instanceof Error ? e.message : 'Fehler beim Aktualisieren')
      throw e
    }
  }, [load])

  const toggle = useCallback(async (task: Task) => {
    const isDone = task.status !== 'erledigt'
    // Optimistic toggle
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: isDone ? 'erledigt' : 'offen', completed_at: isDone ? new Date().toISOString() : null }
          : t
      )
    )
    try {
      const updated = await toggleTaskDone(task)
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    } catch (e: unknown) {
      await load()
      setError(e instanceof Error ? e.message : 'Fehler')
      throw e
    }
  }, [load])

  const remove = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await deleteTask(id)
    } catch (e: unknown) {
      await load()
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen')
      throw e
    }
  }, [load])

  return {
    tasks,
    stats: computeStats(tasks),
    loading,
    error,
    add,
    update,
    toggle,
    remove,
    reload: load,
  }
}