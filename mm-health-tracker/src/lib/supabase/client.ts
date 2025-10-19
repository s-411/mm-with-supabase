import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Supabase client with SSR support (stores session in cookies)
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

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