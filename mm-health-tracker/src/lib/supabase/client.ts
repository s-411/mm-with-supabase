import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Check if the environment variables are actually set to valid values
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Use fallback values if env vars are not set or are placeholder values
const supabaseUrl = (envUrl && envUrl !== 'your_supabase_project_url' && envUrl.startsWith('http'))
  ? envUrl
  : 'https://dmuyymdfpciuqjrarezw.supabase.co'

const supabaseAnonKey = (envKey && envKey !== 'your_supabase_anon_key')
  ? envKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdXl5bWRmcGNpdXFqcmFyZXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzc3MzAsImV4cCI6MjA3Mzc1MzczMH0.HEITmS97bQdejoy0Ghiz7I8I_vh2hFEo1gCo-BW-znY'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

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