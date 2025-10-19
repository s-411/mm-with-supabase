# Vercel Deployment Guide

This guide will help you deploy the MM Health Tracker to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your Supabase project credentials
- Your Clerk project credentials

## Step 1: Configure Root Directory

Since this is a monorepo with the Next.js app in a subdirectory, you need to configure Vercel's Root Directory:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. Find the **Root Directory** section
4. Click **Edit**
5. Enter: `mm-health-tracker`
6. Click **Save**

## Step 2: Add Environment Variables

You need to add the following environment variables in your Vercel project:

1. Go to **Settings** → **Environment Variables**
2. Add each of the following variables:

### Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Where to find these:**
- Go to your [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to **Settings** → **API**
- Copy the **Project URL** and **anon/public** key

### Clerk Configuration

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

**Where to find these:**
- Go to your [Clerk Dashboard](https://dashboard.clerk.com)
- Select your application
- Go to **API Keys**
- Copy the **Publishable Key** and **Secret Key**

### Clerk URL Configuration

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Step 3: Deploy

Once you've configured the Root Directory and added all environment variables:

1. Go to the **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for the build to complete

Your application should now be successfully deployed!

## Troubleshooting

### Build fails with "No Next.js version detected"

Make sure you've set the Root Directory to `mm-health-tracker` in your Vercel project settings.

### Build fails with "Missing publishableKey" error

Make sure you've added all the Clerk environment variables in your Vercel project settings.

### Database connection errors

Make sure you've added the Supabase environment variables correctly and that your Supabase project is active.

## Environment Variables Summary

For your reference, here are all the required environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vbzwmjkniowxmecutymj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Quick Setup Script

You can copy all environment variables at once from your local `.env.local` file to Vercel using the Vercel CLI:

```bash
cd mm-health-tracker
vercel env pull
```

Or add them one by one via the dashboard as described in Step 2.
