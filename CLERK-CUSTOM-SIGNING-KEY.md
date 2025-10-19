# Enable Custom Signing Key in Clerk JWT Template

## The Problem

Clerk is signing JWTs with its own private key, but Supabase can't verify them because it doesn't have Clerk's public key.

**Current Status:**
- ✅ Clerk JWT template generating correct claims
- ❌ "Custom signing key" is **disabled** in Clerk
- ❌ Supabase rejecting tokens with "No suitable key or wrong key type"

## The Solution

You need to enable **Custom signing key** in your Clerk JWT template and use **Supabase's JWT Secret**.

### Step 1: Get Your Supabase JWT Secret

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vbzwmjkniowxmecutymj`
3. Go to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Find **JWT Secret** (it's labeled as `service_role secret` or in the JWT Settings section)
6. **Copy the JWT Secret** - it's a long string like `super-secret-jwt-token-with-at-least-32-characters`

**Important**: This is different from your `anon` and `service_role` keys. Look for the actual JWT signing secret.

### Step 2: Enable Custom Signing Key in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **JWT Templates**
3. Click on your `supabase` template
4. Find the **Custom signing key** toggle
5. **Enable it** (turn it ON)
6. A field will appear asking for the signing key
7. **Paste your Supabase JWT Secret** from Step 1
8. Click **Save**

### Step 3: Algorithm Configuration

Make sure the signing algorithm is set to:
- **Algorithm**: `HS256` (HMAC with SHA-256)

This is the default algorithm Supabase uses.

### Step 4: Test the Configuration

After enabling the custom signing key:

1. Go to measuredmanaged.app
2. Sign out and sign back in (to get a fresh token)
3. Check browser console - 401 errors should be gone!
4. Profile should load successfully

### Verify the Fix

Run this in your browser console:

```javascript
async function verifyFix() {
  const session = await window.Clerk?.session;
  const token = await session?.getToken({ template: 'supabase' });

  if (!token) {
    console.error('No token generated');
    return;
  }

  // Decode header to check algorithm
  const header = JSON.parse(atob(token.split('.')[0]));
  console.log('Signing Algorithm:', header.alg);
  console.log('Expected: HS256');
  console.log('Match:', header.alg === 'HS256');
}

verifyFix();
```

## Why This Works

**Before:**
1. Clerk signs JWT with **Clerk's private key** (RS256)
2. Sends JWT to Supabase
3. Supabase tries to verify with **Supabase's JWT secret**
4. ❌ Verification fails - different keys!

**After:**
1. Clerk signs JWT with **Supabase's JWT secret** (HS256)
2. Sends JWT to Supabase
3. Supabase verifies with **same JWT secret**
4. ✅ Verification succeeds!

## Finding Supabase JWT Secret

If you can't find the JWT Secret in the Supabase Dashboard:

### Method 1: Check Project Settings
- Settings → API → Configuration
- Look for "JWT Settings" section
- The secret should be listed there

### Method 2: Use the anon key to derive it (NOT RECOMMENDED)
The JWT secret is used to sign the anon and service_role keys, but you need the actual secret, not the keys themselves.

### Method 3: Generate a new one
If you absolutely can't find it:
1. Settings → API → JWT Settings
2. You might see an option to "Regenerate JWT Secret"
3. **WARNING**: This will invalidate all existing tokens!

## After Configuration

Expected behavior:
- ✅ No 401 errors
- ✅ Profile loads correctly
- ✅ All CRUD operations work
- ✅ RLS policies enforce correctly

## Troubleshooting

If still getting 401s after enabling custom signing key:

1. **Check the secret is correct:**
   - It should be from Supabase Dashboard → Settings → API → JWT Secret
   - Must be the actual JWT signing secret, not the anon key

2. **Verify algorithm is HS256:**
   - In Clerk template settings
   - Should match Supabase's default

3. **Clear your session:**
   - Sign out
   - Clear browser cookies
   - Sign back in
   - This ensures you get a freshly signed token

4. **Check token in browser:**
   - Run the verification script above
   - Algorithm should be `HS256`

## Reference

- [Clerk Custom Signing Keys](https://clerk.com/docs/request-authentication/jwt-templates#custom-signing-keys)
- [Supabase JWT Configuration](https://supabase.com/docs/guides/auth/jwts)
