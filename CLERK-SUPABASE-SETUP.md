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
```json
{
  "iss": "https://{{app_domain}}",
  "sub": "{{user.id}}",
  "aud": "authenticated",
  "exp": {{current_timestamp + (60 * 60)}},
  "role": "authenticated",
  "email": "{{user.primary_email_address}}",
  "app_metadata": {
    "provider": "clerk",
    "providers": ["clerk"]
  },
  "user_metadata": {}
}
```

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
