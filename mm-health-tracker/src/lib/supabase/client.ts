import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Base Supabase client (unauthenticated)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Clerk handles session persistence
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Cache for authenticated clients
let cachedClerkClient: { client: any; token: string } | null = null

// Create authenticated Supabase client with Clerk token (singleton pattern)
export const createClerkSupabaseClient = (clerkToken: string) => {
  // Return cached client if token hasn't changed
  if (cachedClerkClient && cachedClerkClient.token === clerkToken) {
    return cachedClerkClient.client
  }

  // Create new client
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  // Cache it
  cachedClerkClient = { client, token: clerkToken }
  return client
}

// Note: Authentication is handled by Clerk, not Supabase Auth
// The createClerkSupabaseClient function above creates an authenticated
// Supabase client using the Clerk JWT token

// Real-time subscription helpers
export const subscribeToTable = (
  table: keyof Database['public']['Tables'],
  callback: (payload: unknown) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      callback
    )
    .subscribe()

  return channel
}

// Database function helpers
export const getWeeklyCompletionRate = async (userId: string, weekStart?: string) => {
  const { data, error } = await supabase.rpc('get_weekly_completion_rate', {
    p_user_id: userId,
    p_week_start: weekStart,
  })
  if (error) throw error
  return data
}

export const getBodyPartCorrelation = async (
  userId: string,
  startDate?: string,
  endDate?: string
) => {
  const { data, error } = await supabase.rpc('get_body_part_correlation', {
    p_user_id: userId,
    p_start_date: startDate,
    p_end_date: endDate,
  })
  if (error) throw error
  return data
}

export const getUserProgressSummary = async (userId: string, days: number = 30) => {
  const { data, error } = await supabase.rpc('get_user_progress_summary', {
    p_user_id: userId,
    p_days: days,
  })
  if (error) throw error
  return data
}