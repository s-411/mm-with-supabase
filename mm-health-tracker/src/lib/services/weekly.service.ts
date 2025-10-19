import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type WeeklyEntry = Database['public']['Tables']['weekly_entries']['Row']
type WeeklyEntryInsert = Database['public']['Tables']['weekly_entries']['Insert']
type WeeklyEntryUpdate = Database['public']['Tables']['weekly_entries']['Update']

export class WeeklyService {
  constructor(
    private supabase: SupabaseClient<Database>,
    private userId: string
  ) {}

  /**
   * Get weekly entry by week start date (Monday's date)
   */
  async getByWeekStart(weekStart: string): Promise<WeeklyEntry | null> {
    const { data, error } = await this.supabase
      .from('weekly_entries')
      .select('*')
      .eq('user_id', this.userId)
      .eq('week_start', weekStart)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch weekly entry: ${error.message}`)
    }

    return data
  }

  /**
   * Create or update weekly entry
   */
  async upsert(
    weekStart: string,
    data: Partial<Omit<WeeklyEntryInsert, 'user_id' | 'week_start'>>
  ): Promise<WeeklyEntry> {
    const { data: result, error } = await this.supabase
      .from('weekly_entries')
      .upsert(
        {
          user_id: this.userId,
          week_start: weekStart,
          ...data,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,week_start',
        }
      )
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert weekly entry: ${error.message}`)
    }

    return result
  }

  /**
   * Update objectives for a week
   */
  async updateObjectives(
    weekStart: string,
    objectives: Array<{ id: string; objective: string; completed: boolean; order: number }>
  ): Promise<WeeklyEntry> {
    return this.upsert(weekStart, { objectives: objectives as any })
  }

  /**
   * Update why important text
   */
  async updateWhyImportant(weekStart: string, whyImportant: string): Promise<WeeklyEntry> {
    return this.upsert(weekStart, { why_important: whyImportant })
  }

  /**
   * Toggle objective completion
   */
  async toggleObjectiveCompletion(weekStart: string, objectiveId: string): Promise<WeeklyEntry> {
    // First get the current entry
    const entry = await this.getByWeekStart(weekStart)
    if (!entry || !entry.objectives) {
      throw new Error('Weekly entry not found')
    }

    // Toggle the objective
    const objectives = (entry.objectives as any[]).map((obj: any) =>
      obj.id === objectiveId ? { ...obj, completed: !obj.completed } : obj
    )

    return this.updateObjectives(weekStart, objectives)
  }

  /**
   * Update Friday review
   */
  async updateFridayReview(
    weekStart: string,
    fridayReview: string,
    reviewCompleted: boolean = true
  ): Promise<WeeklyEntry> {
    return this.upsert(weekStart, {
      friday_review: fridayReview,
      review_completed: reviewCompleted,
    })
  }
}
