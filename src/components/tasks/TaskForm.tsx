'use client'

import { useState, useEffect } from 'react'
import { Modal, Input, Textarea, Select, Label, Button } from '@/components/ui'
import { CATEGORIES, PRIORITIES, STATUSES } from '@/lib/constants'
import { parseTags } from '@/lib/utils'
import type { Task, NewTask } from '@/types'

interface TaskFormProps {
  initial?: Task | null
  onSave: (data: Omit<NewTask, 'status'> & { status: Task['status'] }) => Promise<void>
  onClose: () => void
}

interface FormState {
  title: string
  description: string
  category: string
  priority: string
  status: string
  due_date: string
  reminder_date: string
  repeat_rule: string
  tags: string
  notes: string
}

const emptyForm: FormState = {
  title: '', description: '', category: 'sonstiges', priority: 'mittel',
  status: 'offen', due_date: '', reminder_date: '', repeat_rule: 'none', tags: '', notes: '',
}

export function TaskForm({ initial, onSave, onClose }: TaskFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title ?? '',
        description: initial.description ?? '',
        category: initial.category ?? 'sonstiges',
        priority: initial.priority ?? 'mittel',
        status: initial.status ?? 'offen',
        due_date: initial.due_date ?? '',
        reminder_date: initial.reminder_date ? initial.reminder_date.slice(0, 16) : '',
        repeat_rule: initial.repeat_rule ?? 'none',
        tags: initial.tags?.join(', ') ?? '',
        notes: initial.notes ?? '',
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [initial])

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Titel ist erforderlich'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description || null,
        category: form.category as Task['category'],
        priority: form.priority as Task['priority'],
        status: form.status as Task['status'],
        due_date: form.due_date || null,
        reminder_date: form.reminder_date ? new Date(form.reminder_date).toISOString() : null,
        repeat_rule: form.repeat_rule === 'none' ? null : (form.repeat_rule as Task['repeat_rule']),
        tags: parseTags(form.tags),
        notes: form.notes || null,
        completed_at: initial?.completed_at ?? null,
        deleted_at: null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h2 className="font-display text-xl mb-5">
          {initial ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
        </h2>

        <div className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <Label>Titel <span className="text-rose-400">*</span></Label>
            <Input
              value={form.title}
              onChange={set('title')}
              placeholder="Was muss erledigt werden?"
              autoFocus
              className={errors.title ? 'border-rose-500' : ''}
            />
            {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <Label>Beschreibung</Label>
            <Textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Details, Kontext, Hinweise…"
              rows={3}
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kategorie</Label>
              <Select value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Priorität</Label>
              <Select value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>{p.dot} {p.label}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Status + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Fälligkeit</Label>
              <Input type="date" value={form.due_date} onChange={set('due_date')} />
            </div>
          </div>

          {/* Reminder + Repeat */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Erinnerung</Label>
              <Input type="datetime-local" value={form.reminder_date} onChange={set('reminder_date')} />
            </div>
            <div>
              <Label>Wiederholen</Label>
              <Select value={form.repeat_rule} onChange={set('repeat_rule')}>
                <option value="none">Nie</option>
                <option value="daily">Täglich</option>
                <option value="weekly">Wöchentlich</option>
                <option value="monthly">Monatlich</option>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (kommagetrennt)</Label>
            <Input
              value={form.tags}
              onChange={set('tags')}
              placeholder="z.B. Mathe, Klausur, dringend"
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notizen</Label>
            <Textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Weitere Notizen…"
              rows={2}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={saving || !form.title.trim()}
            className="flex-[2]"
          >
            {saving ? 'Speichern…' : initial ? 'Speichern' : 'Aufgabe hinzufügen'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
