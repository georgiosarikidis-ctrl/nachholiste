'use client'

import { useState, useCallback } from 'react'
import type { TaskFilters } from '@/types'
import { DEFAULT_FILTERS } from '@/lib/constants'

export function useFilters() {
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS)

  const setFilter = useCallback(
    <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'alle' ||
    filters.priority !== 'alle' ||
    filters.status !== 'alle'

  return { filters, setFilter, reset, hasActiveFilters }
}
