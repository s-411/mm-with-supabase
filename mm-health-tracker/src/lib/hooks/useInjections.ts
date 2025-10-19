import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useApp } from '@/lib/context-supabase'
import { DailyService } from '@/lib/services/daily.service'
import { ProfileService } from '@/lib/services/profile.service'
import type { Database } from '@/lib/supabase/database.types'

type InjectionEntry = Database['public']['Tables']['injection_entries']['Row']
type InjectionEntryInsert = Database['public']['Tables']['injection_entries']['Insert']

interface UseInjectionsReturn {
  injections: InjectionEntry[]
  loading: boolean
  error: string | null
  addInjection: (date: string, entry: Omit<InjectionEntryInsert, 'user_id' | 'date'>) => Promise<InjectionEntry>
  deleteInjection: (entryId: string) => Promise<void>
  reload: () => Promise<void>
}

/**
 * Hook for managing injection entries within a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export function useInjections(startDate: string, endDate: string): UseInjectionsReturn {
  const { user } = useApp()

  const [injections, setInjections] = useState<InjectionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getDailyService = useCallback(async () => {
    if (!user?.id) throw new Error('Not authenticated')

    // Just use the standard supabase client - no token needed
    const profileService = new ProfileService(supabase)
    const profile = await profileService.get(user.id)

    if (!profile) throw new Error('Profile not found')

    return new DailyService(supabase, profile.id)
  }, [user?.id])

  const loadInjections = useCallback(async () => {
    if (!user?.id) {
      setInjections([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const dailyService = await getDailyService()
      const data = await dailyService.getInjectionEntries(startDate, endDate)

      setInjections(data)
    } catch (err) {
      console.error('Error loading injections:', err)
      setError(err instanceof Error ? err.message : 'Failed to load injections')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, getDailyService, user?.id])

  useEffect(() => {
    loadInjections()
  }, [loadInjections])

  const addInjection = useCallback(async (
    date: string,
    entry: Omit<InjectionEntryInsert, 'user_id' | 'date'>
  ) => {
    try {
      const dailyService = await getDailyService()
      const newInjection = await dailyService.addInjectionEntry(date, entry)

      setInjections(prev => [newInjection, ...prev])

      return newInjection
    } catch (err) {
      console.error('Error adding injection:', err)
      throw err
    }
  }, [getDailyService])

  const deleteInjection = useCallback(async (entryId: string) => {
    try {
      const dailyService = await getDailyService()
      await dailyService.deleteInjectionEntry(entryId)

      setInjections(prev => prev.filter(inj => inj.id !== entryId))
    } catch (err) {
      console.error('Error deleting injection:', err)
      throw err
    }
  }, [getDailyService])

  return {
    injections,
    loading,
    error,
    addInjection,
    deleteInjection,
    reload: loadInjections,
  }
}
