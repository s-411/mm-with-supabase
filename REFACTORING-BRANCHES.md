# Phased Migration Plan: localStorage ’ Supabase with Git Checkpoints

## Strategy: Incremental Feature Branches with Automated Checkpoints

This plan breaks the migration into **7 independent feature branches**, each targeting a specific domain. Each branch can be tested, committed, and merged independently, providing safety checkpoints and allowing rollback if needed.

---

## Branch 0: Foundation (ALREADY COMPLETE )
**Branch:** `main` (current work)
**Status:** Complete
-  Settings page migrated (compounds, food templates, session types, macro targets, tracker settings, timezone)
-  Macro targets reading updated in daily/calories/analytics pages
-  Database schema applied and verified
-  DailyService enhanced with MIT methods

**Current uncommitted changes:** Macro targets reading updates in 3 pages

---

## Branch 1: Daily Entries Core (Calories + Exercise)
**Branch name:** `feature/daily-entries-core`
**Estimated effort:** 2-3 hours
**Complexity:** HIGH (most complex migration)

### Changes:
1. **Create comprehensive daily data hook** (`src/lib/hooks/useDaily.ts`)
   - Load daily entry, calories, exercises for a date
   - Provide add/delete methods for calories and exercises
   - Handle loading/error states

2. **Update Calories page** (`src/app/calories/page.tsx`)
   - Replace `dailyEntryStorage` with `useDaily` hook
   - Convert `addCalorieEntry`, `removeCalorie`, `addExerciseEntry`, `removeExercise` to async Supabase calls
   - Update history data loading to fetch from Supabase instead of localStorage
   - Replace `foodTemplateStorage` with existing `useFoodTemplates` hook

3. **Update Daily page - Calorie/Exercise sections**
   - Replace calorie/exercise localStorage logic with Supabase hooks
   - Keep weight and deep work for next branch

### Checkpoint Tests:
-  Calorie entry CRUD works
-  Exercise entry CRUD works
-  Food templates load and apply correctly
-  History data displays correctly (30-day view)
-  No console errors
-  `npm run build` succeeds

**Git Actions:**
- Commit: "feat: migrate calorie and exercise entries to Supabase"
- Push branch
- Optional: Create PR for review

---

## Branch 2: Daily Entries - Weight & Deep Work
**Branch name:** `feature/daily-weight-deepwork`
**Estimated effort:** 45 mins
**Complexity:** LOW

### Changes:
1. **Update Daily page** (`src/app/daily/page.tsx`)
   - Replace weight tracking with `dailyService.updateWeight()`
   - Replace deep work toggle with `dailyService.toggleDeepWork()`
   - Load weight from daily_entries table instead of localStorage

2. **Update Analytics page** (`src/app/analytics/page.tsx`)
   - Fetch weight data from Supabase for weight trend charts
   - Fetch deep work data from Supabase for completion tracking

### Checkpoint Tests:
-  Weight updates save to Supabase
-  Deep work toggle persists correctly
-  Analytics charts display weight/deep work trends
-  No regression on Branch 1 features

**Git Actions:**
- Commit: "feat: migrate weight and deep work tracking to Supabase"
- Merge to main

---

## Branch 3: MITs (Most Important Tasks)
**Branch name:** `feature/mits-migration`
**Estimated effort:** 1 hour
**Complexity:** MEDIUM

### Changes:
1. **Create MIT hook** (`src/lib/hooks/useDaily.ts` - extend existing)
   - Add `useMITs(date)` hook with CRUD operations

2. **Update Daily page** (`src/app/daily/page.tsx`)
   - Replace MIT localStorage logic with Supabase
   - Update "Today's MITs" and "Tomorrow's MITs" to use `useMITs` hook
   - Update add/toggle/delete MIT functions to call Supabase

3. **Update Analytics page**
   - Load MIT completion data from Supabase for analytics charts

### Checkpoint Tests:
-  Can add MITs for today/tomorrow
-  Can toggle MIT completion
-  Can delete MITs
-  MITs persist across page reloads
-  Analytics MIT completion chart works

**Git Actions:**
- Commit: "feat: migrate MITs to Supabase"
- Merge to main

---

## Branch 4: Injection System
**Branch name:** `feature/injections-migration`
**Estimated effort:** 1.5 hours
**Complexity:** MEDIUM

### Changes:
1. **Create injection hooks** (`src/lib/hooks/useInjections.ts`)
   - `useInjectionTargets()` - manage weekly targets
   - `useInjectionEntries(startDate, endDate)` - CRUD for actual injections

2. **Update Injections page** (`src/app/injections/page.tsx`)
   - Replace `injectionTargetStorage` with `useInjectionTargets`
   - Replace localStorage injection entries with Supabase
   - Update add/edit/delete logic

3. **Update Settings page**
   - Injection targets already migrated, verify integration

4. **Update Daily page**
   - Update injection entry UI to use Supabase

### Checkpoint Tests:
-  Can set injection targets
-  Can log injections with dosage/compound/time
-  Injection history displays correctly
-  Weekly progress tracking works
-  Analytics show injection patterns

**Git Actions:**
- Commit: "feat: migrate injection system to Supabase"
- Merge to main

---

## Branch 5: Weekly Planning & Objectives
**Branch name:** `feature/weekly-planning`
**Estimated effort:** 1 hour
**Complexity:** MEDIUM

