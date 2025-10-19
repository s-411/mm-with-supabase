// Profile Service - Replaces profileStorage from storage.ts
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export class ProfileService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get user profile by Supabase auth user ID
   */
  async get(authUserId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return data
  }

  /**
   * Create new user profile
   */
  async create(authUserId: string, profileData: Omit<UserProfileInsert, 'auth_user_id'>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        auth_user_id: authUserId,
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
  async update(authUserId: string, updates: Partial<UserProfileUpdate>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('auth_user_id', authUserId)
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
  async isComplete(authUserId: string): Promise<boolean> {
    const profile = await this.get(authUserId)

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
    authUserId: string,
    defaults?: Omit<UserProfileInsert, 'auth_user_id'>
  ): Promise<UserProfile> {
    const existing = await this.get(authUserId)

    if (existing) return existing

    return this.create(authUserId, defaults || {
      bmr: 2000,
      tracker_settings: {},
      macro_targets: {},
    })
  }
}
