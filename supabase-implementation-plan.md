# Supabase Database Implementation Plan for MM Health Tracker

## Overview
This document contains the complete implementation plan for migrating the MM Health Tracker from localStorage to Supabase with real-time sync, multi-user support, and optimized performance.

## Database Schema Design

### 1. Core Tables Structure

#### user_profiles
```sql
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- email (TEXT, UNIQUE)
- display_name (TEXT)
- age (INTEGER)
- weight (DECIMAL)
- height (DECIMAL)
- gender (TEXT)
- activity_level (TEXT)
- bmr (DECIMAL, GENERATED) - Auto-calculated
- tdee (DECIMAL, GENERATED) - Auto-calculated
- settings (JSONB)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### daily_entries
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- date (DATE)
- weight (DECIMAL)
- body_fat_percentage (DECIMAL)
- muscle_mass (DECIMAL)
- water_percentage (DECIMAL)
- bone_mass (DECIMAL)
- visceral_fat (INTEGER)
- metabolic_age (INTEGER)
- bmi (DECIMAL)
- notes (TEXT)
- mood (INTEGER 1-10)
- energy_level (INTEGER 1-10)
- sleep_hours (DECIMAL)
- sleep_quality (INTEGER 1-10)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### calorie_entries
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- daily_entry_id (UUID, FK)
- date (DATE)
- meal_type (TEXT) - breakfast/lunch/dinner/snack
- food_name (TEXT)
- calories (INTEGER)
- protein (DECIMAL)
- carbs (DECIMAL)
- fat (DECIMAL)
- fiber (DECIMAL)
- sugar (DECIMAL)
- sodium (DECIMAL)
- quantity (DECIMAL)
- unit (TEXT)
- created_at (TIMESTAMPTZ)
```

#### exercise_entries
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- daily_entry_id (UUID, FK)
- date (DATE)
- exercise_type (TEXT)
- duration_minutes (INTEGER)
- calories_burned (INTEGER)
- distance (DECIMAL)
- sets (INTEGER)
- reps (INTEGER)
- weight_lifted (DECIMAL)
- heart_rate_avg (INTEGER)
- heart_rate_max (INTEGER)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
```

#### injection_entries
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- date (DATE)
- compound_name (TEXT)
- dosage_amount (DECIMAL)
- dosage_unit (TEXT)
- injection_site (TEXT)
- time_of_day (TIME)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
```

#### injection_targets
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- compound_name (TEXT)
- weekly_target (DECIMAL)
- unit (TEXT)
- frequency (TEXT)
- start_date (DATE)
- end_date (DATE)
- active (BOOLEAN)
- created_at (TIMESTAMPTZ)
```

#### nirvana_entries
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- date (DATE)
- total_duration_minutes (INTEGER)
- total_calories_burned (INTEGER)
- average_heart_rate (INTEGER)
- max_heart_rate (INTEGER)
- session_count (INTEGER)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
```

#### nirvana_sessions
```sql
- id (UUID, PK)
- nirvana_entry_id (UUID, FK)
- user_id (UUID, FK)
- session_number (INTEGER)
- session_type (TEXT)
- duration_minutes (INTEGER)
- calories_burned (INTEGER)
- body_parts (TEXT[]) - Array of body parts
- exercises_completed (JSONB)
- performance_rating (DECIMAL 1-10)
- fatigue_level (INTEGER 1-10)
- created_at (TIMESTAMPTZ)
```

#### nirvana_progress
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- milestone_type (TEXT)
- milestone_value (DECIMAL)
- achieved_date (DATE)
- previous_best (DECIMAL)
- improvement_percentage (DECIMAL)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
```

#### weekly_entries
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- week_start (DATE)
- week_end (DATE)
- goals (JSONB)
- achievements (JSONB)
- challenges (JSONB)
- next_week_focus (TEXT)
- overall_rating (INTEGER 1-10)
- created_at (TIMESTAMPTZ)
```

#### custom_metrics
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- metric_name (TEXT)
- metric_value (DECIMAL)
- metric_unit (TEXT)
- date (DATE)
- category (TEXT)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
```

### 2. Key Features to Implement

#### Row Level Security (RLS)
- Enable RLS on all tables
- Users can only see/modify their own data
- Policies for INSERT, UPDATE, DELETE, SELECT

#### Real-time Subscriptions
- Daily entries updates
- Nirvana session progress
- Injection tracking changes

#### Database Functions
```sql
-- BMR Calculation
-- TDEE Calculation
-- Weekly completion rates
-- Progress tracking
-- Body part correlation analysis
```

#### Indexes for Performance
```sql
-- Date-based indexes for fast queries
CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, date DESC);
CREATE INDEX idx_calorie_entries_date ON calorie_entries(user_id, date DESC);
CREATE INDEX idx_exercise_entries_date ON exercise_entries(user_id, date DESC);
CREATE INDEX idx_injection_entries_date ON injection_entries(user_id, date DESC);
CREATE INDEX idx_nirvana_entries_date ON nirvana_entries(user_id, date DESC);
```

### 3. Migration Steps

1. **Create all tables with proper relationships**
2. **Set up RLS policies**
3. **Create database functions and triggers**
4. **Add performance indexes**
5. **Generate TypeScript types**
6. **Create Supabase client configuration**
7. **Build data migration utilities**
8. **Update app to use Supabase instead of localStorage**
9. **Implement real-time subscriptions**
10. **Add authentication flow**

### 4. Client Integration

#### Supabase Client Setup
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

#### Real-time Subscriptions
```typescript
// Subscribe to daily entries changes
const subscription = supabase
  .channel('daily-entries-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'daily_entries' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe()
```

### 5. Data Migration Strategy

1. Export all localStorage data to JSON
2. Transform data to match new schema
3. Bulk insert into Supabase tables
4. Verify data integrity
5. Switch app to use Supabase

### 6. Authentication Setup

- Use Supabase Auth with email/password
- Optional: Add OAuth providers later
- Single sign-on for simplicity
- Session management built-in

### 7. Performance Optimizations

- Use database views for complex queries
- Implement caching strategy
- Optimize real-time subscription channels
- Use connection pooling
- Enable query result caching

## Implementation Order

1. **Phase 1: Database Setup**
   - Create all tables
   - Set up RLS
   - Add functions and triggers
   - Create indexes

2. **Phase 2: Client Integration**
   - Generate TypeScript types
   - Create Supabase client
   - Build API layer
   - Add authentication

3. **Phase 3: Data Migration**
   - Export localStorage data
   - Transform and import
   - Verify integrity

4. **Phase 4: Real-time Features**
   - Set up subscriptions
   - Implement live updates
   - Add optimistic updates

5. **Phase 5: Testing & Optimization**
   - Performance testing
   - Query optimization
   - Error handling
   - Backup strategy

## Notes

- App is for 1-2 users only (personal use)
- Priority on speed and real-time updates
- Must maintain exact same functionality as current localStorage version
- All data relationships must be preserved
- Focus on snappy, responsive UI

## Current Status

- [x] MCP configuration updated (removed --read-only flag)
- [ ] Awaiting Claude Code restart to apply changes
- [ ] Ready to begin table creation once write access is confirmed

## Next Steps

After restarting Claude Code:
1. Test write access with first migration
2. Create all tables in order
3. Set up RLS policies
4. Generate TypeScript types
5. Create client configuration files