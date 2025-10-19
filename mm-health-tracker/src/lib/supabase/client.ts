import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Supabase client with built-in auth
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence
    autoRefreshToken: true, // Automatically refresh tokens
    detectSessionInUrl: true, // Detect session from URL (for email confirmations)
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

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