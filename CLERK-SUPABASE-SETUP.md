# Clerk + Supabase JWT Configuration

## Critical Setup Required

For Clerk to work with Supabase, you **MUST** configure a custom JWT template in your Clerk Dashboard.

### Steps to Configure:

1. **Go to Clerk Dashboard**
   - Navigate to: [Clerk Dashboard](https://dashboard.clerk.com)
   - Select your production application

2. **Create Supabase JWT Template**
   - Go to **JWT Templates** in the sidebar
   - Click **New template**
   - Choose **Supabase** from the templates OR create a **Blank** template

3. **Configure the Template**
   - **Template Name**: `supabase` (exactly this name - it's referenced in the code)
   - **Token Lifetime**: 3600 seconds (1 hour)

4. **Add these Claims**:

**IMPORTANT**: Don't copy-paste this as JSON. In Clerk's UI, add each claim individually:

| Claim Name | Value | Notes |
|------------|-------|-------|
| `iss` | `https://{{app_domain}}` | Issuer (auto-filled by Clerk) |
| `sub` | `{{user.id}}` | Subject - the user's Clerk ID |
| `aud` | `authenticated` | Audience (literal string) |
| `exp` | `{{current_timestamp + (60 * 60)}}` | Expiration (1 hour from now) |
| `role` | `authenticated` | Supabase role (literal string) |
| `email` | `{{user.primary_email_address}}` | User's email |

**For nested claims** (app_metadata and user_metadata), use the JSON editor in Clerk:
```json
{
  "app_metadata": {
    "provider": "clerk",
    "providers": ["clerk"]
  },
  "user_metadata": {}
}
```

**OR** if Clerk has a "Supabase" template option, just select that and it will auto-configure everything.

5. **Save the Template**

### Verifying the Setup

After creating the template:

1. The template MUST be named exactly `supabase` (lowercase)
2. In your code, when calling `getToken({ template: 'supabase' })`, it will use this template
3. The JWT will include the claims needed for Supabase RLS to recognize the user

### What This Fixes

Without this configuration, you'll see errors like:
- `Failed to fetch profile: No suitable key or wrong key type`
- 401 Unauthorized errors on all Supabase queries
- RLS policies rejecting requests

The `clerk_user_id()` function in Supabase reads from `current_setting('request.jwt.claims', true)::json->>'sub'`, which comes from the JWT template's `sub` claim.

### Testing

After configuration:
1. Sign in to your app at measuredmanaged.app
2. Check browser console - you should see no 401 errors
3. Profile data should load successfully
4. All CRUD operations should work

## Additional Resources

- [Clerk JWT Templates Documentation](https://clerk.com/docs/request-authentication/jwt-templates)
- [Supabase + Clerk Integration Guide](https://clerk.com/docs/integrations/databases/supabase)
