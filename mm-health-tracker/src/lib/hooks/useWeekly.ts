import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useApp } from '@/lib/context-supabase'
import { WeeklyService } from '@/lib/services/weekly.service'
import { ProfileService } from '@/lib/services/profile.service'
import type { Database } from '@/lib/supabase/database.types'

type WeeklyEntry = Database['public']['Tables']['weekly_entries']['Row']

interface WeeklyObjective {
  id: string
  objective: string
  completed: boolean
  order: number
}

interface UseWeeklyReturn {
  entry: WeeklyEntry | null
  objectives: WeeklyObjective[]
  whyImportant: string | null
  fridayReview: string | null
  reviewCompleted: boolean
  loading: boolean
  error: string | null
  updateObjectives: (
    objectives: WeeklyObjective[],
    whyImportant: string
  ) => Promise<WeeklyEntry>
  toggleObjectiveCompletion: (objectiveId: string) => Promise<WeeklyEntry>
  updateFridayReview: (review: string) => Promise<WeeklyEntry>
  reload: () => Promise<void>
}

/**
 * Hook for managing weekly objectives and reviews
 * @param weekStartDate - Monday's date in YYYY-MM-DD format
 */
export function useWeekly(weekStartDate: string): UseWeeklyReturn {
  const { user } = useApp()

  const [entry, setEntry] = useState<WeeklyEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getWeeklyService = useCallback(async () => {
    if (!user?.id) throw new Error('Not authenticated')

    // Just use the standard supabase client - no token needed
    const profileService = new ProfileService(supabase)
    const profile = await profileService.get(user.id)

    if (!profile) throw new Error('Profile not found')

    return new WeeklyService(supabase, profile.id)
  }, [user?.id])

  const loadWeeklyEntry = useCallback(async () => {
    if (!user?.id) {
      setEntry(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const weeklyService = await getWeeklyService()
      const data = await weeklyService.getByWeekStart(weekStartDate)

      setEntry(data)
    } catch (err) {
      console.error('Error loading weekly entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to load weekly entry')
    } finally {
      setLoading(false)
    }
  }, [weekStartDate, getWeeklyService, user?.id])

  useEffect(() => {
    loadWeeklyEntry()
  }, [loadWeeklyEntry])

  const updateObjectives = useCallback(
    async (objectives: WeeklyObjective[], whyImportant: string) => {
      try {
        const weeklyService = await getWeeklyService()
        const updatedEntry = await weeklyService.upsert(weekStartDate, {
          objectives: objectives as any,
          why_important: whyImportant,
        })

        setEntry(updatedEntry)
        return updatedEntry
      } catch (err) {
        console.error('Error updating objectives:', err)
        throw err
      }
    },
    [weekStartDate, getWeeklyService]
  )

  const toggleObjectiveCompletion = useCallback(
    async (objectiveId: string) => {
      try {
        const weeklyService = await getWeeklyService()
        const updatedEntry = await weeklyService.toggleObjectiveCompletion(
          weekStartDate,
          objectiveId
        )

        setEntry(updatedEntry)
        return updatedEntry
      } catch (err) {
        console.error('Error toggling objective:', err)
        throw err
      }
    },
    [weekStartDate, getWeeklyService]
  )

  const updateFridayReview = useCallback(
    async (review: string) => {
      try {
        const weeklyService = await getWeeklyService()
        const updatedEntry = await weeklyService.updateFridayReview(weekStartDate, review)

        setEntry(updatedEntry)
        return updatedEntry
      } catch (err) {
        console.error('Error updating Friday review:', err)
        throw err
      }
    },
    [weekStartDate, getWeeklyService]
  )

  // Parse objectives from JSONB
  const objectives: WeeklyObjective[] = entry?.objectives
    ? (entry.objectives as any[]).map((obj: any) => ({
        id: obj.id,
        objective: obj.objective,
        completed: obj.completed,
        order: obj.order,
      }))
    : []

  return {
    entry,
    objectives,
    whyImportant: entry?.why_important || null,
    fridayReview: entry?.friday_review || null,
    reviewCompleted: entry?.review_completed || false,
    loading,
    error,
    updateObjectives,
    toggleObjectiveCompletion,
    updateFridayReview,
    reload: loadWeeklyEntry,
  }
}
