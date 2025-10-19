Current Local Storage Footprint

mm-health-profile user state read/write via profileStorage (src/lib/storage.ts:40) used in onboarding/settings (src/app/settings/page.tsx:101) and synced inside AppProvider (src/lib/context.tsx:205).
Daily tracker payloads mm-daily-entry-${date} handled by dailyEntryStorage (src/lib/storage.ts:101) powering daily/analytics/calories pages (src/app/daily/page.tsx:65; src/app/analytics/page.tsx:84; src/app/calories/page.tsx:72) plus MITs and winners bible flags.
Settings resources (mm-food-templates, mm-compounds, mm-injection-targets, mm-daily-tracker-settings, mm-macro-targets) stored through storage utilities (src/lib/storage.ts:273, 322, 464) and touched in settings UI (src/app/settings/page.tsx:104-250).
Weekly planning (mm-weekly-entry-${week}) via weeklyEntryStorage (src/lib/storage.ts:589) consumed on daily page (src/app/daily/page.tsx:94).
Nirvana suite keys (mm-nirvana-session-types, mm-nirvana-${date}, mm-nirvana-progress, mm-nirvana-body-mappings) used throughout storage module (src/lib/storage.ts:684-1138).
Winners Bible data (mm-winners-bible-images, mm-winners-bible-${date}) tapped in settings and dedicated page (src/app/settings/page.tsx:350; src/app/winners-bible/page.tsx:19).
Timezone persistence (mm-timezone) at src/lib/storage.ts:1463, referenced wherever current date is computed.
Context persistence effects still write back to localStorage (src/lib/context.tsx:222).
Utilities (src/lib/testData.ts, check-localstorage.html, restore-data.html) assume localStorage.
Auth & Data Architecture (Clerk + Supabase, Per-User Isolation)

Clerk handles authentication; each Clerk user maps to a Supabase profiles row containing clerk_user_id TEXT UNIQUE and demographic fields.
All tables include user_id UUID FK pointing to profiles(id) to ensure strict per-user isolation.
RLS policies rely on Clerk JWT claims: configure Postgres helper to read request.jwt.claims and compare clerk_user_id.
Supabase clients obtain Clerk-issued tokens via getToken({ template: 'supabase' }); pass as Authorization: Bearer.
Service-role access limited to server-side scripts (migrations, bulk import) through protected API routes.
Database Schema Outline

profiles (id UUID PK, clerk_user_id, bmr, height, weight, gender, tracker settings JSON, macro targets JSON, created_at, updated_at).
daily_entries (id UUID PK, user_id FK, date DATE unique per user, weight, deep_work_completed, winners bible flags, metadata timestamps).
Child tables: calorie_entries, exercise_entries, injection_entries, mits, custom_metric_definitions, custom_metric_entries keyed to daily_entry_id.
Reference tables: compounds, food_templates, injection_targets, nirvana_session_types, winners_bible_images (store storage URL/order).
Aggregates: weekly_entries + weekly_objectives, nirvana_progress, nirvana_milestones, personal_records, body_part_mappings, nirvana_entries, nirvana_sessions.
Optional timezones table or store timezone on profiles.
All tables include created_at/updated_at defaults and indexes on (user_id, date) where relevant.
Environment Variables

Clerk: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_JWT_TEMPLATE_NAME=supabase, optional webhook secret.
Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET (or JWKS config), SUPABASE_DB_URL for CLI, optional SUPABASE_BUCKET_WINNERS_BIBLE.
Ensure identical values locally (.env.local) and on Vercel; never commit secrets.
Migration Execution Steps

Baseline: export current localStorage data, run npm run lint and npm run build to confirm clean slate.
Clerk Integration: install @clerk/nextjs, wrap root layout with <ClerkProvider>, add middleware to protect routes, swap manual flows for <SignedIn>/<SignedOut> components, expose user menu.
Supabase Setup: create project, enable RLS, configure JWT to trust Clerk JWKS, set up private storage bucket for Winners Bible media, initialize Supabase CLI and migrations directory.
Schema & RLS: author migration SQL for tables above, helper function to read Clerk UID, policies ensuring clerk_user_id = jwt.claim.sub and user_id matches for data tables; seed defaults (default compounds, nirvana types).
Data Layer Refactor: replace src/lib/storage.ts with Supabase domain modules (profiles, daily, settings, nirvana, winnersBible). Implement src/lib/supabaseClient.ts to create clients with Clerk tokens on client/server. Remove generateId() where Supabase handles UUIDs.
Context & Hooks: update AppProvider to load data from Supabase asynchronously, drop localStorage persistence, ensure reducers/actions invoke Supabase methods with proper loading/error handling.
Page Updates: modify daily, analytics, calories, settings, winners-bible pages to use new services; implement Supabase storage uploads for images; adjust exports/imports to hit Supabase endpoints; ensure timezone logic uses stored value.
Utilities: rewrite backup/restore tooling to work with Supabase; build scripts/migrate-local-to-supabase.ts using service role key and mapping to Clerk user ID; provide script to verify no lingering localStorage usage.
Testing: add unit/integration tests for new data layer (mock Supabase client), optionally auth-aware E2E tests with Clerk helpers; run lint/build/test; ensure rg "localStorage" src returns nothing.
Documentation: update README, RESTORE-INSTRUCTIONS, and any project overview docs to reflect Clerk/Supabase workflows; retire legacy HTML helpers or document new equivalents.
Deployment: set Clerk and Supabase env vars on Vercel, deploy preview, run auth/data smoke tests, then promote to production.
Post-Deployment: verify per-user isolation (two accounts, cross-check data), test RLS directly via Supabase SQL with Clerk tokens, monitor Supabase/Clerk logs.
Success Criteria

Automated tests (existing + new) pass; manual smoke confirms all flows intact.
rg "localStorage" src yields no matches.
Users authenticate via Clerk, data persists per user across sessions/devices, media loads correctly.
RLS verified; no cross-user data exposure.
App deployed on Vercel with correct environment variables and functioning Supabase integration.
Communication Plan

Provide progress updates after (1) schema/RLS & Clerk wiring complete, (2) core data layer/pages migrated, (3) tests and deployment ready.
Surface blockers/questions immediately (e.g., schema nuances, token config, import mapping).
Assumptions documented (single tenant per Clerk user, no organizations).
Open Items

None pending: per-user isolation confirmed; continuing work assumes no Clerk organizations and that image storage shifts to Supabase bucket with signed URLs or equivalent.




