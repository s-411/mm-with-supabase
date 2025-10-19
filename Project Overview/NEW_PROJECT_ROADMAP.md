# New Health Tracking App - Step-by-Step Roadmap

## 🚀 **Phase 1: MVP Foundation (Week 1)**

### Day 1: Project Setup
```bash
# Create Next.js project
npx create-next-app@latest health-tracker --typescript --tailwind --app
cd health-tracker

# Install dependencies
npm install @heroicons/react recharts uuid
npm install @types/uuid

# Initial git setup
git init
git add .
git commit -m "Initial Next.js setup"
```

### Day 1-2: Core Infrastructure
1. **Update Theme Variables** (`app/globals.css`):
```css
:root {
  --color-mm-blue: #3b82f6;      /* Replace cpn-yellow */
  --color-mm-dark: #1f1f1f;
  --color-mm-dark2: #2a2a2a;
  --color-mm-white: #ffffff;
  --color-mm-gray: #ababab;
}
```

2. **Create Data Models** (`lib/types.ts`):
```typescript
// Core entities for health tracking
interface CalorieEntry {
  id: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Peptide {
  id: string;
  name: string;
  defaultDosage: number;
  unit: 'mg' | 'iu' | 'mcg';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PeptideInjection {
  id: string;
  peptideId: string;
  date: Date;
  dosage: number;
  injectionSite: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExerciseEntry {
  id: string;
  date: Date;
  exerciseType: string;
  duration: number; // minutes
  caloriesBurned: number;
  intensity: 'low' | 'moderate' | 'high';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

3. **Build Storage Layer** (`lib/storage.ts`):
```typescript
// Copy CPN storage pattern, adapt for new entities
export const calorieStorage = {
  getAll: (): CalorieEntry[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mm-calorie-entries');
    return safeParseJSON(stored, []);
  },
  create: (entry: Omit<CalorieEntry, 'id' | 'createdAt' | 'updatedAt'>): CalorieEntry => {
    const newEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const entries = calorieStorage.getAll();
    entries.push(newEntry);
    localStorage.setItem('mm-calorie-entries', JSON.stringify(entries));
    return newEntry;
  }
  // ... CRUD operations
};
```

### Day 2-3: Global State Management
1. **Create Context** (`lib/context.tsx`):
```typescript
// Adapt CPN context pattern for health tracking
interface AppState {
  calorieEntries: CalorieEntry[];
  peptides: Peptide[];
  peptideInjections: PeptideInjection[];
  exerciseEntries: ExerciseEntry[];
  globalStats: HealthStatistics;
  isLoading: boolean;
}

// Custom hooks
export const useCalories = () => // CRUD for calorie entries
export const usePeptides = () => // CRUD for peptides
export const usePeptideInjections = () => // CRUD for injections
export const useExercise = () => // CRUD for exercise
export const useHealthStats = () => // Derived statistics
```

### Day 3-4: Basic Navigation & Layout
1. **Copy navigation patterns from CPN**
2. **Update component classes**: `.btn-cpn` → `.btn-mm`
3. **Create responsive layout with sidebar**
4. **Build basic routing structure**:
   - `/` - Dashboard
   - `/calories` - Calorie tracking
   - `/peptides` - Peptide management
   - `/exercise` - Exercise tracking
   - `/overview` - Data overview
   - `/analytics` - Charts and insights

### Day 4-5: Core CRUD Operations
1. **Calorie Entry System**:
   - AddCalorieModal
   - EditCalorieModal
   - Calorie entry form with macro tracking
   - Meal type selection

2. **Peptide Management**:
   - AddPeptideModal (for adding new peptides to stack)
   - PeptideInjectionModal (for logging injections)
   - Dosage tracking and injection site selection

3. **Exercise Tracking**:
   - AddExerciseModal
   - Duration and calorie burn tracking
   - Exercise type management

### Day 5-6: Dashboard & Calculations
1. **Build calculations** (`lib/calculations.ts`):
```typescript
// Daily/weekly/monthly calorie summaries
// Macro nutrient ratios
// Net calories (consumed - burned)
// Peptide injection schedules and compliance
// Exercise frequency and consistency
```

2. **Create dashboard with key metrics**:
   - Daily calorie summary
   - Macro breakdown
   - Recent peptide injections
   - Exercise summary

### Day 6-7: Overview Page & Basic Analytics
1. **Copy CPN overview table pattern**
2. **Build data tables for each entity type**
3. **Add basic filtering and sorting**
4. **Deploy to Vercel for testing**

## 🎯 **Phase 2: Feature Expansion (Week 2-3)**

### Week 2: Advanced Features
- **Analytics page with charts** (copy CPN analytics patterns)
- **Data export functionality**
- **Advanced filtering and search**
- **Calorie goals and tracking**
- **Peptide cycle management**
- **Exercise routines and programs**

### Week 3: User Experience
- **Improved mobile responsiveness**
- **Bulk operations**
- **Data import capabilities**
- **Notification system for injections**
- **Progress tracking and streaks**

## 🎨 **Phase 3: Design Polish (Week 4)**

### Polish Tasks
- **Consistent component styling**
- **Smooth animations and transitions**
- **Improved charts and visualizations**
- **Better mobile experience**
- **Accessibility improvements**

## 🚀 **Phase 4: Production (Week 5-6)**

### Production Ready
- **Supabase integration**
- **User authentication**
- **Data backup and sync**
- **Advanced analytics**
- **Performance optimization**

---

## 📋 **Daily Development Checklist**

### Every Day:
- [ ] Keep `npm run dev` running
- [ ] Test on mobile (responsive design)
- [ ] Commit changes regularly
- [ ] Deploy to Vercel when features work
- [ ] Focus on functionality before aesthetics

### Weekly Milestones:
- **Week 1**: Basic CRUD + Vercel deployment
- **Week 2**: Complete feature set
- **Week 3**: Advanced functionality
- **Week 4**: Design polish
- **Week 5-6**: Production ready

---

## 🔧 **Key Implementation Notes**

### Color System Migration
```css
/* Find and replace throughout codebase */
cpn-yellow → mm-blue
#f2f661 → #3b82f6
text-cpn-yellow → text-mm-blue
bg-cpn-yellow → bg-mm-blue
border-cpn-yellow → border-mm-blue
```

### Component Class Updates
```css
.btn-cpn → .btn-mm
.input-cpn → .input-mm
.card-cpn → .card-mm
.sidebar-item-cpn → .sidebar-item-mm
```

### Essential Patterns to Copy
1. **Modal system** (AddGirlModal → AddCalorieModal pattern)
2. **Context + useReducer** (exact same pattern)
3. **localStorage storage** (adapt for new entities)
4. **Real-time calculations** (same derived state approach)
5. **Responsive navigation** (sidebar + mobile nav)
6. **Table patterns** (overview page table structure)
7. **Chart patterns** (analytics page with Recharts)

### Critical Success Factors
1. **Start simple**: Basic CRUD before advanced features
2. **Deploy early**: Get to Vercel ASAP
3. **Mobile first**: Test responsive design continuously
4. **Type safety**: Use strict TypeScript
5. **Real-time updates**: Context should trigger recalculations
6. **Phase discipline**: Don't jump ahead to design before functionality works

This roadmap follows the exact same methodology that made CPN v2 successful. Follow it step-by-step and you'll have a working health tracking app deployed to Vercel within a week!