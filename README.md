# MM Health Tracker

Comprehensive health tracking application built with Next.js, Supabase, and Clerk authentication.

## Live Production Site

**🌐 [measuredmanaged.app](https://measuredmanaged.app)**

## Tech Stack

- **Frontend**: Next.js 15.5.3 with React 19
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk (Production Mode)
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel
- **Type Safety**: TypeScript 5

## Features

### Core Health Tracking
- ✅ **Calorie & Macro Tracking** - Track calories, protein, carbs, fats, fiber, sugar, and sodium
- ✅ **Exercise Logging** - Record workouts with duration, intensity, and calories burned
- ✅ **Body Metrics** - Daily weight tracking and BMR calculations
- ✅ **Injection Management** - Track compound injections with dosages and schedules

### Productivity Systems
- ✅ **MITs (Most Important Tasks)** - Daily task prioritization with completion tracking
- ✅ **Weekly Planning & Objectives** - Set weekly goals with Friday reviews
- ✅ **Deep Work Tracking** - Monitor focused work sessions
- ✅ **Winners Bible** - Image gallery with Supabase Storage integration

### Advanced Features
- ✅ **Nirvana System** - Handstand and flexibility training with session types, milestones, and personal records
- ✅ **Custom Metrics** - Track any additional health metrics you define
- ✅ **Analytics Dashboard** - Visualize your progress over time
- ✅ **Food Templates** - Save frequently eaten foods for quick entry

## Database Architecture

All tables use Row Level Security (RLS) with Clerk-based authentication. User data is isolated using the `clerk_user_id()` function, ensuring users can only access their own data.

### Recent Database Migrations

- **Security Hardening**: Fixed mutable search_path vulnerabilities in 6 database functions
- **Performance Optimization**: Added foreign key indexes for faster query performance
- **Index Cleanup**: Removed unused indexes to improve write performance

## Branch Migration Status

- ✅ Branch 1: Calories + Exercise
- ✅ Branch 2: Weight & Deep Work
- ✅ Branch 3: MITs (Most Important Tasks)
- ✅ Branch 4: Injection System
- ✅ Branch 5: Weekly Planning & Objectives
- ✅ Branch 6: Nirvana System (Handstand & Flexibility)
- ✅ Branch 7: Winners Bible with Supabase Storage
- ✅ Production Deployment: Clerk Production Mode & Security Hardening

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env.local` and configure your Supabase and Clerk credentials
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Production Configuration

The app is deployed at **measuredmanaged.app** with:
- Clerk authentication in production mode
- Supabase database with full RLS protection
- SSL certificates configured and active
- Optimized database indexes for performance
