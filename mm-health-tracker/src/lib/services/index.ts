// Service Factory - Central place to get authenticated service instances
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase/database.types'
import { ProfileService } from './profile.service'
import { DailyService } from './daily.service'
import { SettingsService } from './settings.service'

/**
 * Create service instances with authenticated Supabase client
 * Usage:
 *   const services = createServices(supabaseClient, profileId)
 *   const profile = await services.profile.get(clerkUserId)
 */
export function createServices(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  return {
    profile: new ProfileService(supabase),
    daily: new DailyService(supabase, userId),
    settings: new SettingsService(supabase, userId),
  }
}

// Export service classes for direct instantiation if needed
export { ProfileService } from './profile.service'
export { DailyService } from './daily.service'
export { SettingsService } from './settings.service'
