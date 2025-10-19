# Configure Supabase to Accept Clerk JWTs

## Problem Identified

✅ Clerk JWT is generating correctly with all required claims
❌ Supabase is rejecting the JWT with "No suitable key or wrong key type"

This means Supabase doesn't know how to verify Clerk's JWT signature.

## Solution: Configure Supabase JWT Settings

### Option 1: Use Clerk's JWKS URL (Recommended)

1. **Get your Clerk JWKS URL:**
   - Format: `https://YOUR-CLERK-FRONTEND-API/.well-known/jwks.json`
   - Find your Frontend API in Clerk Dashboard → API Keys
   - Example: `https://measured-managed-abc123.clerk.accounts.dev/.well-known/jwks.json`

2. **Configure Supabase:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project: `vbzwmjkniowxmecutymj`
   - Go to **Settings** → **API**
   - Scroll down to **JWT Settings**
   - Under "JWT Verification" or "Additional JWT Secrets", add:
     - **JWKS URI**: `https://YOUR-CLERK-DOMAIN/.well-known/jwks.json`

### Option 2: Add Clerk's Public Key to Supabase

If Supabase doesn't support JWKS URIs directly, you need to add the public key:

1. **Get Clerk's Public Key:**
   - Go to Clerk Dashboard → API Keys
   - Look for "JWT Verification Key" or download the JWKS
   - Extract the public key from the JWKS

2. **Add to Supabase:**
   - In Supabase Dashboard → Settings → API → JWT Settings
   - Add the public key as a verification key

### Option 3: Use Supabase's Custom Claims (Our Current Setup)

Our `clerk_user_id()` function reads from JWT claims. We need to make sure Supabase's JWT secret configuration allows Clerk tokens.

**Check Current Configuration:**

Run this in your Supabase SQL Editor to see current JWT settings:

```sql
SHOW app.settings.jwt_secret;
SHOW app.settings.jwt_exp;
```

## Critical: Supabase + Clerk Integration Settings

Based on Clerk's official Supabase integration docs, you need to:

1. **In Supabase Dashboard** → Settings → API:
   - Find "JWT Secret" section
   - You may need to add Clerk as an additional JWT issuer

2. **Alternative**: Use Supabase's "Custom Auth" feature:
   - Settings → Authentication → Custom
   - Enable "Custom JWT"
   - Add Clerk's JWKS URL or public key

## Verify Your Clerk Domain

Run this in the browser console to get your exact Clerk domain:

```javascript
console.log('Clerk Frontend API:', window.Clerk?.frontendApi);
console.log('JWKS URL:', `https://${window.Clerk?.frontendApi}/.well-known/jwks.json`);
```

Then use that JWKS URL in Supabase.

## Expected Behavior After Configuration

Once Supabase is configured to trust Clerk JWTs:
- ✅ 401 errors will disappear
- ✅ `clerk_user_id()` function will correctly read `sub` claim
- ✅ RLS policies will work
- ✅ All database queries will succeed

## Testing

After configuration, refresh measuredmanaged.app and check:
1. Browser console should show no 401 errors
2. Profile should load
3. Data should display correctly

## Debugging

If still getting 401s after configuration:

```javascript
// Check if token is being sent to Supabase
const token = await window.Clerk?.session?.getToken({ template: 'supabase' });
console.log('Token being sent:', token ? 'Yes' : 'No');

// Check headers being sent
// Open Network tab → Find a Supabase request → Check Headers
// Look for: Authorization: Bearer <token>
```

## Reference Links

- [Clerk + Supabase Integration Guide](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase JWT Configuration](https://supabase.com/docs/guides/auth/auth-helpers/jwt)
- [Clerk JWKS Documentation](https://clerk.com/docs/request-authentication/jwt-templates)
