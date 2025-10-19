# MM Health Tracker - Phased Development PRD

## Core Philosophy
Build incrementally with working features at each phase. Deploy early, test constantly, iterate based on actual usage. **Build one page at a time to completion.**

## Important Design Note
**The exact design and style guide for this app has already been generated. All development must adhere to the existing design system. Screenshots of example layouts from the pre-existing app will be provided as reference and should be replicated exactly.**

---

## Phase 0: Foundation & Data Input (Week 1)
**Goal: Get core tracking operational immediately**

### 0.1 Project Setup
- Next.js with TypeScript
- Tailwind CSS (use existing styles from provided codebase)
- localStorage for all data persistence
- Vercel deployment from day 1
- Desktop-first design (but responsive)

### 0.2 Core Data Models
```
User Profile:
- Basic metrics (weight, height, gender)
- BMR (manual entry field)

Daily Entry:
- Date (unique per day)
- Calories array (meals)
- Exercise array (activities)
- Weight (single daily value, can be entered every day)
- Deep work completion (boolean)
- Injections array
```

### 0.3 Essential Input Pages

**Profile Page** (`/profile`)
- BMR manual input field
- Height, weight, gender inputs
- Save to localStorage
- BMR is used for all calorie calculations

**Daily Tracker Page** (`/daily`)
- Left side: Input forms
  - Quick calorie entry (name, calories, carbs, protein, fat)
  - Exercise entry (type, duration, calories burned)
  - Weight entry (updates if exists for today, can be entered daily)
  - Deep work checkbox
- Right side: Today's stats
  - Running calorie total
  - **Calorie balance calculation:**
    - Remaining = BMR - food calories + exercise calories
    - Example: 2000 BMR - 1500 food + 600 exercise = 1100 remaining
  - Macros breakdown
  - Items logged today

**Injection Tracker** (`/injections/add`)
- Compound dropdown:
  - Testosterone
  - Maralyn
  - Rita Trutard
  - Custom/Add New option
- Dosage input
- Date selector
- Optional notes
- Quick save button

---

## Phase 1: Data Viewing & Basic Analytics (Week 2)
**Goal: See what you've tracked**

### 1.1 Dashboard (`/`)
- Today's completion status (4 checkmarks: calories, exercise, weight, deep work)
- Quick stats cards (current weight, streak, calorie balance)
- Last 7 days mini-chart
- Quick links to input pages
- **Calorie remaining display** (BMR - intake + exercise)

### 1.2 History View (`/history`)
- Calendar view with completion indicators
- Click any day to see/edit that day's data
- Color coding: Green (complete), Yellow (partial), Red (missed)
- Daily weight entries visible

### 1.3 Injection History (`/injections`)
- List view with filters by compound
- 30/60/90 day views
- Frequency analysis (e.g., "Testosterone: 2x this week")

---

## Phase 2: Analytics & Insights (Week 3)
**Goal: Make sense of your data**

### 2.1 Weight Trends (`/analytics/weight`)
- Line chart with 7/30/90 day views
- Daily weight entries plotted
- BMI calculation and tracking
- Rate of change indicator

### 2.2 Nutrition Analytics (`/analytics/nutrition`)
- Calorie balance trends (vs BMR)
- Macronutrient consistency charts
- Weekly averages vs BMR targets
- Exercise impact on daily balance

### 2.3 Productivity Dashboard (`/analytics/productivity`)
- Deep work streak counter
- Weekly completion rate
- Simple monthly summary (no heatmap)

---

## Phase 3: Planning & Goals (Week 4)
**Goal: Forward-looking features**

### 3.1 Tomorrow Planning (`/planning/tomorrow`)
- Task list with priorities (High/Medium/Low)
- Carry over incomplete tasks
- Quick add interface

### 3.2 Weekly Reviews
**Monday Review** (`/planning/monday`)
- "Three main objectives this week"
- Simple text inputs
- Auto-save to localStorage

**Friday Review** (`/planning/friday`)
- Show Monday's objectives
- Checkbox completion status
- Reflection notes

### 3.3 Settings (`/settings`)
- Profile updates (including BMR adjustment)
- BMR calculator helper
- Notification time setting (prep for Phase 4)
- Data export to JSON/CSV

---

## Phase 4: Automation & Polish (Week 5)
**Goal: Reduce friction, increase consistency**

### 4.1 Email Notifications
- 8 PM daily reminder system
- Conditional messages based on completion
- Email configuration in settings

### 4.2 Desktop Optimization
- Keyboard shortcuts for quick entry
- Bulk data entry modes
- Multi-day view layouts

### 4.3 Quick Entry Modes
- Recent meals quick-add
- Exercise templates
- Injection schedules/presets

---

## Phase 5: Advanced Features (Week 6+)
**Goal: Power user features**

### 5.1 Data Relationships
- Correlations (weight vs calories, deep work vs day of week)
- BMR adjustment suggestions based on weight trends
- Anomaly detection

### 5.2 Reporting
- Generate shareable reports
- Progress charts with annotations
- Export to PDF/CSV

### 5.3 API & Backup
- Cloud sync preparation
- API endpoints for future expansions
- Automated backups

---

## Implementation Notes

### Critical Success Factors
1. **Deploy on Day 1** - Use Vercel, test immediately
2. **Data Input First** - If you can't input data easily, nothing else matters
3. **Real-time Calculations** - Show calorie balance (BMR - intake + exercise) as user types
4. **Desktop-First Design** - Optimize for desktop usage, responsive as secondary
5. **One Page at a Time** - Complete each page fully before moving on
6. **Follow Existing Design** - Use provided screenshots and style guide exactly

### What NOT to Build Initially
- Authentication system
- Database (use localStorage)
- Complex sharing features  
- API integrations
- Custom styling (use existing design system)
- PWA features
- Month view heatmaps

### Tech Stack (Match Existing)
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS (with existing design system)
- localStorage for persistence
- Recharts for visualizations
- Vercel deployment

### Development Approach
```
Build Order:
1. Profile page (BMR setup)
2. Daily tracker page (core functionality)
3. Dashboard (overview)
4. Injection tracker
5. History view
6. Analytics pages
7. Planning pages
8. Settings

Each page should be:
- Fully functional
- Match design screenshots
- Tested locally
- Deployed to Vercel
- Used for a day before moving to next page
```

### Calorie Math Reference
```
Daily Calorie Remaining = BMR - Food Calories + Exercise Calories

Examples:
- Start of day: 2000 BMR = 2000 remaining
- After 1500 cal meal: 2000 - 1500 = 500 remaining  
- After 600 cal exercise: 2000 - 1500 + 600 = 1100 remaining
```

This phased approach ensures you have a working app from Day 1. Each phase delivers value independently, and you can stop at any phase with a functional product. Build one page completely before moving to the next.