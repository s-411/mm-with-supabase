# Quick Start Guide - Supabase + Clerk Migration

## 🚀 Ready to Apply the Migration

The migration file has been **fixed** and is ready to run. The schema change from `auth.clerk_user_id()` to `public.clerk_user_id()` has been applied to avoid permission errors.

## Next Steps (10 minutes)

### 1. Apply the Migration (3 min)

**Option A: Supabase Dashboard** (Easiest)
1. Open https://vbzwmjkniowxmecutymj.supabase.co
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy entire contents of `supabase/migrations/20250101000000_initial_schema.sql`
5. Paste and click **Run** (or Cmd/Ctrl + Enter)
6. ✅ Success when you see "Success. No rows returned"

**Option B: Supabase CLI**
```bash
cd /Users/steveharris/Documents/GitHub/mm-with-supabase
supabase link --project-ref vbzwmjkniowxmecutymj
supabase db push
```

### 2. Configure Clerk JWT Template (4 min)

1. Go to https://dashboard.clerk.com
2. Navigate to **JWT Templates**
3. Click **+ New template**
4. Choose **Supabase** (or Blank)
5. Name it **exactly** `supabase`
6. **IMPORTANT**: Add the `sub` claim to the existing template. Your final template should look like:

**In the Clerk UI, use the "Add claim" button and add these fields:**

**Standard Claims (should already exist):**
- `aud`: `authenticated` (literal string)
- `exp`: Use the shortcode dropdown → select `{{exp}}`
- `iat`: Use the shortcode dropdown → select `{{iat}}`

**Custom Claims (you need to add):**
- `iss`: `https://primary-thrush-30.clerk.accounts.dev` (literal string)
- `sub`: Use the shortcode dropdown → select `{{user.id}}`

**Keep the existing claims:**
- `email`: `{{user.primary_email_address}}`
- `role`: `authenticated`
- `app_metadata`: `{}`
- `user_metadata`: `{}`

The **`sub` claim with `{{user.id}}`** is critical - it contains the Clerk user ID that `public.clerk_user_id()` extracts for RLS policies.

**Alternative**: If the UI is confusing, you can paste this in the JSON editor view:
```json
{
  "aud": "authenticated",
  "exp": "{{exp}}",
  "iat": "{{iat}}",
  "iss": "https://primary-thrush-30.clerk.accounts.dev",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated",
  "app_metadata": {},
  "user_metadata": {}
}
```
Note: The shortcodes are in quotes for JSON validity, but Clerk will interpret them correctly.

7. Click **Apply Changes** or **Save**

### 3. Configure Supabase to Trust Clerk JWTs (3 min)

1. Back in Supabase Dashboard → **Authentication** → **Providers**
2. Scroll to **JWT Verification**
3. Click **Add a new provider**
4. Enter:
   - **Issuer**: `https://primary-thrush-30.clerk.accounts.dev`
   - **JWKS URL**: `https://primary-thrush-30.clerk.accounts.dev/.well-known/jwks.json`
5. Click **Save**

### 4. Test It! (2 min)

```bash
cd mm-health-tracker
npm run dev
```

Visit http://localhost:3000 - you should be redirected to Clerk sign-in!

## ✅ Verification Checklist

After completing the steps above:

- [ ] Migration ran successfully in Supabase SQL Editor
- [ ] Clerk JWT template named `supabase` created
- [ ] Supabase configured to accept Clerk JWTs
- [ ] Dev server starts without errors
- [ ] Can sign up / sign in with Clerk
- [ ] User profile created in `user_profiles` table (check Supabase Table Editor)

## 📚 Full Documentation

For detailed explanations, troubleshooting, and architecture overview, see:
- [MIGRATION-SETUP.md](MIGRATION-SETUP.md) - Complete setup guide
- [supabase-clerk-migration-plan.md](supabase-clerk-migration-plan.md) - Original migration plan

## 🆘 Common Issues

**"permission denied for schema auth"**
✅ Fixed! The migration now uses `public.clerk_user_id()` instead.

**"No rows returned" when querying**
- Verify Clerk JWT template is created and named exactly `supabase`
- Check that JWKS URL is accessible
- Make sure you're signed in via Clerk

**Can't see my data**
- Check you're using the correct user account
- Verify RLS policies are enabled (they should be after migration)
- Check `public.clerk_user_id()` function exists in Supabase

## 🎯 What's Next

After verifying the setup works:
1. Update `AppProvider` to load from Supabase instead of localStorage
2. Migrate pages to use new `useServices()` hook
3. Build migration script to import existing localStorage data
4. Remove all localStorage references

**Need help?** All the service layer code is ready in:
- `mm-health-tracker/src/lib/services/`
- `mm-health-tracker/src/lib/supabase/`
