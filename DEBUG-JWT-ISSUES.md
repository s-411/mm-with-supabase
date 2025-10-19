# Debugging Clerk JWT + Supabase 401 Errors

## Current Issue

Getting 401 errors: `Failed to fetch profile: No suitable key or wrong key type`

This means the Clerk JWT token is either:
1. Not being generated with the correct claims
2. Not being sent to Supabase properly
3. Not being verified correctly by Supabase

## Step-by-Step Debug Process

### Step 1: Verify Clerk JWT Template Exists

In your Clerk Dashboard:
1. Go to **JWT Templates**
2. Confirm you have a template named exactly `supabase` (lowercase)
3. Click on it and verify it has these claims:

**Required Claims:**
- `sub` → `{{user.id}}`
- `aud` → `authenticated` (literal string, not a variable)
- `role` → `authenticated` (literal string, not a variable)

**Optional but helpful:**
- `email` → `{{user.primary_email_address}}`
- `exp` → `{{current_timestamp + (60 * 60)}}`
- `iss` → `https://{{app_domain}}`

### Step 2: Test JWT Token Generation

Open your browser console on measuredmanaged.app and run:

```javascript
// Get the Clerk session token
const session = await window.Clerk?.session;
const token = await session?.getToken({ template: 'supabase' });
console.log('Token:', token);

// Decode the JWT (paste at jwt.io to inspect)
if (token) {
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  console.log('JWT Payload:', payload);
}
```

**What to check:**
- Token should exist (not null/undefined)
- Payload should have `sub`, `aud`, `role` fields
- `sub` should be your user ID (starts with `user_`)
- `aud` should be `"authenticated"`
- `role` should be `"authenticated"`

### Step 3: Check What Supabase Receives

The error "No suitable key or wrong key type" suggests Supabase can't decrypt/verify the JWT.

**Possible causes:**

#### A) Template name mismatch
- Code calls `getToken({ template: 'supabase' })`
- Template in Clerk must be named **exactly** `supabase` (lowercase)

#### B) Missing or wrong `aud` claim
- Supabase expects `aud: "authenticated"`
- Must be a literal string, not `{{user.id}}` or anything else

#### C) Missing or wrong `role` claim
- Supabase expects `role: "authenticated"`
- Must be a literal string

#### D) Wrong signing algorithm
- Clerk should use RS256 (default)
- Supabase expects RS256

### Step 4: Verify Supabase Configuration

Check if Supabase needs the Clerk JWKS URL configured:

1. Go to Supabase Dashboard → Authentication → Providers
2. Look for JWT/Custom Claims settings
3. You may need to add Clerk's JWKS URL:
   - `https://YOUR-CLERK-DOMAIN/.well-known/jwks.json`
   - Replace `YOUR-CLERK-DOMAIN` with your actual Clerk domain

**Find your Clerk domain:**
- In Clerk Dashboard → Settings → Domains
- It's usually something like `measured-managed-12345.clerk.accounts.dev` or your custom domain

### Step 5: Alternative - Use Clerk's Built-in Supabase Template

Instead of manually creating claims:

1. In Clerk Dashboard → JWT Templates
2. Click **New template**
3. Look for **Supabase** in the template gallery
4. Click it and it will auto-configure with the correct claims
5. Name it `supabase`
6. Save

This ensures all claims are set correctly.

## Quick Test Script

Run this in your browser console when logged in:

```javascript
async function debugJWT() {
  try {
    const session = await window.Clerk?.session;

    if (!session) {
      console.error('❌ No Clerk session found - user not logged in');
      return;
    }

    console.log('✅ Clerk session exists');
    console.log('User ID:', session.user?.id);

    const token = await session.getToken({ template: 'supabase' });

    if (!token) {
      console.error('❌ No token returned - check if "supabase" template exists');
      return;
    }

    console.log('✅ Token generated');

    // Decode JWT
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));

    console.log('JWT Payload:', payload);

    // Verify required claims
    const checks = {
      'has sub claim': !!payload.sub,
      'has aud claim': !!payload.aud,
      'has role claim': !!payload.role,
      'aud is authenticated': payload.aud === 'authenticated',
      'role is authenticated': payload.role === 'authenticated',
      'sub matches user ID': payload.sub === session.user?.id
    };

    console.table(checks);

    const allPassed = Object.values(checks).every(v => v === true);

    if (allPassed) {
      console.log('✅ All JWT checks passed!');
      console.log('Token should work with Supabase.');
      console.log('If still getting 401, check Supabase JWKS configuration.');
    } else {
      console.error('❌ Some JWT checks failed - see table above');
      console.error('Fix the Clerk JWT template configuration');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugJWT();
```

## Common Solutions

### Solution 1: Template Name Typo
- **Problem**: Template named "Supabase" or "supabase-prod"
- **Fix**: Rename to exactly `supabase` (lowercase)

### Solution 2: Missing `aud` or `role` Claims
- **Problem**: Template only has `sub` claim
- **Fix**: Add `aud` and `role` as literal strings:
  - `aud` = `authenticated`
  - `role` = `authenticated`

### Solution 3: Supabase Needs JWKS URL
- **Problem**: Supabase can't verify Clerk's signature
- **Fix**: In Supabase Dashboard → Settings → API → JWT Settings
  - Add Clerk's JWKS URL

### Solution 4: Using Wrong Signing Secret
- **Problem**: Supabase JWT Secret doesn't match Clerk
- **Fix**: Supabase should verify using Clerk's public key (JWKS), not a secret

## Still Not Working?

If you've tried everything above and still getting 401s:

1. Share the output of the debug script above
2. Share a screenshot of your Clerk JWT template configuration
3. Check Supabase logs for more specific error messages

## Next Steps After Fixing

Once JWT is working:
1. The 401 errors will disappear
2. Profile will load successfully
3. All CRUD operations will work
4. No more "No suitable key or wrong key type" errors
