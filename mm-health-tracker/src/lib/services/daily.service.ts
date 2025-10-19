// Daily Entries Service - Replaces dailyEntryStorage from storage.ts
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase/database.types'

type DailyEntry = Database['public']['Tables']['daily_entries']['Row']
type DailyEntryInsert = Database['public']['Tables']['daily_entries']['Insert']
type DailyEntryUpdate = Database['public']['Tables']['daily_entries']['Update']
type CalorieEntry = Database['public']['Tables']['calorie_entries']['Row']
type CalorieEntryInsert = Database['public']['Tables']['calorie_entries']['Insert']
type ExerciseEntry = Database['public']['Tables']['exercise_entries']['Row']
type ExerciseEntryInsert = Database['public']['Tables']['exercise_entries']['Insert']
type InjectionEntry = Database['public']['Tables']['injection_entries']['Row']
type InjectionEntryInsert = Database['public']['Tables']['injection_entries']['Insert']
type MITEntry = Database['public']['Tables']['mits']['Row']
type MITEntryInsert = Database['public']['Tables']['mits']['Insert']

export class DailyService {
  constructor(
    private supabase: SupabaseClient<Database>,
    private userId: string
  ) {}

  /**
   * Get daily entry by date
   */
  async getByDate(date: string): Promise<DailyEntry | null> {
    const { data, error } = await this.supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', this.userId)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch daily entry: ${error.message}`)
    }

