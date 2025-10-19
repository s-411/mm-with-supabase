// React hooks for using services in components
'use client'

import { useAuth } from '@clerk/nextjs'
import { useMemo, useCallback } from 'react'
import { createClerkSupabaseClient } from '../supabase/client'
import { ProfileService } from './profile.service'
import { DailyService } from './daily.service'

/**
 * Hook to get authenticated service instances
 *
 * Example usage:
 * ```tsx
 * function MyComponent() {
 *   const { profile, daily, userId, isReady } = useServices()
 *
 *   useEffect(() => {
 *     if (isReady) {
 *       profile.get(userId).then(setUserProfile)
 *     }
 *   }, [isReady])
 * }
 * ```
 */
export function useServices() {
  const { getToken, userId, isLoaded } = useAuth()

  // Create authenticated Supabase client
  const getClient = useCallback(async () => {
    const token = await getToken({ template: 'supabase' })
    if (!token) {
      throw new Error('No authentication token available')
    }
    return createClerkSupabaseClient(token)
  }, [getToken])

  // Memoize service instances
  const services = useMemo(() => {
    if (!userId) return null

    return {
      profile: {
        get: async (clerkUserId: string) => {
          const client = await getClient()
          const service = new ProfileService(client)
          return service.get(clerkUserId)
        },
        create: async (clerkUserId: string, data: any) => {
          const client = await getClient()
          const service = new ProfileService(client)
          return service.create(clerkUserId, data)
        },
        update: async (clerkUserId: string, updates: any) => {
          const client = await getClient()
          const service = new ProfileService(client)
          return service.update(clerkUserId, updates)
        },
        getOrCreate: async (clerkUserId: string, defaults?: any) => {
          const client = await getClient()
          const service = new ProfileService(client)
          return service.getOrCreate(clerkUserId, defaults)
        },
      },
      daily: {
        getByDate: async (date: string) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.getByDate(date)
        },
        upsert: async (date: string, updates: any) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.upsert(date, updates)
        },
        updateWeight: async (date: string, weight: number) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.updateWeight(date, weight)
        },
        toggleDeepWork: async (date: string) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.toggleDeepWork(date)
        },
        getCalorieEntries: async (date: string) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.getCalorieEntries(date)
        },
        addCalorieEntry: async (date: string, entry: any) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.addCalorieEntry(date, entry)
        },
        deleteCalorieEntry: async (entryId: string) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.deleteCalorieEntry(entryId)
        },
        getExerciseEntries: async (date: string) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.getExerciseEntries(date)
        },
        addExerciseEntry: async (date: string, entry: any) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.addExerciseEntry(date, entry)
        },
        deleteExerciseEntry: async (entryId: string) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.deleteExerciseEntry(entryId)
        },
        getInjectionEntries: async (startDate: string, endDate: string) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.getInjectionEntries(startDate, endDate)
        },
        addInjectionEntry: async (date: string, entry: any) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.addInjectionEntry(date, entry)
        },
        calculateDailyMetrics: async (date: string, bmr: number) => {
          const client = await getClient()
          const service = new DailyService(client, userId)
          return service.calculateDailyMetrics(date, bmr)
        },
      },
    }
  }, [userId, getClient])

  return {
    ...services,
    userId,
    isReady: isLoaded && !!userId && !!services,
    isLoaded,
  }
}
