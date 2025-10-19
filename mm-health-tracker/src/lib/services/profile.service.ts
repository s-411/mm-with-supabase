// Profile Service - Replaces profileStorage from storage.ts
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export class ProfileService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get user profile by Clerk user ID
   */
  async get(clerkUserId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return data
  }

  /**
   * Create new user profile
   */
  async create(clerkUserId: string, profileData: Omit<UserProfileInsert, 'clerk_user_id'>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        clerk_user_id: clerkUserId,
        ...profileData,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`)
    }

    return data
  }

  /**
   * Update user profile
   */
  async update(clerkUserId: string, updates: Partial<UserProfileUpdate>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    return data
  }

  /**
   * Check if profile is complete (has required fields)
   */
  async isComplete(clerkUserId: string): Promise<boolean> {
    const profile = await this.get(clerkUserId)

    if (!profile) return false

    return !!(
      profile.bmr && profile.bmr > 0 &&
      profile.height && profile.height > 0 &&
      profile.weight && profile.weight > 0 &&
      profile.gender
    )
  }

  /**
   * Get or create profile (useful for first-time users)
   */
  async getOrCreate(
    clerkUserId: string,
    defaults?: Omit<UserProfileInsert, 'clerk_user_id'>
  ): Promise<UserProfile> {
    const existing = await this.get(clerkUserId)

    if (existing) return existing

    return this.create(clerkUserId, defaults || {
      bmr: 2000,
      tracker_settings: {},
      macro_targets: {},
    })
  }
}