    return data
  }

  /**
   * Get range of daily entries
   */
  async getRange(startDate: string, endDate: string): Promise<DailyEntry[]> {
    const { data, error } = await this.supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', this.userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch daily entries: ${error.message}`)
    }

    return data || []
  }

  /**
   * Create or update daily entry
   */
  async upsert(date: string, updates: Partial<DailyEntryUpdate>): Promise<DailyEntry> {
    const { data, error } = await this.supabase
      .from('daily_entries')
      .upsert(
        {
          user_id: this.userId,
          date,
          ...updates,
        },
        {
          onConflict: 'user_id,date',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert daily entry: ${error.message}`)
    }

    return data
  }

  /**
   * Update weight for a specific date
   */
  async updateWeight(date: string, weight: number): Promise<DailyEntry> {
    return this.upsert(date, { weight })
  }

  /**
   * Toggle deep work completion
   */
  async toggleDeepWork(date: string): Promise<DailyEntry> {
    const existing = await this.getByDate(date)
    return this.upsert(date, {
      deep_work_completed: !existing?.deep_work_completed,
    })
  }

  /**
   * Mark Winners Bible as viewed
   */
  async markWinnersBibleViewed(
    date: string,
    timeOfDay: 'morning' | 'night'
  ): Promise<DailyEntry> {
    const field = timeOfDay === 'morning' ? 'winners_bible_morning' : 'winners_bible_night'
    return this.upsert(date, { [field]: true })
  }

  // ==================== CALORIE ENTRIES ====================

  /**
   * Get calorie entries for a date
   */
  async getCalorieEntries(date: string): Promise<CalorieEntry[]> {
    const { data, error } = await this.supabase
      .from('calorie_entries')
      .select('*')
      .eq('user_id', this.userId)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch calorie entries: ${error.message}`)
    }

    return data || []
  }

  /**
   * Add calorie entry
   */
  async addCalorieEntry(
    date: string,
    entry: Omit<CalorieEntryInsert, 'user_id' | 'date'>
  ): Promise<CalorieEntry> {
    const { data, error } = await this.supabase
      .from('calorie_entries')
      .insert({
        user_id: this.userId,
        date,
        ...entry,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add calorie entry: ${error.message}`)
    }

    return data
  }

  /**
   * Delete calorie entry
   */
  async deleteCalorieEntry(entryId: string): Promise<void> {
    const { error } = await this.supabase
      .from('calorie_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', this.userId)

    if (error) {
      throw new Error(`Failed to delete calorie entry: ${error.message}`)
    }
  }

  // ==================== EXERCISE ENTRIES ====================

  /**
   * Get exercise entries for a date
   */
  async getExerciseEntries(date: string): Promise<ExerciseEntry[]> {
    const { data, error } = await this.supabase
      .from('exercise_entries')
      .select('*')
      .eq('user_id', this.userId)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch exercise entries: ${error.message}`)
    }

    return data || []
  }

  /**
   * Add exercise entry
   */
  async addExerciseEntry(
    date: string,
    entry: Omit<ExerciseEntryInsert, 'user_id' | 'date'>
  ): Promise<ExerciseEntry> {
    const { data, error } = await this.supabase
      .from('exercise_entries')
      .insert({
        user_id: this.userId,
        date,
        ...entry,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add exercise entry: ${error.message}`)
    }

    return data
  }

  /**
   * Delete exercise entry
   */
  async deleteExerciseEntry(entryId: string): Promise<void> {
    const { error } = await this.supabase
      .from('exercise_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', this.userId)

    if (error) {
      throw new Error(`Failed to delete exercise entry: ${error.message}`)
    }
  }

  // ==================== INJECTION ENTRIES ====================

  /**
   * Get injection entries for a date range
   */
  async getInjectionEntries(startDate: string, endDate: string): Promise<InjectionEntry[]> {
    const { data, error } = await this.supabase
      .from('injection_entries')
      .select('*')
      .eq('user_id', this.userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('time_of_day', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch injection entries: ${error.message}`)
    }

    return data || []
  }

  /**
   * Add injection entry
   */
  async addInjectionEntry(
    date: string,
    entry: Omit<InjectionEntryInsert, 'user_id' | 'date'>
  ): Promise<InjectionEntry> {
    const { data, error } = await this.supabase
      .from('injection_entries')
      .insert({
        user_id: this.userId,
        date,
        ...entry,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add injection entry: ${error.message}`)
    }

    return data
  }

  /**
   * Delete injection entry
   */
  async deleteInjectionEntry(entryId: string): Promise<void> {
    const { error } = await this.supabase
      .from('injection_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', this.userId)

    if (error) {
      throw new Error(`Failed to delete injection entry: ${error.message}`)
    }
  }

  // ==================== MIT ENTRIES ====================

  /**
   * Get MITs for a date
   */
  async getMITs(date: string): Promise<MITEntry[]> {
    const { data, error } = await this.supabase
      .from('mits')
      .select('*')
      .eq('user_id', this.userId)
      .eq('date', date)
      .order('order_index', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch MITs: ${error.message}`)
    }

    return data || []
  }

  /**
   * Add MIT entry
   */
  async addMIT(
    date: string,
    taskDescription: string,
    orderIndex: number = 0
  ): Promise<MITEntry> {
    const { data, error } = await this.supabase
      .from('mits')
      .insert({
        user_id: this.userId,
        date,
        task_description: taskDescription,
        order_index: orderIndex,
        completed: false,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add MIT: ${error.message}`)
    }

    return data
  }

  /**
   * Toggle MIT completion status
   */
  async toggleMIT(mitId: string): Promise<MITEntry> {
    // First get current state
    const { data: currentMIT, error: fetchError } = await this.supabase
      .from('mits')
      .select('completed')
      .eq('id', mitId)
      .eq('user_id', this.userId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch MIT: ${fetchError.message}`)
    }

    // Toggle it
    const { data, error } = await this.supabase
      .from('mits')
      .update({ completed: !currentMIT.completed })
      .eq('id', mitId)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to toggle MIT: ${error.message}`)
    }

    return data
  }

  /**
   * Delete MIT entry
   */
  async deleteMIT(mitId: string): Promise<void> {
    const { error } = await this.supabase
      .from('mits')
      .delete()
      .eq('id', mitId)
      .eq('user_id', this.userId)

    if (error) {
      throw new Error(`Failed to delete MIT: ${error.message}`)
    }
  }

  // ==================== CALCULATIONS ====================

  /**
   * Calculate daily metrics (replaces calculations.calculateDailyMetrics)
   */
  async calculateDailyMetrics(date: string, bmr: number) {
    const [dailyEntry, calories, exercises] = await Promise.all([
      this.getByDate(date),
      this.getCalorieEntries(date),
      this.getExerciseEntries(date),
    ])

    const totalCaloriesConsumed = calories.reduce((sum, cal) => sum + (cal.calories || 0), 0)
    const totalCaloriesBurned = exercises.reduce((sum, ex) => sum + (ex.calories_burned || 0), 0)
    const calorieBalance = bmr - totalCaloriesConsumed + totalCaloriesBurned

    const macros = calories.reduce(
      (totals, cal) => ({
        carbs: totals.carbs + (cal.carbs || 0),
        protein: totals.protein + (cal.protein || 0),
        fat: totals.fat + (cal.fat || 0),
      }),
      { carbs: 0, protein: 0, fat: 0 }
    )

    return {
      totalCaloriesConsumed,
      totalCaloriesBurned,
      calorieBalance,
      macros,
      dailyEntry,
    }
  }
}
