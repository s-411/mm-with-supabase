# MM Health Tracker - Development Roadmap

## 🎯 Project Overview

Building a comprehensive health tracking application using the **MM Design System** with focus on calorie tracking, exercise logging, weight monitoring, and injection management.

**Core Philosophy**: Build incrementally with working features at each phase. Deploy early, test constantly, iterate based on actual usage. **Build one page at a time to completion.**

---

## 📋 Pre-Development Setup

### Tech Stack
- **Framework**: Next.js 14+ with App Router and TypeScript
- **Styling**: Tailwind CSS 4.0 + MM Design System
- **State Management**: React Context + useReducer
- **Data Persistence**: localStorage (Phase 0-3), then Supabase (Phase 4+)
- **Charts**: Recharts
- **Deployment**: Vercel (from Day 1)
- **Dependencies**: @heroicons/react, recharts, uuid

### Design System Integration
- Use existing MM Design System from `design-system-cpn/`
- **Primary Color**: `--color-mm-blue: #00A1FE`
- **Component Classes**: `.btn-mm`, `.input-mm`, `.card-mm`, etc.
- Copy font files to `/public/fonts/`
- Import `styles/globals.css` in main layout
- Use `bg-mm-dark text-mm-white` on root layout

---

## 🚀 Phase 0: Foundation & Data Input (Week 1)

**Goal**: Get core tracking operational immediately

### Day 1: Project Setup
```bash
npx create-next-app@latest mm-health-tracker --typescript --tailwind --app
cd mm-health-tracker
npm install @heroicons/react recharts uuid @types/uuid
```

### Days 1-2: Core Infrastructure

**1. Data Models** (`lib/types.ts`)
```typescript
interface UserProfile {
  id: string;
  bmr: number;           // Basal Metabolic Rate
  height: number;        // cm
  weight: number;        // kg
  gender: 'male' | 'female' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

interface DailyEntry {
  id: string;
  date: string;          // YYYY-MM-DD format (unique per day)
  calories: CalorieEntry[];
  exercises: ExerciseEntry[];
  weight?: number;       // Daily weight entry
  deepWorkCompleted: boolean;
  injections: InjectionEntry[];
  createdAt: Date;
  updatedAt: Date;
}

interface CalorieEntry {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  timestamp: Date;
}

interface ExerciseEntry {
  id: string;
  type: string;
  duration: number;      // minutes
  caloriesBurned: number;
  timestamp: Date;
}

interface InjectionEntry {
  id: string;
  compound: 'Testosterone' | 'Maralyn' | 'Rita Trutard' | string;
  dosage: number;
  unit: string;
  notes?: string;
  timestamp: Date;
}
```

**2. Storage Layer** (`lib/storage.ts`)
```typescript
export const profileStorage = {
  get: (): UserProfile | null => { /* localStorage logic */ },
  save: (profile: UserProfile): void => { /* localStorage logic */ },
  update: (updates: Partial<UserProfile>): UserProfile => { /* localStorage logic */ }
};

export const dailyEntryStorage = {
  getByDate: (date: string): DailyEntry | null => { /* localStorage logic */ },
  createOrUpdate: (date: string, updates: Partial<DailyEntry>): DailyEntry => { /* localStorage logic */ },
  getAll: (): DailyEntry[] => { /* localStorage logic */ }
};
```

### Days 3-4: Essential Pages

**Page 1: Profile Setup** (`/profile`)
- BMR manual input field (critical for calculations)
- Height, weight, gender inputs
- Save to localStorage
- Clean, simple form using `.input-mm` classes

**Page 2: Daily Tracker** (`/daily`)
- **Left Side**: Input forms
  - Quick calorie entry (name, calories, carbs, protein, fat)
  - Exercise entry (type, duration, calories burned)
  - Weight entry (updates daily value)
  - Deep work completion checkbox
- **Right Side**: Today's real-time stats
  - **Calorie Balance**: `BMR - food calories + exercise calories`
  - Running calorie total
  - Macros breakdown (carbs/protein/fat)
  - Items logged today list

**Critical Calculation Logic**:
```typescript
// Real-time calorie balance
const calorieBalance = bmr - totalFoodCalories + totalExerciseCalories;

// Example: 2000 BMR - 1500 food + 600 exercise = 1100 remaining
```

### Days 5-7: Injection Tracker & Deployment

**Page 3: Injection Tracker** (`/injections/add`)
- Compound dropdown: Testosterone, Maralyn, Rita Trutard, Custom
- Dosage input with unit selection
- Date selector (defaults to today)
- Optional notes field
- Quick save with immediate feedback

**Deployment Setup**:
- Deploy to Vercel on Day 5
- Test all pages work in production
- Verify localStorage persistence
- Test on mobile devices

---

## 📊 Phase 1: Data Viewing & Basic Analytics (Week 2)

**Goal**: See what you've tracked

### Week 2 Tasks

**Dashboard** (`/`)
- Today's completion status (4 checkmarks: calories, exercise, weight, deep work)
- Quick stats cards (current weight, streak counter, calorie balance)
- Last 7 days mini-chart
- Quick links to input pages
- **Real-time calorie remaining display**

**History View** (`/history`)
- Calendar view with completion indicators
- Click any day to see/edit that day's data
- Color coding: Green (complete), Yellow (partial), Red (missed)
- Daily weight entries visible on calendar

