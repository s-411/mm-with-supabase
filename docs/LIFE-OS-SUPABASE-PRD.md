# Life OS - Product Requirements Document (PRD)

**Version:** 2.0 (Supabase Implementation)
**Date:** 2025-01-30
**Status:** Ready for Implementation
**Platform:** Supabase-Native Multi-User Web Application

---

## Goals and Background Context

### Goals

- **Comprehensive Health Tracking**: Provide users with a unified platform to track daily health metrics, nutrition, exercise, injections, and personal development activities
- **Real-Time Analytics**: Deliver instant insights and visualizations of health data with automatic calculations and trend analysis
- **Multi-Device Access**: Enable users to access their health data seamlessly across any device with cloud synchronization
- **Data-Driven Decisions**: Empower users to make informed health decisions through intelligent analysis and goal tracking
- **Gamified Motivation**: Incorporate engaging features like the Nirvana Life system and Winners Bible to maintain long-term user engagement
- **Secure Multi-User Platform**: Provide enterprise-grade authentication and data isolation for multiple users with zero data cross-contamination

### Background Context

Life OS addresses the fragmented landscape of health tracking applications by providing an all-in-one solution built on modern cloud infrastructure. Current health tracking solutions force users to juggle multiple apps for different aspects of their health journey, leading to data silos and incomplete insights.

This application consolidates daily activity tracking, calorie/macro management, injection/medication schedules, mobility training (Nirvana), and motivational systems into a unified, intelligent platform. Built on Supabase, the application provides real-time synchronization, secure authentication, and scalable data management while maintaining a distinctive dark-themed design system that emphasizes readability and user experience.

The platform targets health-conscious individuals who demand precision tracking, data ownership, and actionable insights—particularly those managing complex health protocols involving nutrition optimization, performance enhancement, and detailed biomarker tracking.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-30 | 2.0 | Complete Supabase-native PRD for greenfield implementation | Mary (Business Analyst) |

---

## Requirements

### Functional Requirements

**FR1**: **User Authentication & Account Management**
The system shall provide secure user authentication via Supabase Auth supporting email/password, OAuth providers (Google, GitHub), and magic link sign-in. Each user shall have a completely isolated account with their own private health data.

**FR2**: **User Profile Configuration**
Users shall configure their health profile including BMR (Basal Metabolic Rate), gender, height, weight, age, and timezone. The system shall use these values for all personalized calculations throughout the application.

