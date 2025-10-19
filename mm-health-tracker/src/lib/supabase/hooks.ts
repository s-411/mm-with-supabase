// Clerk + Supabase integration hooks
import { useAuth, useUser } from '@clerk/nextjs'
import { createClerkSupabaseClient } from './client'
import { useMemo } from 'react'

/**
 * Hook to get authenticated Supabase client with Clerk token
 * This ensures all Supabase queries are authenticated with the current user
 */
export function useSupabaseClient() {
  const { getToken } = useAuth()

  const getClient = useMemo(() => {
    return async () => {
      const token = await getToken({ template: 'supabase' })
      if (!token) {
        throw new Error('No Clerk token available')
      }
      return createClerkSupabaseClient(token)
    }
  }, [getToken])

  return getClient
}

/**
 * Hook to get current user's profile ID from Supabase
 * This maps the Clerk user to their Supabase profile
 */
export function useUserProfile() {
  const { user, isLoaded } = useUser()
  const getClient = useSupabaseClient()

  const getUserProfile = async () => {
    if (!isLoaded || !user) return null

    const client = await getClient()
    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  return {
    userId: user?.id,
    isLoaded,
    getUserProfile,
  }
}
