import { supabase } from './client'
import type { Database } from './database.types'

type Tables = Database['public']['Tables']
type UserProfile = Tables['user_profiles']['Row']
type DailyEntry = Tables['daily_entries']['Row']
type CalorieEntry = Tables['calorie_entries']['Row']
type ExerciseEntry = Tables['exercise_entries']['Row']
type InjectionEntry = Tables['injection_entries']['Row']
type InjectionTarget = Tables['injection_targets']['Row']
type NirvanaEntry = Tables['nirvana_entries']['Row']
type NirvanaSession = Tables['nirvana_sessions']['Row']
// type NirvanaProgress = Tables['nirvana_progress']['Row'] // TODO: Add NirvanaProgress API when needed
type WeeklyEntry = Tables['weekly_entries']['Row']
type CustomMetric = Tables['custom_metrics']['Row']

// User Profile API
export const userProfileApi = {
  async get(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async create(profile: Tables['user_profiles']['Insert']): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['user_profiles']['Update']): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Daily Entries API
export const dailyEntriesApi = {
  async getByDate(userId: string, date: string): Promise<DailyEntry | null> {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getRange(userId: string, startDate: string, endDate: string): Promise<DailyEntry[]> {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async upsert(entry: Tables['daily_entries']['Insert']): Promise<DailyEntry> {
    const { data, error } = await supabase
      .from('daily_entries')
      .upsert(entry, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('daily_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Calorie Entries API
export const calorieEntriesApi = {
  async getByDate(userId: string, date: string): Promise<CalorieEntry[]> {
    const { data, error } = await supabase
      .from('calorie_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async create(entry: Tables['calorie_entries']['Insert']): Promise<CalorieEntry> {
    const { data, error } = await supabase
      .from('calorie_entries')
      .insert(entry)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['calorie_entries']['Update']): Promise<CalorieEntry> {
    const { data, error } = await supabase
      .from('calorie_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('calorie_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Exercise Entries API
export const exerciseEntriesApi = {
  async getByDate(userId: string, date: string): Promise<ExerciseEntry[]> {
    const { data, error } = await supabase
      .from('exercise_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async create(entry: Tables['exercise_entries']['Insert']): Promise<ExerciseEntry> {
    const { data, error } = await supabase
      .from('exercise_entries')
      .insert(entry)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['exercise_entries']['Update']): Promise<ExerciseEntry> {
    const { data, error } = await supabase
      .from('exercise_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('exercise_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Injection Entries API
export const injectionEntriesApi = {
  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<InjectionEntry[]> {
    const { data, error } = await supabase
      .from('injection_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('time_of_day', { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(entry: Tables['injection_entries']['Insert']): Promise<InjectionEntry> {
    const { data, error } = await supabase
      .from('injection_entries')
      .insert(entry)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['injection_entries']['Update']): Promise<InjectionEntry> {
    const { data, error } = await supabase
      .from('injection_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('injection_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Injection Targets API
export const injectionTargetsApi = {
  async getActive(userId: string): Promise<InjectionTarget[]> {
    const { data, error } = await supabase
      .from('injection_targets')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('compound_name')

    if (error) throw error
    return data || []
  },

  async create(target: Tables['injection_targets']['Insert']): Promise<InjectionTarget> {
    const { data, error } = await supabase
      .from('injection_targets')
      .insert(target)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['injection_targets']['Update']): Promise<InjectionTarget> {
    const { data, error } = await supabase
      .from('injection_targets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('injection_targets')
      .update({ active: false })
      .eq('id', id)

    if (error) throw error
  }
}

// Nirvana Entries API
export const nirvanaEntriesApi = {
  async getByDate(userId: string, date: string): Promise<NirvanaEntry | null> {
    const { data, error } = await supabase
      .from('nirvana_entries')
      .select(`
        *,
        nirvana_sessions (*)
      `)
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getRange(userId: string, startDate: string, endDate: string): Promise<NirvanaEntry[]> {
    const { data, error } = await supabase
      .from('nirvana_entries')
      .select(`
        *,
        nirvana_sessions (*)
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async upsert(entry: Tables['nirvana_entries']['Insert']): Promise<NirvanaEntry> {
    const { data, error } = await supabase
      .from('nirvana_entries')
      .upsert(entry, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Nirvana Sessions API
export const nirvanaSessionsApi = {
  async getByEntry(entryId: string): Promise<NirvanaSession[]> {
    const { data, error } = await supabase
      .from('nirvana_sessions')
      .select('*')
      .eq('nirvana_entry_id', entryId)
      .order('session_number', { ascending: true })

    if (error) throw error
    return data || []
  },

  async create(session: Tables['nirvana_sessions']['Insert']): Promise<NirvanaSession> {
    const { data, error } = await supabase
      .from('nirvana_sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['nirvana_sessions']['Update']): Promise<NirvanaSession> {
    const { data, error } = await supabase
      .from('nirvana_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('nirvana_sessions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Weekly Entries API
export const weeklyEntriesApi = {
  async getByWeek(userId: string, weekStart: string): Promise<WeeklyEntry | null> {
    const { data, error } = await supabase
      .from('weekly_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getRecent(userId: string, limit: number = 10): Promise<WeeklyEntry[]> {
    const { data, error } = await supabase
      .from('weekly_entries')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async upsert(entry: Tables['weekly_entries']['Insert']): Promise<WeeklyEntry> {
    const { data, error } = await supabase
      .from('weekly_entries')
      .upsert(entry, {
        onConflict: 'user_id,week_start',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Custom Metrics API
export const customMetricsApi = {
  async getByCategory(userId: string, category?: string): Promise<CustomMetric[]> {
    let query = supabase
      .from('custom_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async create(metric: Tables['custom_metrics']['Insert']): Promise<CustomMetric> {
    const { data, error } = await supabase
      .from('custom_metrics')
      .insert(metric)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Tables['custom_metrics']['Update']): Promise<CustomMetric> {
    const { data, error } = await supabase
      .from('custom_metrics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_metrics')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}