### Changes:
1. **Create weekly hook** (`src/lib/hooks/useWeekly.ts`)
   - `useWeeklyEntry(weekStartDate)` with objectives CRUD
   - Load/save weekly objectives and Friday review

2. **Update Daily page** (`src/app/daily/page.tsx`)
   - Replace `weeklyEntryStorage` with `useWeeklyEntry` hook
   - Update Monday objectives form
   - Update Tuesday-Thursday progress view
   - Update Friday review form

### Checkpoint Tests:
-  Can set 3 objectives on Monday
-  Can view objectives Tue-Thu
-  Can complete Friday review
-  Weekly data persists correctly
-  Week navigation works

**Git Actions:**
- Commit: "feat: migrate weekly planning to Supabase"
- Merge to main

---

## Branch 6: Nirvana System (Workout Tracking)
**Branch name:** `feature/nirvana-migration`
**Estimated effort:** 2 hours
**Complexity:** HIGH (complex data model)

### Changes:
1. **Create Nirvana service** (`src/lib/services/nirvana.service.ts`)
   - Manage nirvana_entries, nirvana_sessions tables
   - Progress tracking (milestones, personal records)
   - Body part mappings

2. **Create Nirvana hooks** (`src/lib/hooks/useNirvana.ts`)
   - `useNirvanaEntry(date)` - daily sessions CRUD
   - `useNirvanaProgress()` - milestones and PRs
   - `useBodyPartMappings()` - session type mappings

3. **Update Nirvana page** (`src/app/nirvana/page.tsx`)
   - Replace `nirvanaSessionStorage` with Supabase hooks
   - Update session logging
   - Update progress tracking
   - Update body part mapping UI

4. **Update Analytics page**
   - Load Nirvana data from Supabase for analytics charts
   - Session frequency, streaks, body part usage

### Checkpoint Tests:
-  Can log Nirvana sessions with type/duration
-  Progress milestones save correctly
-  Body part mappings persist
-  Analytics charts show session trends
-  Streak calculations work

**Git Actions:**
- Commit: "feat: migrate Nirvana workout system to Supabase"
- Merge to main

---

## Branch 7: Winners Bible (Images & Daily Tracking)
**Branch name:** `feature/winners-bible`
**Estimated effort:** 2 hours
**Complexity:** HIGH (Supabase Storage required)

### Changes:
1. **Set up Supabase Storage**
   - Create `winners-bible` bucket
   - Configure RLS policies for user-specific images
   - Set up signed URL generation

2. **Create Winners Bible service** (`src/lib/services/winnersBible.service.ts`)
   - Upload images to Supabase Storage
   - Get image URLs (signed)
   - Track morning/night viewing in daily_entries

3. **Create Winners Bible hooks** (`src/lib/hooks/useWinnersBible.ts`)
   - `useWinnersBibleImages()` - manage image uploads
   - `useWinnersBibleViewing(date)` - track daily views

4. **Update Winners Bible page** (`src/app/winners-bible/page.tsx`)
   - Replace `winnersBibleStorage` with Supabase Storage
   - Update image upload to use Supabase Storage API
   - Update viewing tracking

5. **Update Daily page**
   - Update Winners Bible morning/night checkboxes to use Supabase
   - Load viewing status from daily_entries

### Checkpoint Tests:
-  Can upload images to Supabase Storage
-  Images display correctly with signed URLs
-  Can reorder images
-  Can delete images
-  Morning/night viewing tracked correctly
-  Daily page shows correct viewing status

**Git Actions:**
- Commit: "feat: migrate Winners Bible to Supabase Storage"
- Merge to main

---

## Branch 8: Cleanup & Final Migration
**Branch name:** `feature/cleanup-localstorage`
**Estimated effort:** 1 hour
**Complexity:** LOW

### Changes:
1. **Update data import/export** (`src/app/settings/page.tsx`)
   - Rewrite data export to pull from Supabase
   - Rewrite data import to write to Supabase (with validation)
   - Add migration script to move existing localStorage ’ Supabase

2. **Remove/deprecate storage.ts**
   - Remove unused localStorage functions
   - Add deprecation warnings for any remaining usage

3. **Clean up localStorage references**
   - Remove all remaining `localStorage.getItem/setItem` calls
   - Update settings page "Clear All Data" to wipe Supabase data

4. **Verify no localStorage usage**
   - Run `rg "localStorage" src/` - should return 0 matches (except comments)

### Checkpoint Tests:
-  Data export downloads complete Supabase backup
-  Data import successfully loads to Supabase
-  Clear all data wipes Supabase (not localStorage)
-  `rg "localStorage" src/` returns no active usage
-  All pages work without localStorage

**Git Actions:**
- Commit: "chore: remove localStorage dependencies and cleanup"
- Merge to main
- Tag: `v2.0.0-supabase-migration-complete`

---

## Success Criteria (Per Branch)
Each branch must pass:
1.  Feature works as expected (manual testing)
2.  No TypeScript errors (`npm run build`)
3.  No console errors in browser
4.  Changes committed with clear message
5.  Previous branches still work (no regressions)

## Rollback Strategy
- Each branch is independent
- Can revert to previous branch if issues found
- Main branch always stays in working state

## Automation & AI Checkpoints
For each branch, I will:
1. **Before coding:** Present mini-plan for that branch only
2. **During coding:** Run `npm run build` after each major change
3. **After coding:** Test the feature manually (you can verify)
4. **Checkpoint:** Commit and push, wait for your approval before next branch

This gives you control at each stage while allowing me autonomy within each branch.
