# Supabase + Clerk Migration Setup Instructions

## ✅ Completed Steps

1. ✅ Installed `@clerk/nextjs`
2. ✅ Created `.env.local` with Supabase and Clerk credentials
3. ✅ Updated Supabase client with Clerk token injection support
4. ✅ Wrapped app with `ClerkProvider`
5. ✅ Created auth middleware for route protection
6. ✅ Created sign-in/sign-up pages
7. ✅ Created migration SQL file at `supabase/migrations/20250101000000_initial_schema.sql`
8. ✅ Created service layer modules (`ProfileService`, `DailyService`)

## 🔧 Manual Setup Required

### Step 1: Apply Database Migration

You need to run the SQL migration to create the database schema. Choose one method:

#### Method A: Supabase Dashboard (Recommended)

1. Go to https://vbzwmjkniowxmecutymj.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20250101000000_initial_schema.sql`
5. Paste into the query editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify success - you should see "Success. No rows returned"

#### Method B: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
cd /Users/steveharris/Documents/GitHub/mm-with-supabase
supabase link --project-ref vbzwmjkniowxmecutymj

# Apply migrations
supabase db push
```

### Step 2: Configure Clerk JWT Template in Supabase

This is **CRITICAL** - Supabase needs to trust Clerk's JWTs for RLS to work.

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Scroll down to **"JWT Verification"**
3. Click **"Add a new provider"** or **"Configure"**
4. Enter these settings:
   - **Issuer**: `https://primary-thrush-30.clerk.accounts.dev`
   - **JWKS URL**: `https://primary-thrush-30.clerk.accounts.dev/.well-known/jwks.json`
   - **JWT Provider Type**: Select "JWKS"
5. Click **Save**

### Step 3: Create Clerk JWT Template

Clerk needs to generate JWTs that Supabase can verify.

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to **JWT Templates** in the left sidebar
3. Click **+ New template**
4. Choose **Supabase** from the list (or Blank if not available)
5. Name it `supabase`
6. Add the following claims:

```json
{
  "aud": "authenticated",
  "exp": {{exp}},
  "iat": {{iat}},
  "iss": "https://primary-thrush-30.clerk.accounts.dev",
  "sub": "{{user.id}}"
}
```

7. Click **Save**

### Step 4: Verify the Setup

After completing the above steps:

1. **Check Tables Created**:
   ```sql
   -- Run this in Supabase SQL Editor
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

   You should see:
   - `calorie_entries`
   - `custom_metrics`
   - `daily_entries`
   - `exercise_entries`
   - `injection_entries`
   - `injection_targets`
   - `mits`
   - `nirvana_entries`
   - `nirvana_sessions`
   - `user_profiles`
   - `weekly_entries`
   - `winners_bible_images`

2. **Check RLS Policies**:
   ```sql
   -- Run this in Supabase SQL Editor
   SELECT schemaname, tablename, policyname
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```

3. **Test Auth Function**:
   ```sql
   -- This should return NULL when not authenticated
   SELECT auth.clerk_user_id();
   ```

## 🚀 Next Steps (After Manual Setup)

Once you've completed the manual setup above:

1. **Start the dev server**: `cd mm-health-tracker && npm run dev`
2. **Test sign-up**: Visit http://localhost:3000 and you'll be redirected to sign-in
3. **Create an account**: Use the Clerk sign-up page
4. **Verify profile creation**: Check Supabase Dashboard → Table Editor → `user_profiles`

## 📝 Migration Schema Overview

The migration creates:

### Core Tables
- **user_profiles**: User settings, BMR, physical stats
- **daily_entries**: One record per user per day
- **calorie_entries**: Food/meal tracking
- **exercise_entries**: Workout tracking
- **injection_entries**: Compound tracking
- **injection_targets**: Weekly injection goals

### Weekly Planning
- **weekly_entries**: Weekly objectives and Friday reviews
- **mits**: Most Important Tasks per day

### Nirvana (Flexibility/Movement)
- **nirvana_entries**: Daily session summary
- **nirvana_sessions**: Individual session details

### Misc
- **custom_metrics**: User-defined metrics
- **winners_bible_images**: Image storage references

### Security (RLS)
Every table has Row Level Security enabled with policies that:
- Extract the Clerk user ID from the JWT using `public.clerk_user_id()`
- Ensure users can only access their own data
- Use `user_id` foreign keys to `user_profiles`

**Note**: The helper function is in the `public` schema (not `auth`) because Supabase restricts access to the `auth` schema for security reasons.

## 🐛 Troubleshooting

### "No rows returned" error when querying
- Check that Clerk JWT template is configured
- Verify JWKS URL is accessible
- Ensure you're signed in via Clerk

### RLS policy errors
- Confirm the `public.clerk_user_id()` function exists
- Check that JWT template includes `sub` claim with user ID

### Migration fails
- Check for syntax errors in SQL
- Ensure uuid-ossp extension is available
- Try running in smaller chunks if needed
