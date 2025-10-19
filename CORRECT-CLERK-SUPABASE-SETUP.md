# CORRECT Clerk + Supabase Setup (Updated for New JWT Keys)

## The Real Issue

Supabase has migrated from legacy HS256 (shared secret) to **new ECC (P-256) signing keys**.

**We need a different approach:**
- ❌ Don't use Supabase's JWT secret in Clerk (old method)
- ✅ Use Clerk's own signing and configure Supabase to trust Clerk

## Correct Setup (Step by Step)

### Step 1: Disable Custom Signing in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **JWT Templates** → `supabase` template
3. **TURN OFF "Custom signing key"** (disable it)
4. Make sure these claims exist:
   - `sub` → `{{user.id}}`
   - `aud` → `authenticated`
   - `role` → `authenticated`
   - `email` → `{{user.primary_email_address}}`
5. Save

### Step 2: Get Clerk's JWKS URL

You need Clerk's public key URL (JWKS):

```
https://YOUR-CLERK-DOMAIN/.well-known/jwks.json
```

To find your Clerk domain:
1. Clerk Dashboard → Settings → Domains
2. Look for your "Frontend API" domain
3. Example: `measured-managed-abc123.clerk.accounts.dev`

**Your JWKS URL will be:**
```
https://measured-managed-abc123.clerk.accounts.dev/.well-known/jwks.json
```

### Step 3: Configure Supabase to Trust Clerk JWTs

This is the tricky part. Supabase needs to know about Clerk's signing keys.

#### Option A: Add Clerk as Additional JWT Issuer (if Supabase supports it)

In Supabase Dashboard → Authentication settings:
- Look for "Additional JWT Issuers" or "External Auth Providers"
- Add Clerk's JWKS URL

#### Option B: Use Supabase's Custom Claims

If Supabase doesn't have a UI for this, we need to configure it via SQL:

```sql
-- This tells Supabase to accept JWTs from Clerk
-- Run this in Supabase SQL Editor
ALTER DATABASE postgres SET request.jwt.claim.sub TO 'user_id';
```

#### Option C: Modify RLS Policies to Use Custom Function

Instead of relying on Supabase's built-in JWT verification, use our custom function that reads from request headers.

**This is what we're already doing with `clerk_user_id()` function!**

### Step 4: The Actual Problem - Supabase Rejecting Clerk's JWT

Supabase is configured to **only accept JWTs signed by Supabase's own keys**.

We have two options:

#### **OPTION 1: Use Supabase Auth (Recommended by Supabase)**

Stop using Clerk for database authentication and use Supabase Auth instead.
- Not what we want since we're using Clerk

#### **OPTION 2: Bypass Supabase's JWT Verification (Our Current Approach)**

Use the `service_role` key instead of the `anon` key, OR configure RLS to work differently.

**The real fix:** We need to tell Supabase to accept Clerk JWTs by adding Clerk as a trusted issuer.

### Step 5: Check if Supabase Has Updated JWT Configuration

Go to Supabase Dashboard → Settings → API:

Look for any new settings related to:
- "JWT Verification"
- "Trusted Issuers"
- "JWKS URLs"
- "External Authentication"

If you see options to add external JWT providers, add:
- **Issuer**: `https://YOUR-CLERK-DOMAIN`
- **JWKS URL**: `https://YOUR-CLERK-DOMAIN/.well-known/jwks.json`
- **Audience**: `authenticated`

## Alternative Solution: Use Supabase Service Role

Since Supabase's JWT verification is blocking us, we can bypass it:

### Update the Supabase Client to Use Service Role

**WARNING**: This is less secure but will work immediately.

Change the Supabase client initialization to use the `service_role` key instead of relying on JWT verification, and handle RLS entirely through the `clerk_user_id()` function.

This means:
1. App sends requests with Supabase service_role key
2. Also sends Clerk JWT in custom header
3. RLS policies use `clerk_user_id()` to read from custom header
4. No JWT verification needed by Supabase

## Recommended Immediate Fix

Given Supabase's migration to new signing keys, the **immediate working solution** is:

1. **Disable custom signing in Clerk** (turn it OFF)
2. **Update our code to send Clerk JWT in a custom header**
3. **Modify `clerk_user_id()` to read from custom header instead of standard JWT claims**

I'll create the code changes for this approach.

## Why This Happened

Supabase changed their JWT signing from:
- **Old**: HS256 with shared secret (what we were trying to use)
- **New**: ECC (P-256) with public/private key pairs

The legacy key still exists but Supabase is migrating everyone to the new system, which doesn't work with our "custom signing key" approach.

## Next Steps

Let me know if Supabase Dashboard has any options for:
- Adding external JWT providers
- JWKS URL configuration
- Trusted issuers

Otherwise, I'll implement the custom header approach which will work immediately.