**Injection History** (`/injections`)
- List view with filters by compound
- 30/60/90 day views
- Frequency analysis ("Testosterone: 2x this week")
- Next injection reminders

---

## 📈 Phase 2: Analytics & Insights (Week 3)

**Goal**: Make sense of your data

### Analytics Pages

**Weight Trends** (`/analytics/weight`)
- Line chart with 7/30/90 day toggles
- Daily weight entries plotted
- BMI calculation and tracking
- Rate of change indicator (+/- lbs per week)

**Nutrition Analytics** (`/analytics/nutrition`)
- Calorie balance trends (vs BMR target)
- Macronutrient consistency charts
- Weekly averages vs BMR targets
- Exercise impact visualization

**Productivity Dashboard** (`/analytics/productivity`)
- Deep work streak counter
- Weekly completion rate
- Simple monthly summary
- Correlation with other metrics

---

## 🎯 Phase 3: Planning & Goals (Week 4)

**Goal**: Forward-looking features

### Planning Features

**Tomorrow Planning** (`/planning/tomorrow`)
- Task list with High/Medium/Low priorities
- Carry over incomplete tasks
- Quick add interface
- Integration with deep work tracking

**Weekly Reviews**
- **Monday Review** (`/planning/monday`): "Three main objectives this week"
- **Friday Review** (`/planning/friday`): Review Monday objectives, completion status, reflection notes

**Settings** (`/settings`)
- Profile updates (BMR adjustment)
- BMR calculator helper
- Notification preferences (prep for Phase 4)
- Data export to JSON/CSV
- Injection schedule management

---

## 🔧 Phase 4: Automation & Polish (Week 5)

**Goal**: Reduce friction, increase consistency

### Automation Features

**Email Notifications**
- 8 PM daily reminder system
- Conditional messages based on completion status
- Email configuration in settings
- Injection schedule reminders

**Desktop Optimization**
- Keyboard shortcuts for quick entry
- Bulk data entry modes
- Multi-day view layouts
- Improved data input flows

**Quick Entry Modes**
- Recent meals quick-add
- Exercise templates and favorites
- Injection schedules/presets
- Smart defaults based on history

---

## 🚀 Phase 5: Advanced Features (Week 6+)

**Goal**: Power user features

### Advanced Analytics

**Data Relationships**
- Correlations (weight vs calories, deep work vs day)
- BMR adjustment suggestions based on weight trends
- Anomaly detection and alerts
- Pattern recognition

**Advanced Reporting**
- Generate shareable progress reports
- Charts with annotations
- Export to PDF/CSV formats
- Progress milestone tracking

**API & Cloud Integration**
- Supabase backend migration
- User authentication system
- Real-time sync across devices
- Automated backups

---

## ⚡ Critical Success Factors

### Development Principles
1. **Deploy on Day 1** - Use Vercel, test immediately in production
2. **Data Input First** - If you can't input data easily, nothing else matters
3. **Real-time Calculations** - Show calorie balance as user types
4. **Desktop-First Design** - Optimize for desktop, responsive as secondary
5. **One Page at a Time** - Complete each page fully before moving on
6. **Follow Existing Design** - Use MM Design System exactly as provided

### Build Order Priority
```
1. Profile page (BMR setup) - Foundation for all calculations
2. Daily tracker page - Core functionality, most important page
3. Dashboard - Overview and motivation
4. Injection tracker - Specialized tracking
5. History view - Data review
6. Analytics pages - Insights
7. Planning pages - Forward-looking
8. Settings - Configuration and export
```

### What NOT to Build Initially
- Authentication system (use localStorage)
- Database integration (localStorage first)
- Complex sharing features
- API integrations
- Custom styling (use MM Design System)
- PWA features
- Month view heatmaps

---

## 📐 Implementation Notes

### Calorie Math Reference
```typescript
// Core calculation that drives the entire app
const dailyCalorieRemaining = bmr - foodCalories + exerciseCalories;

// Examples:
// Start of day: 2000 BMR = 2000 remaining
// After 1500 cal meal: 2000 - 1500 = 500 remaining
// After 600 cal exercise: 2000 - 1500 + 600 = 1100 remaining
```

### Design System Usage
- **Primary Theme**: Dark theme with blue accent (`#00A1FE`)
- **Component Pattern**: Use existing `.btn-mm`, `.input-mm`, `.card-mm` classes
- **Layout Pattern**: Flex-based app shell with sidebar and main content
- **Mobile Pattern**: Desktop sidebar → Mobile bottom navigation
- **Typography**: National2Condensed (headings), ESKlarheit (body)

### Quality Gates
Each phase must meet these criteria before moving to next:
- ✅ All pages fully functional
- ✅ Matches design system exactly
- ✅ Tested locally and on Vercel
- ✅ Works on mobile devices
- ✅ localStorage data persists correctly
- ✅ Real-time calculations work properly

---

## 📅 Weekly Milestones

- **Week 1**: Core tracking operational (Profile, Daily, Injections)
- **Week 2**: Data viewing and basic analytics
- **Week 3**: Advanced analytics and insights
- **Week 4**: Planning and goal features
- **Week 5**: Automation and polish
- **Week 6+**: Advanced features and cloud integration

**Success Metric**: Working app deployed to Vercel with real data entry by end of Week 1.

This roadmap ensures you have a functional, deployed health tracking application that follows the proven patterns of the MM Design System while delivering incremental value at each phase.