import type { CategoryConfig, PriorityConfig, StatusConfig, ViewConfig } from '@/types'

export const CATEGORIES: CategoryConfig[] = [
  { id: 'privat',     label: 'Privat',      icon: '🏠' },
  { id: 'arbeit',     label: 'Arbeit',      icon: '💼' },
  { id: 'studium',    label: 'Studium',     icon: '🎓' },
  { id: 'lernen',     label: 'Lernen',      icon: '📚' },
  { id: 'auto',       label: 'Auto',        icon: '🚗' },
  { id: 'gesundheit', label: 'Gesundheit',  icon: '❤️' },
  { id: 'finanzen',   label: 'Finanzen',    icon: '💰' },
  { id: 'sonstiges',  label: 'Sonstiges',   icon: '📌' },
]

export const PRIORITIES: PriorityConfig[] = [
  { id: 'niedrig',  label: 'Niedrig',  color: '#6DBF8E', bg: 'rgba(109,191,142,0.12)', dot: '🟢' },
  { id: 'mittel',   label: 'Mittel',   color: '#F4B942', bg: 'rgba(244,185,66,0.12)',  dot: '🟡' },
  { id: 'hoch',     label: 'Hoch',     color: '#E8724A', bg: 'rgba(232,114,74,0.12)',  dot: '🟠' },
  { id: 'kritisch', label: 'Kritisch', color: '#D63E5E', bg: 'rgba(214,62,94,0.12)',   dot: '🔴' },
]

export const STATUSES: StatusConfig[] = [
  { id: 'offen',          label: 'Offen',           color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  { id: 'in_bearbeitung', label: 'In Bearbeitung',  color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  { id: 'wartet',         label: 'Wartet',          color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  { id: 'erledigt',       label: 'Erledigt',        color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  { id: 'verschoben',     label: 'Verschoben',      color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
]

export const VIEWS: ViewConfig[] = [
  { id: 'dashboard',    label: 'Dashboard',        icon: '◈' },
  { id: 'alle',         label: 'Alle Aufgaben',    icon: '≡' },
  { id: 'heute',        label: 'Heute',            icon: '◉' },
  { id: 'woche',        label: 'Diese Woche',      icon: '⬡' },
  { id: 'ueberfaellig', label: 'Überfällig',       icon: '⚡' },
  { id: 'erledigt',     label: 'Erledigt',         icon: '✓' },
]

export const MOTIVATION_MESSAGES = [
  'Ausgezeichnet! Du machst Fortschritte. 💪',
  'Weiter so — du bist auf dem richtigen Weg. 🎯',
  'Erledigt! Ein Schritt nach vorne. ✨',
  'Stark. Nichts bleibt offen, was du anpackst. 🚀',
  'Sehr gut! Jede erledigte Aufgabe zählt. ⭐',
  'Du rockst das! Weiter so. 🔥',
]

export const DEFAULT_FILTERS = {
  search: '',
  category: 'alle' as const,
  priority: 'alle' as const,
  status: 'alle' as const,
  sortBy: 'due_date' as const,
  sortDir: 'asc' as const,
}