**FR3**: **Daily Tracking Hub**
The system shall provide a centralized Daily Tracker page displaying the current date (in user's timezone), daily MITs (Most Important Things) with completion checkboxes, weight entry, deep work session tracking, Winners Bible viewing status, and quick-action cards for common tasks.

**FR4**: **Weekly Objectives & Friday Review**
Every Friday, the Daily Tracker shall display a "Weekly Objectives Review" section where users can review their weekly goals, reflect on accomplishments, and note key observations. This data shall be stored and retrievable for historical analysis.

**FR5**: **Most Important Things (MITs) System**
Users shall add, complete, and manage up to 3 Most Important Things per day. Each MIT shall have a title, completion status, and timestamp. MITs shall persist per day and display completion statistics in analytics.

**FR6**: **Weight Tracking with BMI Calculation**
Users shall log daily weight measurements. The system shall automatically calculate and display BMI using the formula: `BMI = weight (kg) / (height (m))²`. Historical weight data shall be visualized in line charts on the Analytics page.

**FR7**: **Calorie & Macro Tracking**
Users shall log food entries with calories, carbohydrates, protein, and fat values. The system shall maintain a running total for the day and calculate the daily balance using: `Balance = BMR - Total Calories Consumed + Calories Burned from Exercise`.

**FR8**: **Food Templates System**
Users shall create reusable food templates with predefined macro values for frequently consumed meals. Templates shall be selectable from a dropdown for one-click food entry. Users can manage templates (add/edit/delete) in Settings.

**FR9**: **Exercise & Activity Tracking**
Users shall log exercise sessions with activity name, duration (minutes), and calories burned. Exercise calories shall automatically increment the daily calorie balance in real-time.

**FR10**: **Macro Target Tracking**
Users shall set daily macro targets (calories, carbs, protein, fat) in Settings. The Calories page shall display progress bars showing actual vs. target for each macro with percentage completion and color-coded status (green = on target, yellow = close, red = over/under).

**FR11**: **Injection & Compound Management**
Users shall track injections of various compounds (e.g., Ipamorellin, Retatrutide, Testosterone) with dosage amount, unit (mg/ml/mcg/IU), date, time, and optional notes. Users can manage their compound list in Settings by adding or removing compounds.

**FR12**: **Weekly Injection Targets & Progress**
Users shall set weekly dosage targets for each compound, specifying dose amount, frequency per week, and unit. The Injections page shall calculate and display weekly progress showing target vs actual dosage, injection count, percentage completion, and on-target status with visual indicators.

**FR13**: **Nirvana Life Tracking**
The system shall provide a dedicated Nirvana page for tracking mobility/gymnastics training sessions. Users select a session type (configurable in Settings), mark completion, and view completion history. The system tracks morning and night viewing of motivational content.

**FR14**: **Nirvana Session Types Configuration**
Users shall configure custom session types for Nirvana Life tracking in Settings (e.g., "Mobility Flow", "Handstand Practice", "Flexibility Training"). These types appear as selectable options on the Nirvana tracking page.

**FR15**: **Winners Bible Motivational System**
Users shall upload up to 15 motivational images in Settings. The Winners Bible page displays these images in a full-screen slideshow interface with navigation controls. Users mark morning and night viewing sessions, which are tracked on the Daily Tracker.

**FR16**: **Comprehensive Analytics Dashboard**
The system shall provide an Analytics page with multiple tabs:
- **Weight Progress**: Line chart of weight over time with trend analysis
- **Calorie Balance**: Daily balance visualization showing surplus/deficit patterns
- **Injection Consistency**: Heat maps and bar charts showing injection frequency and adherence to targets
- **MIT Completion Rate**: Statistics and trends for daily task completion
- **Weekly Review History**: Archive of all Friday weekly reviews with search and filter

**FR17**: **Time Range Filtering**
Analytics and history views shall support multiple time range filters: 3 days, 7 days, 30 days, 60 days, 90 days, and All Time. Filters shall apply to all visualizations and update charts in real-time.

**FR18**: **BMR Calculator Tool**
The system shall provide a dedicated BMR Calculator page using the Mifflin-St Jeor Equation:
- **Male**: `BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5`
- **Female**: `BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161`
- **Other**: Average of male and female formulas

Users can calculate their BMR and save it directly to their profile for use in calorie balance calculations.

**FR19**: **Data Export & Backup**
Users shall export all their health data as a JSON file from the Settings page. The export shall include profile data, all daily entries, food templates, injection targets, Nirvana sessions, and Winners Bible data.

**FR20**: **Data Import & Restoration**
Users shall import previously exported JSON data to restore their health tracking history. The system shall validate the import file format and merge data appropriately, preventing duplicates.

**FR21**: **Timezone Support**
The system shall respect the user's configured timezone for all date/time operations. Days shall change at midnight in the user's timezone. The system shall support major timezones globally.

**FR22**: **Responsive Design & Mobile Support**
The application shall be fully responsive, adapting to mobile, tablet, and desktop screen sizes. Mobile users shall access core features through a bottom navigation bar, while desktop users get a persistent sidebar and top header navigation.

**FR23**: **Real-Time Data Synchronization**
All user data changes shall synchronize instantly across devices using Supabase Realtime subscriptions. Multiple sessions of the same user account shall see updates without page refresh.

**FR24**: **Settings & Configuration Hub**
Users shall access a comprehensive Settings page to configure:
- Profile information (BMR, gender, height, weight)
- Timezone settings
- Macro targets
- Injection compounds list
- Injection targets with weekly goals
- Nirvana session types
- Food templates
- Winners Bible image management
- Daily Tracker feature toggles (weight, deep work, custom metrics)
- Data export/import

**FR25**: **History & Data Retrieval**
Users shall access historical data for any past date. The system shall support:
- Viewing complete daily entries from any previous day
- Searching and filtering historical entries by date range
- Analyzing trends across custom time periods
- Exporting historical data subsets

**FR26**: **Modular Habits & Lifestyle Tracking System**
The system shall provide a flexible, extensible module framework for tracking diverse lifestyle behaviors and habits. Users shall:
- Enable/disable tracking modules from Settings (toggle on/off)
- See enabled modules as interactive cards on the Daily Tracker hub
- Track modules with appropriate data types:
  - **Binary** (Yes/No, Done/Not Done): e.g., meditation completed, cold shower taken
  - **Counter** (numeric value): e.g., glasses of water, hours of sleep, servings of vegetables
  - **Goal-Based** (target + actual): e.g., 8 hours sleep target, 10,000 steps goal
- View all enabled modules in the Analytics Dashboard with streak tracking, totals, trends, and completion rates
- Export module data as part of standard data export functionality

The module system shall be architecturally designed for expansion: new modules can be added to the system schema without modifying core functional requirements or breaking existing functionality. Module definitions are stored as schema-level objects with metadata (name, description, type, unit, icon, category) and dynamically surfaced based on user settings.

**Architecture Note**: The modular system uses a single `lifestyle_modules` table defining available modules, a `user_module_settings` table for user enable/disable preferences, and a `module_entries` table for daily tracking data. This architecture allows future module additions via database seeding without PRD changes. See **Appendix A: Modular Habits & Lifestyle System** for module categories and examples.

### Non-Functional Requirements

**NFR1**: **Performance & Responsiveness**
The application shall load the initial page in under 2 seconds on a 4G mobile connection. Data queries shall return results in under 500ms. Real-time updates shall propagate to all connected clients within 1 second.

**NFR2**: **Database Design & Scalability**
The Supabase PostgreSQL database shall be normalized to 3NF (Third Normal Form) to eliminate redundancy. The schema shall support:
- Efficient querying with appropriate indexes on frequently accessed columns (user_id, date, timestamp)
- Row Level Security (RLS) policies ensuring users can only access their own data
- Automatic timestamps (created_at, updated_at) on all tables
- Cascading deletes where appropriate (e.g., deleting a user deletes all related data)

**NFR3**: **Data Isolation & Security**
Each user's data shall be completely isolated using Supabase Row Level Security. RLS policies shall enforce:
- Users can only SELECT, INSERT, UPDATE, DELETE their own records
- No user can access another user's data under any circumstance
- Admin users (if implemented) have separate elevated permissions
- All database operations must pass through authenticated Supabase client

**NFR4**: **Authentication Security**
User authentication shall follow security best practices:
- Passwords hashed with bcrypt (handled by Supabase Auth)
- JWT tokens for session management with automatic refresh
- OAuth integration for third-party providers
- Email verification for new accounts
- Password reset functionality via secure email links
- Session timeout after 30 days of inactivity (configurable)

**NFR5**: **Data Integrity & Validation**
All user inputs shall be validated on both client and server side:
- Required fields enforced via database constraints
- Data type validation (e.g., weight must be positive number)
- Range validation (e.g., BMI calculations require valid height/weight)
- Foreign key constraints for referential integrity
- Unique constraints where appropriate (e.g., one profile per user)

**NFR6**: **Availability & Reliability**
The application shall target 99.9% uptime, leveraging Supabase's infrastructure:
- Automatic failover and redundancy (managed by Supabase)
- Database backups every 24 hours with point-in-time recovery
- Error boundary components to gracefully handle client-side errors
- Retry logic for failed API calls with exponential backoff

**NFR7**: **Accessibility**
The application shall meet WCAG 2.1 AA standards:
- Semantic HTML structure for screen reader compatibility
- Keyboard navigation for all interactive elements
- Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Focus indicators visible on all interactive elements
- Alt text for all images and icons
- Form labels properly associated with inputs

**NFR8**: **Code Quality & Maintainability**
The codebase shall follow Next.js and React best practices:
- TypeScript for type safety across all components
- Component-based architecture with clear separation of concerns
- Reusable utility functions for common operations
- Consistent naming conventions (camelCase for variables, PascalCase for components)
- ESLint configuration for code quality enforcement
- Comprehensive inline comments for complex logic

**NFR9**: **Browser Compatibility**
The application shall support:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers: Safari iOS (latest), Chrome Android (latest)

**NFR10**: **Monitoring & Error Tracking**
The application shall implement:
- Client-side error boundary to catch React errors
- Logging of critical errors to external service (e.g., Sentry)
- Supabase query performance monitoring
- User feedback mechanism for reporting issues

---

## User Interface Design Goals

### Overall UX Vision

The Life OS employs a distinctive **dark theme aesthetic** that prioritizes focus, reduces eye strain, and creates a premium, modern feel. The design system centers around a signature **bright blue accent color (#00A1FE)** used sparingly for primary actions, active states, and data visualization highlights against the dark background.

The interface follows a **data-dense but organized** approach, recognizing that health tracking users want comprehensive information at a glance without excessive scrolling. Information hierarchy is established through strategic use of:
- **Card-based layouts** with subtle borders to group related content
- **Typography hierarchy** using National2Condensed (bold, condensed headings) and ESKlarheit (clean, readable body text)
- **Color-coded status indicators** (green = good/complete, orange = warning, red = critical/over-limit, blue = primary actions)
- **Responsive grid systems** that adapt from multi-column desktop layouts to single-column mobile views

The overall experience should feel **professional, precise, and empowering**—like a high-end fitness tracking device or premium health monitoring dashboard. Users should feel confident in the accuracy of their data and motivated by clear visualizations of their progress.

### Key Interaction Paradigms

1. **Quick-Action Cards**: Dashboard-style cards on the Daily Tracker provide one-tap access to common tasks (log food, add injection, view analytics). Each card displays current status at a glance.

2. **Inline Editing**: Where appropriate, users can edit data directly in tables or lists without navigating to separate edit screens (e.g., toggling MIT completion, editing weight).

3. **Modal Forms for Complex Input**: Adding new items with multiple fields (injections, food entries) uses modal overlays that keep users in context while providing focused input space.

4. **Persistent Navigation**: Desktop users have a sidebar with icon + label navigation always visible. Mobile users get a sticky bottom navigation bar with the 4 most important pages.

5. **Date Navigation**: Any page with date-specific data includes a date picker/navigator, allowing users to quickly jump to past dates for historical review or data entry.

6. **Real-Time Feedback**: All calculations (calorie balance, macro percentages, injection progress) update instantly as users enter data, providing immediate feedback.

7. **Progressive Disclosure**: Advanced features and settings are tucked away but easily accessible, preventing overwhelm for new users while remaining available for power users.

### Core Screens and Views

1. **Daily Tracker** (Home/Dashboard)
   - Current date display with timezone indicator
   - Daily MITs section with add/complete functionality
   - Weight entry with BMI calculation
   - Deep work session tracking
   - Winners Bible viewing status (morning/night)
   - Quick-action cards (Calories Summary, Injections Summary, Nirvana Status)
   - Weekly Objectives Review section (Fridays only)

2. **Calories Page**
   - Macro targets overview with progress bars
   - Daily calorie balance calculation with visual indicator
   - Food log table (time, name, calories, carbs, protein, fat, actions)
   - Add food form with template selector
   - Exercise log table (time, activity, duration, calories, actions)
   - Add exercise form
   - Historical data access via date picker

3. **Injections Page**
   - Add injection form (compound selector, date, time, dosage, unit, notes)
   - Weekly dosage analysis cards (one per compound showing target vs actual, progress %)
   - Injection history table with filters (time range, compound)
   - Statistics overview (total injections, compounds tracked, weekly count, last injection)

4. **Nirvana Page**
   - Current session selection (dropdown of configured session types)
   - Mark session complete button
   - Session history with completion dates
   - Morning/night motivational content viewing tracker

5. **Winners Bible Page**
   - Full-screen image slideshow viewer
   - Navigation arrows (previous/next)
   - Image indicator dots
   - Mark morning viewed / Mark night viewed buttons
   - Viewing status display (morning ✓, night ✓)

6. **Analytics Page**
   - Tab navigation (Weight Progress, Calorie Balance, Injection Consistency, MIT Completion, Weekly Reviews)
   - Time range selector (3/7/30/60/90 days, All Time)
   - Interactive charts (line charts for weight/calories, bar charts for injections, completion heat maps)
   - Summary statistics cards for each metric
   - Export data button

7. **Settings Page**
   - Profile Settings card (BMR, gender, height, weight)
   - Timezone Settings card
   - Macro Targets card
   - Injection Compounds card (list with add/remove)
   - Injection Targets card (weekly goals per compound)
   - Nirvana Session Types card (configurable list)
   - Food Templates card (manage reusable meal entries)
   - Winners Bible card (upload/manage up to 15 images)
   - Daily Tracker Settings card (toggle weight, deep work, custom metrics)
   - Data Management card (export, import, clear all data)

8. **BMR Calculator Page**
   - Input form (height, weight, age, gender)
   - Calculate button
   - Results display with calculated BMR value
   - Save to Profile button
   - Educational content explaining BMR and the Mifflin-St Jeor equation

### Accessibility

**Target Level**: WCAG 2.1 AA Compliance

- All interactive elements keyboard navigable
- Screen reader support with semantic HTML and ARIA labels
- Color contrast ratio of at least 4.5:1 for all text
- Focus indicators clearly visible on dark background
- Form inputs properly labeled and associated
- Error messages announced to screen readers
- Alt text for all images and icons

### Branding

**Design System Identity**: "MM Design System"

- **Primary Brand Color**: `#00A1FE` (bright blue) - used for primary buttons, links, active navigation, and chart highlights
- **Dark Theme Colors**:
  - `#1f1f1f` - Main background (mm-dark)
  - `#2a2a2a` - Card/secondary background (mm-dark2)
  - `#ffffff` - Primary text (mm-white)
  - `#ababab` - Secondary/muted text (mm-gray)

- **Typography**:
  - **Headings**: National2Condensed (bold, condensed sans-serif) - creates strong visual hierarchy
  - **Body Text**: ESKlarheit (clean, modern sans-serif) - optimized for readability

- **Signature Elements**:
  - 100px border radius buttons (extremely rounded "pill" shape) for primary actions - distinctive branding element
  - Glass morphism effects on overlay cards (subtle transparency + backdrop blur)
  - Rating tile grids with 0.5 precision (e.g., 5.0-10.0 scale for hotness ratings)
  - Subtle hover effects with color transitions (0.2s fast, 0.3s medium)

- **Component Patterns**:
  - `.btn-mm` - Primary blue buttons with 100px border radius
  - `.btn-secondary` - Outlined buttons with gray border
  - `.card-mm` - Standard dark card with subtle border
  - `.glass-card` - Transparent card with backdrop blur effect
  - `.input-mm` - Dark input fields with blue focus ring

### Target Devices and Platforms

**Platform**: Web Responsive (all devices)

- **Desktop**: Optimized for 1920×1080 and 2560×1440 displays
  - Sidebar navigation (256px width) + top header
  - Multi-column layouts where appropriate
  - Data-dense tables and visualizations

- **Tablet**: Optimized for iPad (1024×768) and similar
  - Collapsed sidebar (icon-only) or hidden sidebar with hamburger menu
  - Top header navigation with full labels
  - Responsive grid that adapts to available width

- **Mobile**: Optimized for iPhone (390×844) and Android phones
  - Bottom navigation bar (fixed position) showing top 4 pages
  - Hamburger menu for additional pages
  - Single-column layouts
  - Touch-optimized interactive elements (minimum 44×44px tap targets)
  - Tables converted to card-based layouts for better mobile viewing

---

## Technical Assumptions

### Repository Structure

**Structure**: Monorepo

**Rationale**: A monorepo with Next.js provides optimal development experience, shared types between frontend/backend, and simplified deployment. Since this is a full-stack web application with shared business logic, keeping everything in one repository reduces complexity.

**Repository Layout**:
```
mm-health-tracker/
├── src/
│   ├── app/                    # Next.js 14 App Router pages
│   │   ├── daily/             # Daily Tracker page
│   │   ├── calories/          # Calories tracking page
│   │   ├── injections/        # Injections page
│   │   ├── nirvana/           # Nirvana Life page
│   │   ├── winners-bible/     # Winners Bible page
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── settings/          # Settings configuration
│   │   ├── bmr-calculator/    # BMR calculator tool
│   │   └── layout.tsx         # Root layout with providers
│   ├── components/            # Reusable React components
│   │   ├── Navigation.tsx     # Sidebar, mobile nav, header
│   │   ├── forms/             # Form components
│   │   ├── charts/            # Chart components (recharts)
│   │   └── ui/                # Base UI components
│   ├── lib/
│   │   ├── supabase/          # Supabase client and utilities
│   │   │   ├── client.ts      # Browser Supabase client
│   │   │   ├── server.ts      # Server-side Supabase client
│   │   │   └── middleware.ts  # Auth middleware
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utility functions
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Shared types (matches DB schema)
│   └── styles/
│       └── globals.css        # MM Design System styles
├── public/
│   └── fonts/                 # National2Condensed, ESKlarheit fonts
��── supabase/
│   ├── migrations/            # Database migration SQL files
│   └── functions/             # Edge Functions (if needed)
├── .env.local                 # Environment variables (Supabase URL/keys)
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

### Service Architecture

**Architecture**: Serverless Monolith (Next.js on Vercel + Supabase Backend)

**Frontend**: Next.js 14+ with App Router
- Server Components for initial page loads (faster performance)
- Client Components for interactive features
- API Routes for server-side business logic when needed

**Backend**: Supabase (Serverless PostgreSQL + Auth + Storage + Realtime)
- PostgreSQL database with automatic scaling
- Row Level Security for data isolation
- Supabase Auth for user management
- Realtime subscriptions for live updates
- Edge Functions for complex server-side logic (if needed)

**Rationale**: This architecture provides:
- Zero devops overhead (Vercel handles frontend, Supabase handles backend)
- Automatic scaling for both frontend and database
- Built-in authentication and real-time capabilities
- Developer-friendly with instant API generation from database schema

### Testing Requirements

**Testing Strategy**: Unit + Integration Testing

**Unit Tests**:
- Utility functions (date formatting, calculation logic)
- React component logic (using React Testing Library)
- Supabase query functions

**Integration Tests**:
- User flows (authentication, creating entries, viewing analytics)
- Database operations with test database
- API route handlers

**Test Tools**:
- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing
- **Playwright** (optional) - E2E tests for critical user journeys

**Coverage Target**: 70% code coverage for core business logic

**CI/CD Integration**: Tests run automatically on push via GitHub Actions before deployment

### Additional Technical Assumptions and Requests

**Technology Stack**:
- **Language**: TypeScript (strict mode enabled)
- **Frontend Framework**: Next.js 14+ (React 18)
- **Styling**: Tailwind CSS 4.0 + Custom MM Design System
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Charts/Visualizations**: Recharts library
- **Icons**: Heroicons (outline and solid variants)
- **Date Handling**: date-fns for timezone-aware date operations
- **HTTP Client**: Native fetch + Supabase client
- **State Management**: React Context API for global state, Zustand for complex client state (if needed)

**Deployment**:
- **Frontend Hosting**: Vercel (automatic deployments from GitHub main branch)
- **Database**: Supabase cloud (free tier supports up to 500MB database, 2GB file storage, 50,000 monthly active users)
- **Environment**: Staging and Production environments (separate Supabase projects)
- **Domain**: Custom domain with SSL (managed by Vercel)

**Authentication Flow**:
- Supabase Auth handles all authentication logic
- JWT tokens stored in httpOnly cookies for security
- Automatic session refresh on token expiration
- Protected routes using Next.js middleware checking auth state

**Database Schema Principles**:
- User ID as primary foreign key across all user data tables
- Timestamps (created_at, updated_at) on all tables via triggers
- Soft deletes where appropriate (deleted_at column)
- Indexes on frequently queried columns (user_id, date, timestamp)
- RLS policies enforcing user data isolation

**Performance Optimizations**:
- Next.js Image component for optimized image loading
- React.memo for expensive component renders
- Supabase query result caching (with invalidation on mutations)
- Lazy loading for analytics charts (only load when tab is viewed)
- Code splitting by route (automatic with Next.js App Router)

**Error Handling**:
- Global error boundary for uncaught React errors
- Toast notifications for user-facing errors
- Detailed error logging to console in development
- Sanitized error messages in production
- Retry logic for failed Supabase queries

---

## Epic List

**Epic 1: Foundation & Core Infrastructure**
Establish project setup, Supabase integration, authentication system, and initial profile management. Deliver a functional authentication flow with user profile creation.

**Epic 2: Daily Tracking Hub & MITs**
Build the Daily Tracker page with MITs (Most Important Things) system, daily weight tracking, and basic navigation. Enable users to track their daily focus tasks and weight.

**Epic 3: Calories & Nutrition Tracking**
Implement comprehensive food logging, macro tracking, exercise logging, and calorie balance calculations. Provide users with complete nutrition management capabilities.

**Epic 4: Injection Management & Compound Tracking**
Create the injection tracking system with compound management, dosage logging, weekly target setting, and progress monitoring.

**Epic 5: Nirvana Life & Winners Bible**
Develop the Nirvana mobility tracking system and Winners Bible motivational image viewer with morning/night completion tracking.

**Epic 6: Analytics & Data Visualization**
Build comprehensive analytics dashboard with multiple views (weight, calories, injections, MITs, weekly reviews) featuring interactive charts and time range filtering.

**Epic 7: Settings & Configuration Management**
Create a centralized settings hub for managing user preferences, targets, compounds, session types, food templates, and data import/export functionality.

---

## Epic 1: Foundation & Core Infrastructure

**Epic Goal**: Establish the foundational Next.js + Supabase project with authentication, user profile management, design system implementation, and core navigation structure. By the end of this epic, users can sign up, log in, configure their health profile, and navigate the application shell.

### Story 1.1: Project Initialization & Supabase Integration

As a **developer**,
I want **to initialize the Next.js project with Supabase integration**,
so that **the foundation is in place for building the application**.

**Acceptance Criteria**:

1. Next.js 14 project created with TypeScript and Tailwind CSS 4.0 configured
2. Supabase project created with development and production environments
3. Supabase client initialized for browser and server contexts
4. Environment variables configured (.env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)
5. MM Design System globals.css file integrated with theme variables and component styles
6. Font files (National2Condensed, ESKlarheit) added to public/fonts/ and loaded via @font-face
7. Project builds successfully and runs on localhost with no errors
8. Basic folder structure created (app/, components/, lib/, types/, styles/)

### Story 1.2: Authentication System Implementation

As a **new user**,
I want **to sign up for an account and log in securely**,
so that **I can access my personal health tracking data**.

**Acceptance Criteria**:

1. Sign up page created with email/password form using Supabase Auth
2. Email verification sent to new users (configurable via Supabase dashboard)
3. Login page created with email/password form
4. "Forgot Password" flow implemented (password reset email link)
5. OAuth integration available for Google and GitHub sign-in (optional but UI prepared)
6. Successful authentication redirects user to Daily Tracker (/daily)
7. Failed authentication displays clear error messages
8. User session persists across page reloads via Supabase auth state
9. Logout functionality clears session and redirects to login page
10. Protected routes middleware checks authentication status and redirects unauthenticated users to login

### Story 1.3: User Profile Schema & Management

As a **authenticated user**,
I want **to create and manage my health profile with BMR, gender, height, and weight**,
so that **the application can personalize calculations and tracking**.

**Acceptance Criteria**:

1. Supabase database table `profiles` created with schema:
   - `id` (UUID, primary key, foreign key to auth.users)
   - `bmr` (INTEGER, not null)
   - `gender` (TEXT, enum: 'male'|'female'|'other')
   - `height` (NUMERIC, in cm)
   - `weight` (NUMERIC, in kg)
   - `timezone` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)
2. RLS policy: Users can only SELECT, UPDATE their own profile row (user_id = auth.uid())
3. First-time user redirected to profile setup wizard after sign-up
4. Profile setup form captures BMR, gender, height, weight, and timezone
5. BMR Calculator link provided for users who don't know their BMR
6. Profile data saved to Supabase `profiles` table via client mutation
7. TypeScript types defined for Profile interface matching database schema
8. Profile data fetched and displayed on Settings page for editing
9. Profile updates save successfully and show confirmation toast notification

### Story 1.4: Core Navigation & Layout Structure

As a **authenticated user**,
I want **to navigate between different pages using a sidebar and mobile bottom navigation**,
so that **I can easily access all features of the application**.

**Acceptance Criteria**:

1. Desktop sidebar navigation component created with:
   - MM logo/brand at top
   - Navigation links for: Daily, Calories, Injections, Nirvana, Winners Bible, Analytics, Settings
   - Icons from Heroicons (outline for inactive, solid for active)
   - Active state styling with mm-blue background
   - Fixed width 256px on desktop
2. Mobile bottom navigation component created with:
   - Fixed position at bottom of viewport
   - 4 primary navigation items (Daily, Calories, Injections, Analytics)
   - Hamburger menu for remaining pages
   - Active state indicator
3. Top header navigation component created for desktop with:
   - Logo on left
   - Horizontal navigation links in center
   - Icon-only buttons on right (Settings, Logout)
4. Navigation components use Next.js Link for client-side routing
5. Active route determined via usePathname() hook
6. Layout wrapper component integrates navigation based on screen size (responsive)
7. All navigation links functional and route to correct pages (even if pages show placeholder content initially)

### Story 1.5: Timezone Configuration & Date Utilities

As a **user**,
I want **to configure my timezone so days change at midnight in my local time**,
so that **my daily tracking accurately reflects my schedule**.

**Acceptance Criteria**:

1. Timezone selector added to profile setup and Settings page
2. Dropdown populated with common timezones (at least 20 major cities/regions)
3. Selected timezone saved to `profiles.timezone` column in Supabase
4. Utility function created to get current date in user's timezone
5. Utility function created to convert UTC timestamps to user's local time
6. Date utilities use date-fns with timezone support (date-fns-tz)
7. All date displays throughout app use user's configured timezone
8. Default timezone set to browser timezone if user hasn't configured one
9. Settings page shows current time in user's selected timezone as preview

---

## Epic 2: Daily Tracking Hub & MITs

**Epic Goal**: Build the Daily Tracker page as the central hub for daily activities, featuring the MITs (Most Important Things) system, weight tracking with BMI calculation, deep work session tracking, and weekly objectives review section (Fridays). Users can manage their daily priorities and track core health metrics.

### Story 2.1: Daily Tracker Page Layout & Date Display

As a **user**,
I want **to see the current date prominently displayed on my Daily Tracker**,
so that **I know which day's data I'm viewing and entering**.

**Acceptance Criteria**:

1. Daily Tracker page created at `/app/daily/page.tsx`
2. Current date displayed prominently at top in user's timezone
3. Date format: "Monday, January 30th, 2025" (full day name, month, ordinal day, year)
4. Page title "Daily Tracker" displayed with MM design system heading styles
5. Page layout uses card-based design with mm-dark background
6. Responsive layout: single column on mobile, multi-column grid on desktop
7. Page accessible via "Daily" link in navigation

### Story 2.2: MITs (Most Important Things) System

As a **user**,
I want **to add up to 3 Most Important Things for each day and mark them complete**,
so that **I can focus on my top priorities and track my daily accomplishments**.

**Acceptance Criteria**:

1. Supabase database table `mits` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `date` (DATE, not null)
   - `title` (TEXT, not null)
   - `completed` (BOOLEAN, default false)
   - `completed_at` (TIMESTAMP, nullable)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own MITs (user_id = auth.uid())
3. Unique constraint: (user_id, date, title) to prevent duplicate MITs
4. Daily Tracker displays "Today's MITs" section with card styling
5. Add MIT form with single text input (placeholder: "What's most important today?")
6. Add button disabled when 3 MITs already exist for the day
7. Each MIT displayed with checkbox and title text
8. Clicking checkbox toggles completed status and saves to Supabase
9. Completed MITs show with strikethrough text and faded appearance
10. Delete button (×) on each MIT to remove it
11. MITs load from Supabase for current date on page load
12. Empty state message displayed when no MITs exist: "Add your first MIT to focus on what matters most today."

### Story 2.3: Daily Weight Tracking with BMI Calculation

As a **user**,
I want **to log my daily weight and see my BMI automatically calculated**,
so that **I can track my weight progress and understand my body composition**.

**Acceptance Criteria**:

1. Supabase database table `daily_entries` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `date` (DATE, not null, unique per user)
   - `weight` (NUMERIC, nullable)
   - `deep_work_completed` (BOOLEAN, default false)
   - `winners_bible_morning` (BOOLEAN, default false)
   - `winners_bible_night` (BOOLEAN, default false)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own daily entries (user_id = auth.uid())
3. Unique constraint: (user_id, date) ensures one entry per day per user
4. "Weight Tracking" card displayed on Daily Tracker
5. Weight input field (number, step 0.1, placeholder "Enter today's weight (kg)")
6. Save button persists weight to `daily_entries.weight` for current date
7. BMI calculation displayed immediately after weight entered using formula: `BMI = weight(kg) / (height(m))²`
8. Height retrieved from user's profile (stored in cm, converted to m for calculation)
9. BMI displayed with 1 decimal precision (e.g., "BMI: 24.2")
10. BMI color-coded: Green (<25), Yellow (25-30), Red (>30)
11. Previously entered weight for the day pre-fills input field on page load
12. Toast notification on successful weight save

### Story 2.4: Deep Work Session Tracking

As a **user**,
I want **to mark when I've completed my deep work session for the day**,
so that **I can track my productivity consistency**.

**Acceptance Criteria**:

1. "Deep Work Session" card displayed on Daily Tracker
2. Large checkbox labeled "Deep Work Session Completed"
3. Checkbox state bound to `daily_entries.deep_work_completed` for current date
4. Clicking checkbox toggles state and saves to Supabase immediately
5. Completed state shows checkmark with green background
6. Incomplete state shows empty checkbox with gray background
7. Checkbox state persists across page reloads
8. If no daily_entry exists for current date, creating one when checkbox toggled

### Story 2.5: Weekly Objectives Review (Friday Feature)

As a **user**,
I want **to see a Weekly Objectives Review section every Friday**,
so that **I can reflect on my week, note accomplishments, and plan ahead**.

**Acceptance Criteria**:

1. Supabase database table `weekly_reviews` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `week_start_date` (DATE, not null) // Monday of the week
   - `review_date` (DATE, not null) // Friday when review created
   - `objectives` (TEXT, nullable)
   - `accomplishments` (TEXT, nullable)
   - `observations` (TEXT, nullable)
   - `next_week_focus` (TEXT, nullable)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own reviews (user_id = auth.uid())
3. Unique constraint: (user_id, week_start_date) ensures one review per week
4. "Weekly Objectives Review" section displayed ONLY on Fridays
5. Section shows prominently with distinct styling (gradient border or highlighted card)
6. Form fields:
   - "This Week's Objectives" (textarea)
   - "Key Accomplishments" (textarea)
   - "Important Observations" (textarea)
   - "Next Week's Focus" (textarea)
7. Save button persists review to Supabase
8. If review already exists for current week, form pre-fills with existing data
9. Success message shown after saving: "Weekly review saved! 🎉"
10. Section hidden on non-Friday days
11. Link to Analytics page to view past weekly reviews

### Story 2.6: Quick Action Cards for Navigation

As a **user**,
I want **to see quick-action cards summarizing my calories, injections, and Nirvana status**,
so that **I can quickly navigate to those sections and see my progress at a glance**.

**Acceptance Criteria**:

1. "Quick Actions" section displayed on Daily Tracker below MITs and weight tracking
2. Three cards displayed in responsive grid (1 column mobile, 3 columns desktop):
   - **Calories Summary Card**
   - **Injections Summary Card**
   - **Nirvana Status Card**
3. **Calories Summary Card** shows:
   - Icon (FireIcon)
   - "Calorie Balance" title
   - Current balance value (e.g., "+450 cal" or "-320 cal")
   - Color-coded: Green (positive), Red (negative)
   - Click navigates to /calories
4. **Injections Summary Card** shows:
   - Icon (BeakerIcon)
   - "Injections This Week" title
   - Count of injections in past 7 days
   - Click navigates to /injections
5. **Nirvana Status Card** shows:
   - Icon (UserIcon)
   - "Nirvana Life" title
   - Session completion indicator (e.g., "2/7 sessions this week")
   - Click navigates to /nirvana
6. Cards styled with hover effects (scale slightly, border color change)
7. Cards use MM design system card-mm class
8. Loading states displayed while data fetches (skeleton loaders)

---

## Epic 3: Calories & Nutrition Tracking

**Epic Goal**: Implement comprehensive calorie and nutrition tracking including food logging with macro breakdowns, exercise logging, food templates for quick entry, macro target tracking with progress visualization, and real-time calorie balance calculations. Users gain complete control over their nutritional intake and energy expenditure.

### Story 3.1: Calories Page Layout & Balance Display

As a **user**,
I want **to see my daily calorie balance calculated automatically**,
so that **I know if I'm in a surplus or deficit for the day**.

**Acceptance Criteria**:

1. Calories page created at `/app/calories/page.tsx`
2. Page title "Calories & Nutrition" with current date
3. Date picker to view historical dates (defaults to today)
4. Prominent calorie balance card displayed at top with formula:
   **Balance = BMR - Total Food Calories + Total Exercise Calories**
5. Balance card shows:
   - BMR value (from user profile)
   - Total calories consumed (sum of food entries)
   - Total calories burned (sum of exercise entries)
   - Net balance with large, bold number
6. Balance color-coded: Green (positive/surplus), Red (negative/deficit)
7. Balance updates in real-time as food/exercise entries added
8. If BMR not set in profile, show warning: "Set your BMR in Settings to see accurate balance."

### Story 3.2: Food Logging with Macro Tracking

As a **user**,
I want **to log food entries with calories and macros (carbs, protein, fat)**,
so that **I can track my nutritional intake precisely**.

**Acceptance Criteria**:

1. Supabase database table `food_entries` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `date` (DATE, not null)
   - `time` (TIME, not null)
   - `name` (TEXT, not null)
   - `calories` (INTEGER, not null)
   - `carbs` (NUMERIC, default 0)
   - `protein` (NUMERIC, default 0)
   - `fat` (NUMERIC, default 0)
   - `created_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own food entries (user_id = auth.uid())
3. Index on (user_id, date) for fast daily queries
4. "Food Log" section on Calories page with table displaying:
   - Time | Food Name | Calories | Carbs (g) | Protein (g) | Fat (g) | Actions
5. "Add Food" form with fields:
   - Name (text input)
   - Calories (number input, required)
   - Carbs (number input, optional)
   - Protein (number input, optional)
   - Fat (number input, optional)
   - Time (time input, defaults to current time)
6. Submit button adds food entry to Supabase and refreshes list
7. Delete button (trash icon) on each table row removes entry
8. Food entries sorted by time (newest first)
9. Total calories, carbs, protein, fat displayed in table footer row (sum of all entries)
10. Empty state message when no food entries: "No food logged yet today. Add your first meal above."
11. Mobile-responsive: Table converts to card layout on small screens

### Story 3.3: Food Templates System

As a **user**,
I want **to create reusable food templates for frequently eaten meals**,
so that **I can quickly log common foods without re-entering macros every time**.

**Acceptance Criteria**:

1. Supabase database table `food_templates` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `name` (TEXT, not null)
   - `calories` (INTEGER, not null)
   - `carbs` (NUMERIC, default 0)
   - `protein` (NUMERIC, default 0)
   - `fat` (NUMERIC, default 0)
   - `created_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own templates (user_id = auth.uid())
3. "Add Food" form on Calories page includes template selector dropdown
4. Dropdown shows: "Quick Add Template" with list of user's saved templates
5. Selecting a template auto-fills form fields (name, calories, carbs, protein, fat)
6. User can still edit auto-filled values before submitting
7. Template management UI in Settings page (covered in Epic 7)
8. At least 5 templates supported per user initially

### Story 3.4: Exercise Logging & Calorie Burn

As a **user**,
I want **to log exercise activities with duration and calories burned**,
so that **my calorie balance accounts for my physical activity**.

**Acceptance Criteria**:

1. Supabase database table `exercise_entries` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `date` (DATE, not null)
   - `time` (TIME, not null)
   - `activity` (TEXT, not null)
   - `duration_minutes` (INTEGER, not null)
   - `calories_burned` (INTEGER, not null)
   - `created_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own exercise entries (user_id = auth.uid())
3. Index on (user_id, date) for fast daily queries
4. "Exercise Log" section on Calories page with table displaying:
   - Time | Activity | Duration (min) | Calories Burned | Actions
5. "Add Exercise" form with fields:
   - Activity name (text input, e.g., "Running", "Weight Training")
   - Duration (number input, minutes)
   - Calories burned (number input)
   - Time (time input, defaults to current time)
6. Submit button adds exercise entry to Supabase and refreshes list
7. Delete button (trash icon) on each table row removes entry
8. Exercise entries sorted by time (newest first)
9. Total duration and calories burned displayed in table footer
10. Empty state message when no exercise entries: "No exercise logged today. Add your workout above."
11. Exercise calories automatically added to calorie balance calculation in real-time

### Story 3.5: Macro Targets & Progress Visualization

As a **user**,
I want **to set daily macro targets and see my progress toward them**,
so that **I can ensure I'm meeting my nutritional goals (e.g., hitting protein target)**.

**Acceptance Criteria**:

1. Supabase database table `macro_targets` created with schema:
   - `user_id` (UUID, primary key, foreign key to auth.users)
   - `daily_calories` (INTEGER, nullable)
   - `daily_carbs` (NUMERIC, nullable)
   - `daily_protein` (NUMERIC, nullable)
   - `daily_fat` (NUMERIC, nullable)
   - `updated_at` (TIMESTAMP)
2. RLS policy: Users can SELECT, UPDATE only their own targets (user_id = auth.uid())
3. "Macro Targets" section on Calories page displays 4 progress bars:
   - Calories: [Progress bar] 1800 / 2200 cal (82%)
   - Carbs: [Progress bar] 150 / 200g (75%)
   - Protein: [Progress bar] 120 / 150g (80%)
   - Fat: [Progress bar] 50 / 70g (71%)
4. Progress bars color-coded:
   - Green: 90-110% of target (on track)
   - Yellow: 70-89% or 111-120% (close)
   - Red: <70% or >120% (significantly over/under)
5. Actual values calculated from sum of food_entries for current date
6. Targets editable in Settings page (covered in Epic 7)
7. If no targets set, progress section shows message: "Set your macro targets in Settings to track progress."
8. Progress bars use Tailwind CSS or custom styled divs (no external library required)

---

## Epic 4: Injection Management & Compound Tracking

**Epic Goal**: Create a comprehensive injection tracking system allowing users to log injections of various compounds, set weekly dosage targets, monitor adherence, and analyze injection patterns. Users can manage their medication/supplement injection schedules with precision.

### Story 4.1: Injection Compounds Configuration

As a **user**,
I want **to manage a list of compounds I inject**,
so that **I can quickly select from my compounds when logging injections**.

**Acceptance Criteria**:

1. Supabase database table `compounds` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `name` (TEXT, not null)
   - `created_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own compounds (user_id = auth.uid())
3. Unique constraint: (user_id, name) prevents duplicate compound names per user
4. Compound management UI in Settings page (Epic 7)
5. Default compounds seeded for new users: ["Ipamorellin", "Retatrutide", "Testosterone"]
6. Compounds used as options in injection logging dropdown

### Story 4.2: Injection Logging with Details

As a **user**,
I want **to log injections with compound, dosage, unit, date, time, and optional notes**,
so that **I have a detailed record of all my injections**.

**Acceptance Criteria**:

1. Supabase database table `injections` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `compound` (TEXT, not null)
   - `dosage` (NUMERIC, not null)
   - `unit` (TEXT, not null) // mg, ml, mcg, IU
   - `date` (DATE, not null)
   - `time` (TIME, not null)
   - `notes` (TEXT, nullable)
   - `created_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own injections (user_id = auth.uid())
3. Index on (user_id, date) for fast queries
4. Injections page created at `/app/injections/page.tsx`
5. "Add Injection" form displayed prominently with fields:
   - Compound (dropdown from user's compounds list)
   - Dosage (number input, step 0.1)
   - Unit (dropdown: mg, ml, mcg, IU)
   - Date (date picker, defaults to today)
   - Time (time input, defaults to current time)
   - Notes (text input, optional)
6. Submit button adds injection to Supabase and refreshes list
7. "Injection History" table displays:
   - Date | Time | Compound | Dosage + Unit | Notes | Actions
8. Delete button (trash icon) removes injection
9. Table sorted by timestamp (newest first)
10. Empty state message: "No injections logged yet. Add your first injection above."

### Story 4.3: Injection History Filtering

As a **user**,
I want **to filter my injection history by time range and compound**,
so that **I can focus on specific compounds or recent injections**.

**Acceptance Criteria**:

1. Time range filter dropdown on Injections page with options:
   - 3 Days
   - 7 Days (default)
   - 30 Days
   - 60 Days
   - 90 Days
   - All Time
2. Compound filter dropdown with options:
   - All Compounds (default)
   - [List of user's compounds]
   - Custom (compounds not in user's predefined list)
3. Injection history table updates immediately when filters changed
4. Filter state persists during session (stored in React state, not URL or database)
5. Statistics cards update based on filtered results
6. "Showing X injections" message displays filtered count

### Story 4.4: Weekly Injection Targets & Progress Tracking

As a **user**,
I want **to set weekly dosage targets for each compound and see my progress**,
so that **I can ensure I'm following my prescribed injection protocol**.

**Acceptance Criteria**:

1. Supabase database table `injection_targets` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `compound` (TEXT, not null)
   - `dose_amount` (NUMERIC, not null) // Single injection dose
   - `frequency` (INTEGER, not null) // Times per week
   - `unit` (TEXT, not null)
   - `enabled` (BOOLEAN, default true)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own targets (user_id = auth.uid())
3. Calculated weekly target: `weekly_target = dose_amount × frequency`
4. "Weekly Dosage Analysis" section on Injections page displays cards for each compound with target set
5. Each card shows:
   - Compound name
   - Target: `150mg/week` (weekly_target + unit)
   - Actual: `120mg` (sum of injections in last 7 days)
   - Progress: `80%` (actual / target × 100)
   - Injection count: `4/5` (actual injection count / frequency)
   - Status icon: ✓ Green (90-110%), ⚠️ Yellow (70-89% or 111-130%), ❌ Red (<70% or >130%)
6. Actual dosage calculated from injections in last 7 rolling days (not calendar week)
7. Cards color-coded by progress status
8. Target management in Settings page (Epic 7)
9. Empty state: "Set injection targets in Settings to track weekly progress."

### Story 4.5: Injection Statistics Overview

As a **user**,
I want **to see high-level statistics about my injection history**,
so that **I can quickly understand my injection patterns**.

**Acceptance Criteria**:

1. Statistics cards section displayed on Injections page (above history table)
2. Four cards displayed in responsive grid:
   - **Total Injections** (count based on current time filter)
   - **Compounds Tracked** (unique compound count)
   - **This Week** (injection count in last 7 days, regardless of filter)
   - **Last Injection** (date and compound of most recent injection)
3. Each card includes:
   - Icon (BeakerIcon with different colors)
   - Metric value (large, bold number)
   - Label describing metric
4. Cards styled with MM design system card-mm class
5. Statistics update in real-time as injections added/removed
6. Statistics reflect filtered data (except "This Week" and "Last Injection" which are always absolute)

---

## Epic 5: Nirvana Life & Winners Bible

**Epic Goal**: Develop the Nirvana mobility/gymnastics tracking system and Winners Bible motivational image viewer. Users can track their physical training sessions, manage custom session types, and engage with a daily motivational routine using their own images.

### Story 5.1: Nirvana Session Tracking System

As a **user**,
I want **to log completion of Nirvana Life training sessions with different session types**,
so that **I can track my consistency with mobility and gymnastics practice**.

**Acceptance Criteria**:

1. Supabase database table `nirvana_sessions` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `date` (DATE, not null)
   - `session_type` (TEXT, not null)
   - `completed` (BOOLEAN, default true)
   - `completed_at` (TIMESTAMP, not null)
   - `created_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own sessions (user_id = auth.uid())
3. Index on (user_id, date) for fast queries
4. Nirvana page created at `/app/nirvana/page.tsx`
5. Page title "Nirvana Life" with current date
6. "Today's Session" card displays:
   - Session type dropdown (populated from user's configured session types)
   - "Mark Session Complete" button
7. Clicking button logs session to Supabase with current timestamp
8. Success message displayed: "Nirvana session completed! 🎉"
9. Session history section displays past 7 days of sessions with:
   - Date | Session Type | Completed checkmark
10. Empty state: "No sessions logged yet. Complete your first Nirvana session today!"

### Story 5.2: Nirvana Session Types Configuration

As a **user**,
I want **to configure custom session types for Nirvana tracking**,
so that **I can track different types of mobility or gymnastics practices**.

**Acceptance Criteria**:

1. Supabase database table `nirvana_session_types` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `name` (TEXT, not null)
   - `created_at` (TIMESTAMP)
2. RLS policy: Users can CRUD only their own session types (user_id = auth.uid())
3. Unique constraint: (user_id, name) prevents duplicate session type names
4. Default session types seeded for new users:
   - "Mobility Flow"
   - "Handstand Practice"
   - "Flexibility Training"
   - "Strength Conditioning"
5. Session type management UI in Settings page (Epic 7)
6. Session types populate dropdown on Nirvana page for session logging
7. Users can add/remove session types freely

### Story 5.3: Winners Bible Image Management

As a **user**,
I want **to upload up to 15 motivational images to my Winners Bible**,
so that **I have a personalized collection of images that inspire me daily**.

**Acceptance Criteria**:

1. Supabase Storage bucket `winners-bible-images` created with RLS policies:
   - Users can upload to their own user_id folder only
   - Users can view only their own images
   - Max file size: 5MB per image
2. Supabase database table `winners_bible_images` created with schema:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users, not null)
   - `storage_path` (TEXT, not null) // Path in Supabase Storage
   - `file_name` (TEXT, not null)
   - `file_size` (INTEGER, not null)
   - `mime_type` (TEXT, not null)
   - `order` (INTEGER, default 0) // Display order
   - `created_at` (TIMESTAMP)
3. RLS policy: Users can CRUD only their own image records (user_id = auth.uid())
4. Image upload UI in Settings page (Epic 7) with:
   - "Upload Images" button (accepts multiple files)
   - File type validation: PNG, JPG, JPEG only
   - File size validation: Max 5MB per file
   - Image grid showing uploaded images (thumbnail view)
   - Delete button on each image
   - Maximum 15 images enforced (upload button disabled at limit)
5. Images uploaded to Supabase Storage with path: `{user_id}/{image_id}.{ext}`
6. Metadata saved to `winners_bible_images` table
7. Upload progress indicator shown
8. Success/error messages for uploads

### Story 5.4: Winners Bible Full-Screen Viewer

As a **user**,
I want **to view my Winners Bible images in a full-screen slideshow with navigation**,
so that **I can engage with my motivational images as part of my daily routine**.

**Acceptance Criteria**:

1. Winners Bible page created at `/app/winners-bible/page.tsx`
2. Full-screen image viewer displaying current image:
   - Image fills viewport (max-width/max-height: 100%, object-fit: contain)
   - Dark background (black or mm-dark)
3. Navigation controls:
   - Left arrow button (previous image)
   - Right arrow button (next image)
   - Keyboard navigation: Arrow keys to navigate, Escape to exit (if modal)
4. Image indicator dots at bottom center:
   - One dot per image
   - Active dot highlighted (mm-blue color)
   - Clicking dot jumps to that image
5. "Image X of Y" counter displayed
6. If only 1 image, navigation arrows hidden
7. Smooth transitions between images (fade or slide animation)
8. Empty state: "No images in your Winners Bible. Upload images in Settings."
9. Images load from Supabase Storage with signed URLs for security

### Story 5.5: Winners Bible Morning & Night Viewing Tracker

As a **user**,
I want **to mark when I've viewed my Winners Bible in the morning and evening**,
so that **I can track my consistency with this motivational routine**.

**Acceptance Criteria**:

1. Column `winners_bible_morning` (BOOLEAN) and `winners_bible_night` (BOOLEAN) already exist in `daily_entries` table (from Story 2.3)
2. Winners Bible page displays two buttons below the image viewer:
   - "Mark Morning Viewed" (SunIcon, yellow color)
   - "Mark Night Viewed" (MoonIcon, blue color)
3. Clicking button updates corresponding column in `daily_entries` for current date
4. Button disabled and shows checkmark when already marked for the day
5. Button states:
   - Not viewed: Solid color, enabled
   - Viewed: Green background, checkmark icon, disabled
6. Header displays viewing status:
   - "Morning ✓" (green if complete, gray if not)
   - "Night ✓" (green if complete, gray if not)
7. Viewing status displayed on Daily Tracker quick-action card
8. Viewing status tracked for analytics (covered in Epic 6)

---

## Epic 6: Analytics & Data Visualization

**Epic Goal**: Build a comprehensive analytics dashboard providing visual insights into weight progress, calorie balance trends, injection consistency, MIT completion rates, and weekly review history. Users can analyze their health data across multiple time ranges with interactive charts and statistical summaries.

### Story 6.1: Analytics Page Structure & Navigation

As a **user**,
I want **to navigate between different analytics views using tabs**,
so that **I can easily explore various aspects of my health data**.

**Acceptance Criteria**:

1. Analytics page created at `/app/analytics/page.tsx`
2. Page title "Analytics Dashboard"
3. Tab navigation component with 5 tabs:
   - Weight Progress
   - Calorie Balance
   - Injection Consistency
   - MIT Completion
   - Weekly Reviews
4. Active tab highlighted with mm-blue underline or background
5. Tab content area displays selected view below tabs
6. Time range filter selector (3/7/30/60/90 days, All Time) positioned prominently
7. Selected time range applies to all analytics views
8. Time range state persists across tab switches during session
9. Loading states displayed while data fetches

### Story 6.2: Weight Progress Visualization

As a **user**,
I want **to see my weight over time in a line chart**,
so that **I can visualize trends and progress toward my goals**.

**Acceptance Criteria**:

1. Weight Progress tab displays line chart using Recharts library
2. X-axis: Date (formatted as "Jan 30" or similar short format)
3. Y-axis: Weight (kg)
4. Line color: mm-blue (#00A1FE)
5. Data points marked with circles
6. Hover tooltip shows exact date and weight value
7. Chart responsive: Full width on mobile, constrained on desktop
8. Data fetched from `daily_entries.weight` for user within selected time range
9. Statistics cards displayed above chart:
   - Current Weight
   - Starting Weight (first weight in time range)
   - Change (+/- difference)
   - Average Weight
10. If no weight data available, show message: "No weight data yet. Log your weight on the Daily Tracker."
11. Chart adapts Y-axis scale to data range (e.g., 65-75kg, not 0-100kg)

### Story 6.3: Calorie Balance Trend Analysis

As a **user**,
I want **to see my daily calorie balance over time in a chart**,
so that **I can identify patterns of surplus and deficit days**.

**Acceptance Criteria**:

1. Calorie Balance tab displays bar chart using Recharts library
2. X-axis: Date
3. Y-axis: Calorie balance (positive and negative values)
4. Bars color-coded: Green (positive balance), Red (negative balance)
5. Zero line clearly marked on Y-axis
6. Hover tooltip shows date and exact balance value
7. Data calculated per day: `Balance = BMR - Total Food Calories + Exercise Calories`
8. Statistics cards displayed above chart:
   - Average Daily Balance
   - Total Surplus Days (count)
   - Total Deficit Days (count)
   - Largest Surplus
   - Largest Deficit
9. If insufficient data (no food/exercise logs), show message: "Start logging food and exercise to see calorie balance trends."
10. Chart scrollable if data exceeds viewport width (especially for long time ranges)

### Story 6.4: Injection Consistency Heat Map

As a **user**,
I want **to see my injection consistency visualized as a heat map or calendar view**,
so that **I can identify patterns and gaps in my injection schedule**.

**Acceptance Criteria**:

1. Injection Consistency tab displays calendar-style heat map
2. Each day represented as a square/cell colored by injection count:
   - No injections: Gray
   - 1 injection: Light blue
   - 2 injections: Medium blue
   - 3+ injections: Dark blue
3. Hover tooltip shows date and injection count + compound names
4. Date range limited to 90 days max for readability (override time filter if needed)
5. Statistics cards displayed:
   - Total Injections
   - Most Consistent Compound (highest frequency)
   - Average Injections per Week
   - Longest Streak (consecutive days with injections)
6. Optional: Bar chart showing injections per compound (count)
7. If no injection data, show message: "Start logging injections to see consistency patterns."

### Story 6.5: MIT Completion Rate Statistics

As a **user**,
I want **to see my MIT completion rate over time**,
so that **I can track how consistently I'm accomplishing my daily priorities**.

**Acceptance Criteria**:

1. MIT Completion tab displays completion statistics
2. Line chart showing completion percentage over time:
   - X-axis: Date
   - Y-axis: Completion % (0-100%)
   - Completion % calculated per day: `(completed MITs / total MITs) × 100`
3. Only include days where MITs were created (skip days with zero MITs)
4. Statistics cards displayed:
   - Overall Completion Rate (%)
   - Total MITs Created
   - Total MITs Completed
   - Current Streak (consecutive days with 100% completion)
   - Best Streak
5. Completion rate color-coded: Green (≥80%), Yellow (50-79%), Red (<50%)
6. If no MIT data, show message: "Add MITs to your Daily Tracker to see completion trends."

### Story 6.6: Weekly Reviews Archive & Search

As a **user**,
I want **to browse and search my past weekly reviews**,
so that **I can reflect on my progress and revisit previous insights**.

**Acceptance Criteria**:

1. Weekly Reviews tab displays list of all past weekly reviews
2. Each review card shows:
   - Week dates (e.g., "Week of Jan 22-28, 2025")
   - Review date (Friday when created)
   - Objectives snippet (first 100 chars)
   - "View Full Review" expand button
3. Clicking expand reveals full review content:
   - This Week's Objectives
   - Key Accomplishments
   - Important Observations
   - Next Week's Focus
4. Reviews sorted by date (newest first)
5. Search box filters reviews by keyword match in any field
6. Date range filter applies to review creation date
7. Empty state: "No weekly reviews yet. Complete your first review on a Friday!"
8. Export button to download all reviews as JSON or text file

---

## Epic 7: Settings & Configuration Management

**Epic Goal**: Create a centralized Settings hub where users can manage all application preferences, configurations, and data. This includes profile settings, timezone, macro targets, injection compounds and targets, Nirvana session types, food templates, Winners Bible images, Daily Tracker feature toggles, and data import/export functionality.

### Story 7.1: Settings Page Layout & Profile Settings

As a **user**,
I want **to edit my profile settings (BMR, gender, height, weight)**,
so that **the application calculations remain accurate as my body changes**.

**Acceptance Criteria**:

1. Settings page created at `/app/settings/page.tsx`
2. Page title "Settings"
3. Card-based layout with multiple sections
4. "Profile Settings" card displayed first with icon (UserIcon)
5. Form fields for editing:
   - BMR (number input) with link to BMR Calculator
   - Gender (dropdown: Male, Female, Other)
   - Height (number input, cm)
   - Weight (number input, kg)
6. Save button updates `profiles` table in Supabase
7. Success toast notification on save: "Profile updated successfully!"
8. Validation: All fields required except weight (weight tracked separately on Daily page)
9. Current values pre-filled from user's profile on page load
10. First-time users see welcome banner: "Welcome! Complete your profile to get started."

### Story 7.2: Timezone Configuration

As a **user**,
I want **to set my timezone in Settings**,
so that **all dates and times display correctly for my location**.

**Acceptance Criteria**:

1. "Timezone Settings" card displayed on Settings page with icon (CalendarDaysIcon)
2. Timezone dropdown with at least 20 major timezones:
   - America/New_York
   - America/Los_Angeles
   - America/Chicago
   - America/Denver
   - Europe/London
   - Europe/Paris
   - Asia/Tokyo
   - Asia/Shanghai
   - Australia/Sydney
   - (Additional major cities)
3. Dropdown shows user-friendly labels: "Eastern Time (New York)"
4. Selected timezone saved to `profiles.timezone`
5. Current time preview displayed in selected timezone: "Current time: 2:30 PM EST"
6. Info message: "Days will change at midnight in your selected timezone for accurate daily tracking."
7. Auto-save on selection change (no separate Save button needed)

### Story 7.3: Macro Targets Configuration

As a **user**,
I want **to set my daily macro targets in Settings**,
so that **the Calories page shows my progress toward these goals**.

**Acceptance Criteria**:

1. "Macro Targets" card displayed on Settings page with icon (FireIcon)
2. Form fields for setting targets:
   - Daily Calorie Target (number input)
   - Carbs Target (number input, grams)
   - Protein Target (number input, grams)
   - Fat Target (number input, grams)
3. All fields optional (can set calories only, or full macros)
4. Save button updates `macro_targets` table
5. Auto-save on blur (save when user leaves input field) for convenience
6. Info banner: "Your macro targets will appear on your Calories page to track daily progress."
7. Current targets pre-filled from database
8. Validation: All values must be positive numbers if provided

### Story 7.4: Injection Compounds Management

As a **user**,
I want **to add and remove injection compounds from my list**,
so that **I only see relevant compounds when logging injections**.

**Acceptance Criteria**:

1. "Injection Compounds" card displayed on Settings page with icon (BeakerIcon)
2. Current compounds list displayed as pills/tags with delete buttons (×)
3. "Add Compound" input field with submit button
4. Clicking submit adds new compound to `compounds` table
5. Duplicate compound names prevented (validation + unique constraint)
6. Clicking (×) on compound pill removes compound from database
7. Warning if removing compound that has associated injection data:
   - Modal dialog: "This compound has injection records. Deleting it may affect your history. Continue?"
   - Confirm/Cancel buttons
8. Deletion cascades appropriately (or soft delete to preserve history)
9. Empty state: "No compounds yet. Add your first compound above."
10. Default compounds ("Ipamorellin", "Retatrutide", "Testosterone") seeded for new users

### Story 7.5: Injection Targets Management

As a **user**,
I want **to set weekly dosage targets for each compound**,
so that **I can track my adherence to prescribed injection protocols**.

**Acceptance Criteria**:

1. "Injection Targets" card displayed on Settings page with icon (BeakerIcon, different color)
2. List of current targets displayed with:
   - Compound name
   - Dose amount + unit
   - Frequency per week
   - Calculated weekly target (dose × frequency)
   - Enable/Disable toggle
   - Edit and Delete buttons
3. "Add New Target" button opens form modal:
   - Compound (dropdown from user's compounds)
   - Dose Amount (number input, step 0.1)
   - Unit (dropdown: mg, ml, mcg, IU)
   - Frequency per Week (number input, 1-7)
4. Weekly target preview displayed: "2.5mg × 5/week = 12.5mg weekly"
5. Save button adds target to `injection_targets` table
6. Edit button opens same modal with pre-filled values
7. Delete button removes target (with confirmation)
8. Enable/Disable toggle sets `enabled` field (inactive targets don't show on Injections page but remain in database)
9. Empty state: "No injection targets set. Add targets to track weekly progress."

### Story 7.6: Nirvana Session Types Management

As a **user**,
I want **to manage my custom Nirvana session types**,
so that **I can track different types of mobility and gymnastics practices**.

**Acceptance Criteria**:

1. "Nirvana Session Types" card displayed on Settings page with icon (SparklesIcon)
2. Current session types displayed as list with delete buttons
3. "Add Session Type" input field with submit button
4. Adding session type saves to `nirvana_session_types` table
5. Duplicate session type names prevented
6. Deleting session type removes from database
7. Info message: "These session types will appear as options on your Nirvana tracking page."
8. Default session types seeded for new users (Mobility Flow, Handstand Practice, etc.)
9. Empty state: "No session types configured. Add your first type above."

### Story 7.7: Food Templates Management

As a **user**,
I want **to create and manage food templates for frequently eaten meals**,
so that **I can quickly log common foods on the Calories page**.

**Acceptance Criteria**:

1. "Food Templates" card displayed on Settings page with icon (FireIcon)
2. Current templates displayed in list/table with:
   - Template name
   - Calories
   - Carbs (g)
   - Protein (g)
   - Fat (g)
   - Delete button
3. "Add Template" button opens form modal:
   - Name (text input)
   - Calories (number input, required)
   - Carbs (number input, optional)
   - Protein (number input, optional)
   - Fat (number input, optional)
4. Save button adds template to `food_templates` table
5. Delete button removes template (with confirmation)
6. Templates immediately available in Calories page template dropdown
7. Empty state: "No food templates yet. Create templates for meals you eat regularly."
8. Limit: 50 templates per user (prevents database bloat)

### Story 7.8: Winners Bible Image Management

As a **user**,
I want **to upload, view, and delete Winners Bible motivational images**,
so that **I can curate my personal collection of inspiring images**.

**Acceptance Criteria**:

1. "Winners Bible" card displayed on Settings page with icon (PhotoIcon)
2. Image grid displaying current uploaded images (thumbnails)
3. "Upload Images" button opens file picker:
   - Multiple file selection enabled
   - File type filter: PNG, JPG, JPEG only
   - File size validation: Max 5MB per file
4. Images uploaded to Supabase Storage bucket `winners-bible-images`
5. Image metadata saved to `winners_bible_images` table
6. Upload progress indicator shown during upload
7. Maximum 15 images enforced (upload button disabled at limit)
8. Counter displayed: "Images: 8/15"
9. Delete button (× icon) on each image thumbnail
10. Confirmation dialog before deletion: "Delete this image? This cannot be undone."
11. Deleted images removed from Supabase Storage and database
12. Empty state: "No images uploaded yet. Upload your first motivational image."
13. Info message: "View your Winners Bible on the Winners Bible page as part of your daily routine."

### Story 7.9: Daily Tracker Settings & Feature Toggles

As a **user**,
I want **to customize which features appear on my Daily Tracker**,
so that **I can focus on the metrics most relevant to me**.

**Acceptance Criteria**:

1. "Daily Tracker Settings" card displayed on Settings page with icon (CalendarDaysIcon)
2. Toggle switches for enabling/disabling features:
   - Weight Tracking (default: enabled)
   - Deep Work Sessions (default: enabled)
   - Custom Metrics (default: disabled)
3. If "Custom Metrics" enabled, sub-options appear:
   - Sleep Hours (number metric)
   - Mood Rating (1-10 scale)
   - Energy Level (1-10 scale)
   - Water Intake (number metric, glasses)
4. Each custom metric has its own enable/disable toggle
5. Settings saved to database (new table or JSON column in profiles)
6. Daily Tracker page respects these settings and shows/hides features accordingly
7. Info message: "Control which metrics appear on your Daily Tracker page."

### Story 7.10: Data Export, Import, and Management

As a **user**,
I want **to export all my health data as a backup and import data to restore**,
so that **I can protect against data loss and migrate between accounts if needed**.

**Acceptance Criteria**:

1. "Data Management" card displayed on Settings page with icon (DocumentArrowDownIcon)
2. **Export Data** section:
   - "Export All Data" button
   - Clicking generates JSON file with all user data:
     - Profile
     - Daily entries (MITs, weight, deep work, Winners Bible status)
     - Food entries
     - Exercise entries
     - Injections
     - Nirvana sessions
     - Compounds
     - Injection targets
     - Food templates
     - Nirvana session types
     - Weekly reviews
   - Filename: `mm-health-data-{date}.json`
   - Browser downloads file automatically
3. **Import Data** section:
   - File input accepting .json files
   - User selects previously exported JSON file
   - System validates file format
   - Data imported and merged with existing data (no duplicates based on timestamps/IDs)
   - Success message: "Data imported successfully! X records added."
   - Error handling for invalid JSON or schema mismatches
4. **Clear All Data** section:
   - "Clear All Data" button styled in red (destructive action)
   - Clicking shows confirmation modal:
     - Warning: "This will permanently delete ALL your health tracking data including: injections, calories, MITs, profile, etc."
     - "This action cannot be undone!" highlighted
     - "Yes, Clear Everything" (red) and "Cancel" buttons
   - Confirming deletes all user data from all tables (cascading delete via foreign keys)
   - User redirected to profile setup after data cleared
5. Info message: "Export your data regularly as a backup. Import data to restore from a backup file."

---

## Checklist Results Report

**PRD Completeness Checklist**: *(To be executed by Product Owner)*

- [ ] All epics deliver clear, end-to-end user value
- [ ] Stories are logically sequential within each epic
- [ ] Acceptance criteria are specific, measurable, and testable
- [ ] UI/UX requirements clearly defined for all user-facing features
- [ ] Database schema designed with RLS policies for data isolation
- [ ] No references to local storage (100% Supabase-native)
- [ ] Real-time calculation logic documented
- [ ] Multi-user authentication and authorization specified
- [ ] Responsive design requirements included
- [ ] Analytics and visualization requirements complete
- [ ] Data export/import functionality specified
- [ ] Error handling and validation requirements included
- [ ] Performance and scalability considerations addressed
- [ ] Accessibility requirements (WCAG AA) specified

**Technical Assumptions Validated**:
- [x] Supabase as exclusive backend (PostgreSQL + Auth + Storage + Realtime)
- [x] Next.js 14+ with App Router for frontend
- [x] TypeScript strict mode for type safety
- [x] Tailwind CSS 4.0 + MM Design System for styling
- [x] Recharts for data visualization
- [x] Vercel for deployment and hosting

---

## Next Steps

### UX Expert Prompt

**Prompt for UX/Design Architect**:

> "Please review the Life OS PRD and create comprehensive UI/UX specifications. Focus on:
>
> 1. **Design System Implementation Guide**: Detailed specifications for the MM Design System including component library, color usage guidelines, typography hierarchy, spacing system, and responsive breakpoints.
>
> 2. **High-Fidelity Wireframes/Mockups**: For all core screens (Daily Tracker, Calories, Injections, Nirvana, Winners Bible, Analytics, Settings, BMR Calculator).
>
> 3. **Interaction Design Specifications**: Detailed interaction patterns for forms, modals, navigation transitions, real-time updates, and touch gestures (mobile).
>
> 4. **Data Visualization Guidelines**: Chart types, color schemes, tooltip designs, and responsive chart behaviors for the Analytics dashboard.
>
> 5. **Accessibility Implementation Guide**: Specific WCAG AA compliance strategies, keyboard navigation flows, screen reader considerations, and focus management patterns.
>
> Please use this PRD as the authoritative source for all functional requirements and user flows. Deliver the UI/UX specifications in a format ready for handoff to the Frontend Architect."

### Architect Prompt

**Prompt for Technical Architect**:

> "Please review the Life OS PRD and create a comprehensive technical architecture specification. Focus on:
>
> 1. **Database Schema Design**: Complete PostgreSQL schema with tables, columns, data types, foreign keys, indexes, and Row Level Security (RLS) policies. Ensure proper normalization and query optimization.
>
> 2. **Supabase Integration Architecture**: Client configuration (browser/server), authentication flows, real-time subscription patterns, storage bucket policies, and edge function requirements (if any).
>
> 3. **Next.js Application Architecture**: Directory structure, routing strategy (App Router), server vs client components, API routes, middleware for auth, and state management approach.
>
> 4. **Data Flow & Business Logic**: Calculation implementations (BMR, calorie balance, BMI, macro percentages, injection progress), real-time update mechanisms, and data synchronization patterns.
>
> 5. **Security & Performance**: Authentication token handling, RLS policy enforcement, query optimization strategies, caching approach, and error handling patterns.
>
> 6. **Testing Strategy**: Unit test structure, integration test approach, E2E test critical paths, and CI/CD pipeline configuration.
>
> Please use this PRD as the definitive source for all functional requirements, technical assumptions, and user stories. Deliver a technical architecture document ready for developer implementation with clear, actionable specifications."

---

## Appendix A: Modular Habits & Lifestyle System

### Overview

The Modular Habits & Lifestyle Tracking System (FR26) provides a future-proof architecture for expanding the application's tracking capabilities without modifying core functional requirements. This appendix defines the module framework, data model, and initial module categories for reference purposes.

### Module Framework Architecture

**Core Principles**:
1. **Schema-Driven**: Modules are defined as database records, not hardcoded features
2. **User-Controlled**: Users toggle modules on/off in Settings; only enabled modules appear in Daily Tracker
3. **Type-Safe**: Each module has a defined data type (binary, counter, goal-based) determining UI and validation
4. **Analytics-Integrated**: All module data automatically flows into Analytics Dashboard for trend analysis
5. **Extensible**: New modules added via database seeding, no code changes required for expansion

### Database Schema Design

**Table: `lifestyle_modules`** (System-wide module definitions)
```sql
- id (UUID, primary key)
- name (TEXT, unique) -- e.g., "Meditation"
- description (TEXT) -- User-facing description
- category (TEXT) -- Health, Fitness, Mindset, Social, Productivity, Finance, Spiritual
- data_type (ENUM: 'binary', 'counter', 'goal-based')
- unit (TEXT, nullable) -- e.g., "glasses", "hours", "minutes", null for binary
- icon_name (TEXT) -- Heroicon name for UI
- default_goal (NUMERIC, nullable) -- Default target for goal-based modules
- sort_order (INTEGER) -- Display order in Settings
- is_active (BOOLEAN, default true) -- System-level enable/disable
- created_at (TIMESTAMP)
```

**Table: `user_module_settings`** (User preferences)
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key to auth.users, not null)
- module_id (UUID, foreign key to lifestyle_modules, not null)
- enabled (BOOLEAN, default false)
- custom_goal (NUMERIC, nullable) -- User's personal goal override
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE constraint: (user_id, module_id)
- RLS: Users can CRUD only their own settings
```

**Table: `module_entries`** (Daily tracking data)
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key to auth.users, not null)
- module_id (UUID, foreign key to lifestyle_modules, not null)
- date (DATE, not null)
- value (NUMERIC) -- For counter/goal-based: numeric value; For binary: 1 (yes) or 0 (no)
- completed (BOOLEAN) -- For goal-based: true if value >= goal
- notes (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE constraint: (user_id, module_id, date)
- RLS: Users can CRUD only their own entries
- Index: (user_id, module_id, date)
```

### Module Data Types

**1. Binary Modules** (Yes/No Tracking)
- **UI**: Single checkbox or toggle button
- **Data Storage**: `value = 1` (completed) or `0` (not completed)
- **Analytics**: Streak tracking, completion percentage, calendar heat map
- **Examples**: Meditation completed, morning cold shower, journaling done, fasted today

**2. Counter Modules** (Numeric Tracking)
- **UI**: Number input field with +/- buttons
- **Data Storage**: `value = numeric count`
- **Analytics**: Daily totals, averages, line charts, trend analysis
- **Examples**: Glasses of water (8), hours of sleep (7.5), servings of vegetables (5), social interactions (3)

**3. Goal-Based Modules** (Target Achievement)
- **UI**: Number input + progress bar showing actual vs goal
- **Data Storage**: `value = actual amount`, `completed = true/false` (value >= goal)
- **Goal Source**: `custom_goal` from user_module_settings, or `default_goal` from lifestyle_modules
- **Analytics**: Goal achievement rate, streak tracking, progress over time
- **Examples**: 10,000 steps goal, 8 hours sleep target, 2000 calories burned, 30 min reading

### Module Categories & Examples

**IMPORTANT**: The following categories and examples are for **reference and planning purposes only**. They are NOT locked functional requirements. New modules can be added to the system at any time by inserting records into the `lifestyle_modules` table without modifying this PRD.

#### **Health & Wellness**
| Module Name | Type | Unit | Default Goal | Description |
|-------------|------|------|--------------|-------------|
| Hydration | Counter | glasses | - | Track daily water intake |
| Sleep Hours | Goal-Based | hours | 8 | Log total sleep duration |
| Meditation | Binary | - | - | Daily meditation practice |
| Cold Shower | Binary | - | - | Morning cold exposure |
| Stretching | Binary | - | - | Daily stretching routine |
| Supplements Taken | Binary | - | - | Daily supplement compliance |
| Fasting Window | Counter | hours | - | Intermittent fasting duration |
| Vegetable Servings | Goal-Based | servings | 5 | Daily vegetable intake |

#### **Fitness & Movement**
| Module Name | Type | Unit | Default Goal | Description |
|-------------|------|------|--------------|-------------|
| Steps | Goal-Based | steps | 10000 | Daily step count |
| Cardio Minutes | Goal-Based | minutes | 30 | Cardiovascular exercise |
| Strength Training | Binary | - | - | Resistance workout completed |
| Active Minutes | Goal-Based | minutes | 60 | Total active time |
| Mobility Work | Binary | - | - | Flexibility/mobility session |

#### **Mindset & Mental Health**
| Module Name | Type | Unit | Default Goal | Description |
|-------------|------|------|--------------|-------------|
| Journaling | Binary | - | - | Daily journal entry |
| Gratitude Practice | Binary | - | - | Gratitude reflection |
| Reading | Goal-Based | minutes | 30 | Daily reading time |
| Learning | Goal-Based | minutes | 30 | Skill development time |
| Affirmations | Binary | - | - | Daily affirmations |
| Screen-Free Time | Goal-Based | hours | 2 | Time without screens |

#### **Social & Relationships**
| Module Name | Type | Unit | Default Goal | Description |
|-------------|------|------|--------------|-------------|
| Quality Conversations | Counter | count | - | Meaningful interactions |
| Family Time | Goal-Based | minutes | 60 | Time with family |
| Social Interactions | Counter | count | - | Social engagements |
| Acts of Kindness | Counter | count | - | Helping others |

#### **Productivity & Focus**
| Module Name | Type | Unit | Default Goal | Description |
|-------------|------|------|--------------|-------------|
| Deep Work | Goal-Based | hours | 4 | Focused work sessions |
| Inbox Zero | Binary | - | - | Email inbox cleared |
| No Social Media | Binary | - | - | Social media abstinence |
| Morning Routine | Binary | - | - | Morning protocol completed |
| Evening Routine | Binary | - | - | Evening protocol completed |

#### **Financial & Career**
| Module Name | Type | Unit | Default Goal | Description |
|-------------|------|------|--------------|-------------|
| Expense Tracking | Binary | - | - | Logged all expenses |
| Budget Review | Binary | - | - | Reviewed financial status |
| Income Activity | Binary | - | - | Income-generating work |
| Savings Goal | Binary | - | - | Met daily savings target |

#### **Spiritual & Purpose**
| Module Name | Type | Unit | Default Goal | Description |
|-------------|------|------|--------------|-------------|
| Prayer/Spiritual Practice | Binary | - | - | Spiritual connection time |
| Purpose Reflection | Binary | - | - | Reflected on life purpose |
| Nature Time | Goal-Based | minutes | 30 | Time spent in nature |
| Creative Expression | Goal-Based | minutes | 30 | Creative work/art |

### UI Integration Points

**Settings Page - Module Management Card**:
- Section: "Lifestyle Tracking Modules"
- Grouped by category (collapsible sections)
- Each module shows: Name, Description, Type indicator, Enable/Disable toggle
- Goal-based modules show additional input: "Your Goal" (editable numeric field)
- Enabled count displayed: "8 modules enabled"
- Search/filter by category or name

**Daily Tracker - Module Cards**:
- Only enabled modules displayed
- Cards arranged in grid (responsive: 1 col mobile, 2-3 cols desktop)
- Each card styled consistently with existing quick-action cards:
  - **Binary**: Large checkbox with module name and icon
  - **Counter**: "+/-" buttons with current count display
  - **Goal-Based**: Number input + progress bar (actual/goal) + percentage
- Module cards positioned below existing Daily Tracker sections (MITs, Weight, Deep Work)
- Card order determined by module sort_order or user preference

**Analytics Dashboard - Modules Tab**:
- New tab: "Lifestyle Modules"
- Module selector dropdown (shows only enabled modules)
- Time range filter applies to selected module
- Visualization adapts to module type:
  - **Binary**: Calendar heat map (green = completed, gray = not completed), streak display, completion percentage
  - **Counter**: Line chart of daily values, average value, total sum, trend indicator
  - **Goal-Based**: Bar chart with goal line overlay, achievement rate (%), best streak, average progress
- Statistics cards:
  - Current Streak
  - Total Days Tracked
  - Best Streak
  - Average Value (counter) or Achievement Rate (goal-based)

### Implementation Notes for Development Team

**Phase 1 - Core Infrastructure** (Epic 1 Extension):
- Create three database tables: `lifestyle_modules`, `user_module_settings`, `module_entries`
- Implement RLS policies for user data isolation
- Seed initial modules from Health & Wellness category (5-8 modules for MVP testing)

**Phase 2 - Settings Integration** (Epic 7 Extension):
- Build module management UI in Settings page
- Implement enable/disable toggle functionality
- Add goal customization for goal-based modules
- Category-based grouping and search

**Phase 3 - Daily Tracker Integration** (Epic 2 Extension):
- Fetch enabled modules for current user
- Render module cards dynamically based on data type
- Implement data entry logic for binary, counter, and goal-based types
- Real-time state updates on user interaction

**Phase 4 - Analytics Integration** (Epic 6 Extension):
- Add "Lifestyle Modules" tab to Analytics dashboard
- Build dynamic chart components adapting to module data type
- Implement streak calculation algorithm
- Statistics aggregation for selected time ranges

**Future Expansion Process**:
1. **Adding New Modules**: Insert records into `lifestyle_modules` table via migration or admin panel
2. **No Code Changes**: Module framework handles new entries automatically
3. **User Adoption**: New modules appear in Settings for users to enable
4. **Instant Analytics**: Module data immediately flows into Analytics without code updates

### Validation Rules

**Module Entry Validation**:
- Binary: Value must be 0 or 1
- Counter: Value must be non-negative integer or decimal (based on unit)
- Goal-Based: Value must be non-negative and comparable to goal
- Date: Cannot be in the future
- One entry per module per day per user (enforced by unique constraint)

**Module Settings Validation**:
- Custom goals must be positive numbers
- Custom goals only applicable to goal-based modules
- Cannot enable module without valid module_id

### Performance Considerations

**Query Optimization**:
- Index on `(user_id, module_id, date)` in `module_entries` for fast daily lookups
- Index on `(user_id, enabled)` in `user_module_settings` for active module retrieval
- Composite index on `(user_id, date)` for daily dashboard queries

**Data Volume Management**:
- Typical user: 10-20 enabled modules × 365 days = 3,650-7,300 entries/year
- 10,000 users: 36-73 million entries over 1 year (well within PostgreSQL limits)
- Pagination required for historical data views in Analytics
- Consider data retention policy for entries older than 2-3 years

### Success Metrics

**Module System KPIs**:
- Average modules enabled per user (target: 8-12)
- Module engagement rate (daily entries / enabled modules)
- Most popular modules by enable count
- Average streak length per module type
- User retention correlation with module usage

---

## Appendix B: Data Migration Considerations

When transitioning existing Life OS users from local storage to Supabase:

**Existing Features Mapped to Module System**:
- Deep Work Sessions → Can remain as dedicated feature OR migrate to Binary module
- Winners Bible Morning/Night → Can remain as dedicated feature OR migrate to Binary modules
- Custom Metrics (Story 7.9) → **Should** migrate to Module System for consistency

**Migration Strategy**:
1. Preserve existing 25 functional requirements as-is (no breaking changes)
2. Introduce Module System as additive feature
3. Future releases can optionally refactor "Custom Metrics" into modules
4. Maintain backward compatibility for data exports from local storage version

---

**END OF PRD**

*This Product Requirements Document provides comprehensive specifications for building the Life OS as a Supabase-native, multi-user web application. All features are designed for cloud-based data storage with real-time synchronization, secure authentication, and complete data isolation between users. The application delivers comprehensive health tracking with an emphasis on precise calculations, data-driven insights, and an engaging user experience powered by the distinctive MM Design System.*

*The Modular Habits & Lifestyle Tracking System (FR26) provides architectural extensibility, enabling unlimited future expansion of tracking capabilities without PRD modifications. See Appendix A for module framework specifications.*