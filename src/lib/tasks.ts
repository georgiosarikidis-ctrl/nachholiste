import { createClient } from '@/lib/supabase/client'
import type { Task, NewTask, UpdateTask } from '@/types'

const TABLE = 'tasks'

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function fetchTasks(): Promise<Task[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

export async function fetchTaskById(id: string): Promise<Task | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Task
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createTask(payload: NewTask): Promise<Task> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Nicht eingeloggt')

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      ...payload,
      user_id: user.id,
      tags: payload.tags ?? [],
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Task
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateTask(id: string, payload: UpdateTask): Promise<Task> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Task
}

// ─── Toggle done ──────────────────────────────────────────────────────────────

export async function toggleTaskDone(task: Task): Promise<Task> {
  const isDone = task.status !== 'erledigt'
  return updateTask(task.id, {
    status: isDone ? 'erledigt' : 'offen',
    completed_at: isDone ? new Date().toISOString() : null,
  })
}

// ─── Soft delete ──────────────────────────────────────────────────────────────

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─── Hard delete (permanent) ──────────────────────────────────────────────────

export async function hardDeleteTask(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Realtime subscription ────────────────────────────────────────────────────

export function subscribeToTasks(
  userId: string,
  onChange: (payload: { eventType: string; new: Task | null; old: Task | null }) => void
) {
  const supabase = createClient()
  const channel = supabase
    .channel('tasks-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE,
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onChange({
          eventType: payload.eventType,
          new: (payload.new as Task) ?? null,
          old: (payload.old as Task) ?? null,
        })
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
