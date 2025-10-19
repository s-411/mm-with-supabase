// MM Health Tracker - localStorage Storage Layer
// Based on roadmap specifications

import { UserProfile, DailyEntry, CalorieEntry, ExerciseEntry, InjectionEntry, InjectionTarget, MITEntry, WeeklyEntry, WeeklyObjective, NirvanaSession, NirvanaEntry, NirvanaMilestone, PersonalRecord, NirvanaProgress, SessionTypeMapping, BodyPart, BodyPartUsage, SessionCorrelation, SessionInsight, CorrelationAnalysis, WinnersBibleImage, WinnersBibleEntry } from '@/types';

// Utility functions
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function safeParseJSON<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    // Convert date strings back to Date objects
    return parsed;
  } catch {
    return fallback;
  }
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekStartDate(date: string): string {
  const d = new Date(date + 'T12:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function getDayOfWeek(date: string): number {
  const d = new Date(date + 'T12:00:00');
  return d.getDay(); // 0 = Sunday, 1 = Monday, etc.
}

// Profile Storage
export const profileStorage = {
  get(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('mm-health-profile');
    if (!stored) return null;

    const profile = safeParseJSON<UserProfile | null>(stored, null);
    if (profile) {
      // Convert date strings back to Date objects
      profile.createdAt = new Date(profile.createdAt);
      profile.updatedAt = new Date(profile.updatedAt);
    }
    return profile;
  },

  save(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mm-health-profile', JSON.stringify(profile));
  },

  update(updates: Partial<UserProfile>): UserProfile | null {
    const existing = this.get();
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    this.save(updated);
    return updated;
  },

  create(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): UserProfile {
    const profile: UserProfile = {
      ...profileData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.save(profile);
    return profile;
  },

  isComplete(): boolean {
    const profile = this.get();
    if (!profile) return false;
    
    // Check if all required fields are present and valid
    return !!(
      profile.bmr && profile.bmr > 0 &&
      profile.height && profile.height > 0 &&
      profile.weight && profile.weight > 0 &&
      profile.gender
    );
  }
};

// Daily Entry Storage
export const dailyEntryStorage = {
  getByDate(date: string): DailyEntry | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`mm-daily-entry-${date}`);
    if (!stored) return null;

    const entry = safeParseJSON<DailyEntry | null>(stored, null);
    if (entry) {
      // Convert date strings back to Date objects
      entry.createdAt = new Date(entry.createdAt);
      entry.updatedAt = new Date(entry.updatedAt);
      entry.calories = entry.calories.map(cal => ({
        ...cal,
        timestamp: new Date(cal.timestamp)
      }));
      entry.exercises = entry.exercises.map(ex => ({
        ...ex,
        timestamp: new Date(ex.timestamp)
      }));
      entry.injections = entry.injections.map(inj => ({
        ...inj,
        timestamp: new Date(inj.timestamp)
      }));
    }
    return entry;
  },

  save(entry: DailyEntry): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`mm-daily-entry-${entry.date}`, JSON.stringify(entry));
  },

  createOrUpdate(date: string, updates: Partial<DailyEntry>): DailyEntry {
    const existing = this.getByDate(date);

    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      };
      this.save(updated);
      return updated;
    } else {
      const newEntry: DailyEntry = {
        id: generateId(),
        date,
        calories: [],
        exercises: [],
        weight: undefined,
        deepWorkCompleted: false,
        injections: [],
        winnersBibleMorning: false,
        winnersBibleNight: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...updates
      };
      this.save(newEntry);
      return newEntry;
    }
  },

  getAll(): Record<string, DailyEntry> {
    if (typeof window === 'undefined') return {};

    const entries: Record<string, DailyEntry> = {};

    // Get all localStorage keys that match our pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mm-daily-entry-')) {
        const date = key.replace('mm-daily-entry-', '');
        const entry = this.getByDate(date);
        if (entry) {
          entries[date] = entry;
        }
      }
    }

    return entries;
  },

  // Helper methods for adding specific entry types
  addCalorieEntry(date: string, calorieData: Omit<CalorieEntry, 'id' | 'timestamp'>): DailyEntry {
    const entry = this.getByDate(date) || this.createOrUpdate(date, {});

    const newCalorieEntry: CalorieEntry = {
      ...calorieData,
      id: generateId(),
      timestamp: new Date()
    };

    const updatedCalories = [...entry.calories, newCalorieEntry];
    return this.createOrUpdate(date, { calories: updatedCalories });
  },

  addExerciseEntry(date: string, exerciseData: Omit<ExerciseEntry, 'id' | 'timestamp'>): DailyEntry {
    const entry = this.getByDate(date) || this.createOrUpdate(date, {});

    const newExerciseEntry: ExerciseEntry = {
      ...exerciseData,
      id: generateId(),
      timestamp: new Date()
    };

    const updatedExercises = [...entry.exercises, newExerciseEntry];
    return this.createOrUpdate(date, { exercises: updatedExercises });
  },

  addInjectionEntry(date: string, injectionData: Omit<InjectionEntry, 'id' | 'timestamp'>): DailyEntry {
    const entry = this.getByDate(date) || this.createOrUpdate(date, {});

    const newInjectionEntry: InjectionEntry = {
      ...injectionData,
      id: generateId(),
      timestamp: new Date()
    };

    const updatedInjections = [...entry.injections, newInjectionEntry];
    return this.createOrUpdate(date, { injections: updatedInjections });
  },

  updateWeight(date: string, weight: number): DailyEntry {
    return this.createOrUpdate(date, { weight });
  },

  toggleDeepWork(date: string): DailyEntry {
    const entry = this.getByDate(date) || this.createOrUpdate(date, {});
    return this.createOrUpdate(date, { deepWorkCompleted: !entry.deepWorkCompleted });
  },

  updateMITs(date: string, mits: MITEntry[]): DailyEntry {
    return this.createOrUpdate(date, { mits });
  },

  toggleMITCompletion(date: string, mitId: string): DailyEntry {
    const entry = this.getByDate(date) || this.createOrUpdate(date, {});
    const updatedMITs = (entry.mits || []).map(mit =>
      mit.id === mitId ? { ...mit, completed: !mit.completed } : mit
    );
    return this.createOrUpdate(date, { mits: updatedMITs });
  },

  // Winners Bible functions
  markWinnersBibleViewed(date: string, timeOfDay: 'morning' | 'night'): DailyEntry {
    const fieldName = timeOfDay === 'morning' ? 'winnersBibleMorning' : 'winnersBibleNight';
    return this.createOrUpdate(date, { [fieldName]: true });
  },

  getWinnersBibleStatus(date: string): { morningCompleted: boolean; nightCompleted: boolean } {
    const entry = this.getByDate(date);
    return {
      morningCompleted: entry?.winnersBibleMorning || false,
      nightCompleted: entry?.winnersBibleNight || false
    };
  }
};

// Data export functionality
// Compound Storage
// Food Template Storage
export interface FoodTemplate {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  createdAt: Date;
}

export const foodTemplateStorage = {
  get(): FoodTemplate[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mm-food-templates');
    if (!stored) return [];
    
    const templates = safeParseJSON<FoodTemplate[]>(stored, []);
    return templates.map(template => ({
      ...template,
      createdAt: new Date(template.createdAt)
    }));
  },

  save(templates: FoodTemplate[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mm-food-templates', JSON.stringify(templates));
  },

  add(template: Omit<FoodTemplate, 'id' | 'createdAt'>): FoodTemplate[] {
    const existing = this.get();
    const newTemplate: FoodTemplate = {
      ...template,
      id: generateId(),
      createdAt: new Date()
    };
    const updated = [...existing, newTemplate];
    this.save(updated);
    return updated;
  },

  remove(templateId: string): FoodTemplate[] {
    const existing = this.get();
    const updated = existing.filter(t => t.id !== templateId);
    this.save(updated);
    return updated;
  },

  update(templateId: string, updates: Partial<Omit<FoodTemplate, 'id' | 'createdAt'>>): FoodTemplate[] {
    const existing = this.get();
    const updated = existing.map(template => 
      template.id === templateId 
        ? { ...template, ...updates }
        : template
    );
    this.save(updated);
    return updated;
  }
};

export const compoundStorage = {
  get(): string[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mm-compounds');
    if (!stored) {
      // Start with empty compounds for new users
      return [];
    }
    return safeParseJSON<string[]>(stored, []);
  },

  save(compounds: string[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mm-compounds', JSON.stringify(compounds));
  },

  add(compound: string): string[] {
    const existing = this.get();
    if (!existing.includes(compound.trim())) {
      const updated = [...existing, compound.trim()];
      this.save(updated);
      return updated;
    }
    return existing;
  },

  remove(compound: string): string[] {
    const existing = this.get();
    const updated = existing.filter(c => c !== compound);
    this.save(updated);
    return updated;
  },

  // Get compounds that have injection data
  getCompoundsWithData(): Set<string> {
    const dailyEntries = dailyEntryStorage.getAll();
    const compoundsWithData = new Set<string>();
    
    Object.values(dailyEntries).forEach(entry => {
      entry.injections.forEach(injection => {
        compoundsWithData.add(injection.compound);
      });
    });

    return compoundsWithData;
  }
};

export const dataExport = {
  exportToJSON(): string {
    const profile = profileStorage.get();
    const dailyEntries = dailyEntryStorage.getAll();
    const compounds = compoundStorage.get();

    return JSON.stringify({
      profile,
      dailyEntries,
      compounds,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  },

  exportToCSV(): string {
    const dailyEntries = dailyEntryStorage.getAll();
    const rows = ['Date,Calories Consumed,Calories Burned,Weight,Deep Work Completed'];

    Object.values(dailyEntries).forEach(entry => {
      const totalConsumed = entry.calories.reduce((sum, cal) => sum + cal.calories, 0);
      const totalBurned = entry.exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);

      rows.push([
        entry.date,
        totalConsumed.toString(),
        totalBurned.toString(),
        entry.weight?.toString() || '',
        entry.deepWorkCompleted ? 'Yes' : 'No'
      ].join(','));
    });

    return rows.join('\n');
  }
};

// Data calculations
export const calculations = {
  calculateDailyMetrics(date: string, bmr: number) {
    const entry = dailyEntryStorage.getByDate(date);
    if (!entry) {
      return {
        totalCaloriesConsumed: 0,
        totalCaloriesBurned: 0,
        calorieBalance: bmr,
        macros: { carbs: 0, protein: 0, fat: 0 },
        completionStatus: {
          calories: false,
          exercise: false,
          weight: false,
          deepWork: false,
          mits: false
        }
      };
    }

    const totalCaloriesConsumed = entry.calories.reduce((sum, cal) => sum + cal.calories, 0);
    const totalCaloriesBurned = entry.exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
    const calorieBalance = bmr - totalCaloriesConsumed + totalCaloriesBurned;

    const macros = entry.calories.reduce(
      (totals, cal) => ({
        carbs: totals.carbs + cal.carbs,
        protein: totals.protein + cal.protein,
        fat: totals.fat + cal.fat
      }),
      { carbs: 0, protein: 0, fat: 0 }
    );

    // Get tomorrow's date to check for MIT planning
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];
    const tomorrowEntry = dailyEntryStorage.getByDate(tomorrowDateString);
    
    const completionStatus = {
      calories: entry.calories.length > 0,
      exercise: entry.exercises.length > 0,
      weight: entry.weight !== undefined,
      deepWork: entry.deepWorkCompleted,
      mits: tomorrowEntry?.mits !== undefined && tomorrowEntry.mits.length > 0
    };

    return {
      totalCaloriesConsumed,
      totalCaloriesBurned,
      calorieBalance,
      macros,
      completionStatus
    };
  }
};

// Injection targets storage
export const injectionTargetStorage = {
  get(): InjectionTarget[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mm-injection-targets');
    if (!stored) return [];
    
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((target: InjectionTarget) => ({
        ...target,
        weeklyTarget: target.doseAmount * target.frequency // Ensure calculated field is current
      }));
    } catch {
      return [];
    }
  },

  save(targets: InjectionTarget[]): void {
    if (typeof window === 'undefined') return;
    // Recalculate weeklyTarget before saving
    const updatedTargets = targets.map(target => ({
      ...target,
      weeklyTarget: target.doseAmount * target.frequency
    }));
    localStorage.setItem('mm-injection-targets', JSON.stringify(updatedTargets));
  },

  add(targetData: Omit<InjectionTarget, 'id' | 'weeklyTarget'>): InjectionTarget[] {
    const targets = this.get();
    const newTarget: InjectionTarget = {
      ...targetData,
      id: generateId(),
      weeklyTarget: targetData.doseAmount * targetData.frequency
    };
    const updated = [...targets, newTarget];
    this.save(updated);
    return updated;
  },

  update(targetId: string, updates: Partial<InjectionTarget>): InjectionTarget[] {
    const targets = this.get();
    const updated = targets.map(target => 
      target.id === targetId 
        ? { 
            ...target, 
            ...updates,
            weeklyTarget: (updates.doseAmount || target.doseAmount) * (updates.frequency || target.frequency)
          }
        : target
    );
    this.save(updated);
    return updated;
  },

  remove(targetId: string): InjectionTarget[] {
    const targets = this.get();
    const updated = targets.filter(target => target.id !== targetId);
    this.save(updated);
    return updated;
  },

  getByCompound(compound: string): InjectionTarget | null {
    const targets = this.get();
    return targets.find(target => target.compound === compound && target.enabled) || null;
  },

  // Calculate weekly progress for a compound
  getWeeklyProgress(compound: string): {
    target: number;
    actual: number;
    injectionCount: number;
    targetCount: number;
    unit: string;
    percentage: number;
    isOnTarget: boolean;
  } {
    const target = this.getByCompound(compound);
    if (!target) {
      return {
        target: 0,
        actual: 0,
        injectionCount: 0,
        targetCount: 0,
        unit: '',
        percentage: 0,
        isOnTarget: false
      };
    }

    // Get last 7 days of injections
    const currentDate = new Date();
    let actualDose = 0;
    let injectionCount = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = dailyEntryStorage.getByDate(dateString);

      if (entry?.injections) {
        const compoundInjections = entry.injections.filter(inj => inj.compound === compound);
        compoundInjections.forEach(inj => {
          actualDose += inj.dosage;
          injectionCount++;
        });
      }
    }

    const percentage = target.weeklyTarget > 0 ? Math.round((actualDose / target.weeklyTarget) * 100) : 0;
    const isOnTarget = percentage >= 90 && percentage <= 110; // Within 10% is considered "on target"

    return {
      target: target.weeklyTarget,
      actual: actualDose,
      injectionCount,
      targetCount: target.frequency,
      unit: target.unit,
      percentage,
      isOnTarget
    };
  }
};

// Weekly Entry Storage
export const weeklyEntryStorage = {
  getByWeekStart(weekStartDate: string): WeeklyEntry | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`mm-weekly-entry-${weekStartDate}`);
    if (!stored) return null;

    const entry = safeParseJSON<WeeklyEntry | null>(stored, null);
    if (entry) {
      // Convert date strings back to Date objects
      entry.createdAt = new Date(entry.createdAt);
      entry.updatedAt = new Date(entry.updatedAt);
    }
    return entry;
  },

  getByDate(date: string): WeeklyEntry | null {
    const weekStart = getWeekStartDate(date);
    return this.getByWeekStart(weekStart);
  },

  createOrUpdate(weekStartDate: string, data: Partial<Omit<WeeklyEntry, 'id' | 'weekStartDate' | 'createdAt' | 'updatedAt'>>): WeeklyEntry {
    const existing = this.getByWeekStart(weekStartDate);
    
    if (existing) {
      const updated: WeeklyEntry = {
        ...existing,
        ...data,
        updatedAt: new Date()
      };
      this.save(weekStartDate, updated);
      return updated;
    } else {
      const newEntry: WeeklyEntry = {
        id: generateId(),
        weekStartDate,
        objectives: [],
        whyImportant: '',
        reviewCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      };
      this.save(weekStartDate, newEntry);
      return newEntry;
    }
  },

  save(weekStartDate: string, entry: WeeklyEntry): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`mm-weekly-entry-${weekStartDate}`, JSON.stringify(entry));
  },

  updateObjectives(weekStartDate: string, objectives: WeeklyObjective[]): WeeklyEntry {
    return this.createOrUpdate(weekStartDate, { objectives });
  },

  updateWhyImportant(weekStartDate: string, whyImportant: string): WeeklyEntry {
    return this.createOrUpdate(weekStartDate, { whyImportant });
  },

  updateFridayReview(weekStartDate: string, fridayReview: string, reviewCompleted: boolean = true): WeeklyEntry {
    return this.createOrUpdate(weekStartDate, { fridayReview, reviewCompleted });
  },

  toggleObjectiveCompletion(weekStartDate: string, objectiveId: string): WeeklyEntry {
    const entry = this.getByWeekStart(weekStartDate);
    if (!entry) {
      throw new Error('Weekly entry not found');
    }

    const updatedObjectives = entry.objectives.map(obj => 
      obj.id === objectiveId ? { ...obj, completed: !obj.completed } : obj
    );

    return this.createOrUpdate(weekStartDate, { objectives: updatedObjectives });
  },

  getAllWeeks(): WeeklyEntry[] {
    if (typeof window === 'undefined') return [];
    
    const entries: WeeklyEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mm-weekly-entry-')) {
        const weekStart = key.replace('mm-weekly-entry-', '');
        const entry = this.getByWeekStart(weekStart);
        if (entry) entries.push(entry);
      }
    }
    
    return entries.sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
  }
};

// Nirvana Session Types Storage
export const nirvanaSessionTypesStorage = {
  get(): string[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('mm-nirvana-session-types');
    if (!stored) {
      // Default session types
      const defaultTypes = [
        'Mobility: Shoulder, elbow, and wrist',
        'Mobility: Spine',
        'Mobility: hip, knee, and ankle',
        'Beginner handstands',
        'Handstands',
        'Press handstand',
        'Handstand push-up',
        'Abs and glutes',
        'Power yoga',
        'Pilates',
        'Back bends',
        'Single leg squat',
        'Side splits',
        'Front splits',
        'Yin yoga'
      ];
      localStorage.setItem('mm-nirvana-session-types', JSON.stringify(defaultTypes));
      return defaultTypes;
    }
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  save(types: string[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mm-nirvana-session-types', JSON.stringify(types));
  },

  add(type: string): void {
    const types = this.get();
    if (!types.includes(type)) {
      types.push(type);
      types.sort();
      this.save(types);
    }
  },

  remove(type: string): void {
    const types = this.get().filter(t => t !== type);
    this.save(types);
  }
};

// Nirvana Sessions Storage (per day)
export const nirvanaSessionStorage = {
  getByDate(date: string): NirvanaEntry | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(`mm-nirvana-${date}`);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  save(date: string, sessions: NirvanaSession[]): void {
    if (typeof window === 'undefined') return;
    
    const existing = this.getByDate(date);
    const entry: NirvanaEntry = {
      id: existing?.id || generateId(),
      date,
      sessions,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    localStorage.setItem(`mm-nirvana-${date}`, JSON.stringify(entry));
  },

  addSession(date: string, sessionType: string): void {
    const existing = this.getByDate(date);
    const sessions = existing?.sessions || [];
    
    const newSession: NirvanaSession = {
      id: generateId(),
      sessionType,
      timestamp: new Date()
    };
    
    sessions.push(newSession);
    this.save(date, sessions);
  },

  removeSession(date: string, sessionId: string): void {
    const existing = this.getByDate(date);
    if (!existing) return;
    
    const sessions = existing.sessions.filter(s => s.id !== sessionId);
    this.save(date, sessions);
  },

  getSessionHistory(days: number = 30): NirvanaEntry[] {
    const history: NirvanaEntry[] = [];
    const currentDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = this.getByDate(dateString);
      if (entry) {
        history.push(entry);
      }
    }
    
    return history;
  }
};

// Default milestones for handstand progression
const defaultMilestones: NirvanaMilestone[] = [
  // Beginner Handstands
  { id: 'hs-wall-10s', title: 'Wall Handstand 10s', description: 'Hold a wall-supported handstand for 10 seconds', category: 'handstand', difficulty: 'beginner', completed: false, targetValue: 10, unit: 'seconds', order: 1 },
  { id: 'hs-wall-30s', title: 'Wall Handstand 30s', description: 'Hold a wall-supported handstand for 30 seconds', category: 'handstand', difficulty: 'beginner', completed: false, targetValue: 30, unit: 'seconds', order: 2 },
  { id: 'hs-wall-60s', title: 'Wall Handstand 60s', description: 'Hold a wall-supported handstand for 60 seconds', category: 'handstand', difficulty: 'beginner', completed: false, targetValue: 60, unit: 'seconds', order: 3 },
  
  // Intermediate Handstands
  { id: 'hs-free-5s', title: 'Freestanding 5s', description: 'Hold a freestanding handstand for 5 seconds', category: 'handstand', difficulty: 'intermediate', completed: false, targetValue: 5, unit: 'seconds', order: 4 },
  { id: 'hs-free-10s', title: 'Freestanding 10s', description: 'Hold a freestanding handstand for 10 seconds', category: 'handstand', difficulty: 'intermediate', completed: false, targetValue: 10, unit: 'seconds', order: 5 },
  { id: 'hs-free-30s', title: 'Freestanding 30s', description: 'Hold a freestanding handstand for 30 seconds', category: 'handstand', difficulty: 'intermediate', completed: false, targetValue: 30, unit: 'seconds', order: 6 },
  
  // Press Handstand Progression
  { id: 'pike-compression-5s', title: 'Pike Compression 5s', description: 'Lift feet off ground in pike position for 5 seconds', category: 'strength', difficulty: 'intermediate', completed: false, targetValue: 5, unit: 'seconds', order: 7 },
  { id: 'pike-compression-10s', title: 'Pike Compression 10s', description: 'Lift feet off ground in pike position for 10 seconds', category: 'strength', difficulty: 'intermediate', completed: false, targetValue: 10, unit: 'seconds', order: 8 },
  { id: 'press-negative', title: 'Press Negative', description: 'Controlled lowering from handstand to pike position', category: 'strength', difficulty: 'intermediate', completed: false, order: 9 },
  
  // Advanced Press Handstand
  { id: 'assisted-press', title: 'Assisted Press Handstand', description: 'Press to handstand with minimal assistance', category: 'handstand', difficulty: 'advanced', completed: false, order: 10 },
  { id: 'full-press', title: 'Full Press Handstand', description: 'Unassisted press from pike to handstand', category: 'handstand', difficulty: 'advanced', completed: false, order: 11 },
  { id: 'straddle-press', title: 'Straddle Press Handstand', description: 'Press to handstand with legs in straddle position', category: 'handstand', difficulty: 'advanced', completed: false, order: 12 },
  
  // Flexibility Milestones
  { id: 'forward-fold-flat', title: 'Flat Forward Fold', description: 'Touch chest to legs in forward fold', category: 'flexibility', difficulty: 'intermediate', completed: false, order: 13 },
  { id: 'side-splits-flat', title: 'Flat Side Splits', description: 'Achieve full side splits with hips on ground', category: 'flexibility', difficulty: 'advanced', completed: false, order: 14 },
  { id: 'front-splits-flat', title: 'Flat Front Splits', description: 'Achieve full front splits with both legs straight', category: 'flexibility', difficulty: 'advanced', completed: false, order: 15 }
];

// Default personal records
const defaultPersonalRecords: PersonalRecord[] = [
  { id: 'pr-handstand-hold', name: 'Longest Handstand Hold', category: 'handstand', value: 0, unit: 'seconds', recordDate: new Date(), notes: 'Freestanding handstand' },
  { id: 'pr-wall-handstand', name: 'Longest Wall Handstand', category: 'handstand', value: 0, unit: 'seconds', recordDate: new Date(), notes: 'Wall-supported handstand' },
  { id: 'pr-pike-compression', name: 'Pike Compression Hold', category: 'strength', value: 0, unit: 'seconds', recordDate: new Date(), notes: 'Feet lifted in pike position' },
  { id: 'pr-handstand-pushups', name: 'Handstand Push-ups', category: 'strength', value: 0, unit: 'reps', recordDate: new Date(), notes: 'Maximum consecutive reps' },
  { id: 'pr-l-sit', name: 'L-sit Hold', category: 'strength', value: 0, unit: 'seconds', recordDate: new Date(), notes: 'Legs parallel to ground' },
  { id: 'pr-forward-fold', name: 'Forward Fold Depth', category: 'flexibility', value: 0, unit: 'cm', recordDate: new Date(), notes: 'Distance from chest to legs' },
  { id: 'pr-side-splits', name: 'Side Splits Width', category: 'flexibility', value: 0, unit: 'cm', recordDate: new Date(), notes: 'Distance from hip to ground' },
  { id: 'pr-back-bend', name: 'Back Bend Hold', category: 'flexibility', value: 0, unit: 'seconds', recordDate: new Date(), notes: 'Bridge position hold time' }
];

// Nirvana Progress Storage
export const nirvanaProgressStorage = {
  get(): NirvanaProgress {
    if (typeof window === 'undefined') {
      return {
        id: generateId(),
        milestones: defaultMilestones,
        personalRecords: defaultPersonalRecords,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    const stored = localStorage.getItem('mm-nirvana-progress');
    if (!stored) {
      const defaultProgress: NirvanaProgress = {
        id: generateId(),
        milestones: defaultMilestones,
        personalRecords: defaultPersonalRecords,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.save(defaultProgress);
      return defaultProgress;
    }
    
    try {
      const progress = JSON.parse(stored) as NirvanaProgress;
      // Convert date strings back to Date objects
      progress.createdAt = new Date(progress.createdAt);
      progress.updatedAt = new Date(progress.updatedAt);
      progress.milestones.forEach(milestone => {
        if (milestone.completedDate) {
          milestone.completedDate = new Date(milestone.completedDate);
        }
      });
      progress.personalRecords.forEach(record => {
        record.recordDate = new Date(record.recordDate);
        if (record.previousDate) {
          record.previousDate = new Date(record.previousDate);
        }
      });
      return progress;
    } catch {
      const defaultProgress: NirvanaProgress = {
        id: generateId(),
        milestones: defaultMilestones,
        personalRecords: defaultPersonalRecords,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.save(defaultProgress);
      return defaultProgress;
    }
  },

  save(progress: NirvanaProgress): void {
    if (typeof window === 'undefined') return;
    
    const updated = {
      ...progress,
      updatedAt: new Date()
    };
    
    localStorage.setItem('mm-nirvana-progress', JSON.stringify(updated));
  },

  updateMilestone(milestoneId: string, completed: boolean): void {
    const progress = this.get();
    const milestone = progress.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.completed = completed;
      milestone.completedDate = completed ? new Date() : undefined;
      this.save(progress);
    }
  },

  updatePersonalRecord(recordId: string, newValue: number, notes?: string): void {
    const progress = this.get();
    const record = progress.personalRecords.find(r => r.id === recordId);
    if (record) {
      record.previousValue = record.value;
      record.previousDate = record.recordDate;
      record.value = newValue;
      record.recordDate = new Date();
      if (notes) record.notes = notes;
      this.save(progress);
    }
  },

  addCustomMilestone(milestone: Omit<NirvanaMilestone, 'id'>): void {
    const progress = this.get();
    const newMilestone: NirvanaMilestone = {
      ...milestone,
      id: generateId()
    };
    progress.milestones.push(newMilestone);
    this.save(progress);
  },

  addCustomPersonalRecord(record: Omit<PersonalRecord, 'id'>): void {
    const progress = this.get();
    const newRecord: PersonalRecord = {
      ...record,
      id: generateId()
    };
    progress.personalRecords.push(newRecord);
    this.save(progress);
  }
};

// Default body parts for mapping
const defaultBodyParts: BodyPart[] = [
  // Upper body
  { id: 'shoulders', name: 'Shoulders', category: 'upper', position: { x: 50, y: 20 } },
  { id: 'wrists', name: 'Wrists', category: 'upper', position: { x: 30, y: 35 } },
  { id: 'elbows', name: 'Elbows', category: 'upper', position: { x: 40, y: 30 } },
  { id: 'upper-back', name: 'Upper Back', category: 'upper', position: { x: 50, y: 25 } },
  
  // Core
  { id: 'abs', name: 'Abs', category: 'core', position: { x: 50, y: 45 } },
  { id: 'spine', name: 'Spine', category: 'core', position: { x: 50, y: 40 } },
  { id: 'glutes', name: 'Glutes', category: 'core', position: { x: 50, y: 55 } },
  
  // Lower body
  { id: 'hips', name: 'Hips', category: 'lower', position: { x: 50, y: 60 } },
  { id: 'knees', name: 'Knees', category: 'lower', position: { x: 50, y: 75 } },
  { id: 'ankles', name: 'Ankles', category: 'lower', position: { x: 50, y: 90 } }
];

// Default session type to body part mappings
const defaultSessionMappings: SessionTypeMapping[] = [
  { sessionType: 'Mobility: Shoulder, elbow, and wrist', bodyParts: [
    { id: 'shoulders', name: 'Shoulders', category: 'upper', position: { x: 50, y: 20 } },
    { id: 'elbows', name: 'Elbows', category: 'upper', position: { x: 40, y: 30 } },
    { id: 'wrists', name: 'Wrists', category: 'upper', position: { x: 30, y: 35 } }
  ], intensity: 'medium' },
  
  { sessionType: 'Mobility: Spine', bodyParts: [
    { id: 'spine', name: 'Spine', category: 'core', position: { x: 50, y: 40 } },
    { id: 'upper-back', name: 'Upper Back', category: 'upper', position: { x: 50, y: 25 } }
  ], intensity: 'medium' },
  
  { sessionType: 'Mobility: hip, knee, and ankle', bodyParts: [
    { id: 'hips', name: 'Hips', category: 'lower', position: { x: 50, y: 60 } },
    { id: 'knees', name: 'Knees', category: 'lower', position: { x: 50, y: 75 } },
    { id: 'ankles', name: 'Ankles', category: 'lower', position: { x: 50, y: 90 } }
  ], intensity: 'medium' },
  
  { sessionType: 'Beginner handstands', bodyParts: [
    { id: 'shoulders', name: 'Shoulders', category: 'upper', position: { x: 50, y: 20 } },
    { id: 'wrists', name: 'Wrists', category: 'upper', position: { x: 30, y: 35 } },
    { id: 'abs', name: 'Abs', category: 'core', position: { x: 50, y: 45 } }
  ], intensity: 'high' },
  
  { sessionType: 'Handstands', bodyParts: [
    { id: 'shoulders', name: 'Shoulders', category: 'upper', position: { x: 50, y: 20 } },
    { id: 'wrists', name: 'Wrists', category: 'upper', position: { x: 30, y: 35 } },
    { id: 'abs', name: 'Abs', category: 'core', position: { x: 50, y: 45 } }
  ], intensity: 'high' },
  
  { sessionType: 'Press handstand', bodyParts: [
    { id: 'shoulders', name: 'Shoulders', category: 'upper', position: { x: 50, y: 20 } },
    { id: 'abs', name: 'Abs', category: 'core', position: { x: 50, y: 45 } },
    { id: 'hips', name: 'Hips', category: 'lower', position: { x: 50, y: 60 } }
  ], intensity: 'high' },
  
  { sessionType: 'Handstand push-up', bodyParts: [
    { id: 'shoulders', name: 'Shoulders', category: 'upper', position: { x: 50, y: 20 } },
    { id: 'wrists', name: 'Wrists', category: 'upper', position: { x: 30, y: 35 } },
    { id: 'abs', name: 'Abs', category: 'core', position: { x: 50, y: 45 } }
  ], intensity: 'high' },
  
  { sessionType: 'Abs and glutes', bodyParts: [
    { id: 'abs', name: 'Abs', category: 'core', position: { x: 50, y: 45 } },
    { id: 'glutes', name: 'Glutes', category: 'core', position: { x: 50, y: 55 } }
  ], intensity: 'high' },
  
  { sessionType: 'Power yoga', bodyParts: [
    { id: 'shoulders', name: 'Shoulders', category: 'upper', position: { x: 50, y: 20 } },
    { id: 'abs', name: 'Abs', category: 'core', position: { x: 50, y: 45 } },
    { id: 'hips', name: 'Hips', category: 'lower', position: { x: 50, y: 60 } }
  ], intensity: 'medium' },
  
  { sessionType: 'Pilates', bodyParts: [
    { id: 'abs', name: 'Abs', category: 'core', position: { x: 50, y: 45 } },
    { id: 'glutes', name: 'Glutes', category: 'core', position: { x: 50, y: 55 } },
    { id: 'spine', name: 'Spine', category: 'core', position: { x: 50, y: 40 } }
  ], intensity: 'medium' },
  
  { sessionType: 'Back bends', bodyParts: [
    { id: 'spine', name: 'Spine', category: 'core', position: { x: 50, y: 40 } },
    { id: 'shoulders', name: 'Shoulders', category: 'upper', position: { x: 50, y: 20 } },
    { id: 'hips', name: 'Hips', category: 'lower', position: { x: 50, y: 60 } }
  ], intensity: 'medium' },
  
  { sessionType: 'Single leg squat', bodyParts: [
    { id: 'glutes', name: 'Glutes', category: 'core', position: { x: 50, y: 55 } },
    { id: 'knees', name: 'Knees', category: 'lower', position: { x: 50, y: 75 } },
    { id: 'ankles', name: 'Ankles', category: 'lower', position: { x: 50, y: 90 } }
  ], intensity: 'high' },
  
  { sessionType: 'Side splits', bodyParts: [
    { id: 'hips', name: 'Hips', category: 'lower', position: { x: 50, y: 60 } },
    { id: 'glutes', name: 'Glutes', category: 'core', position: { x: 50, y: 55 } }
  ], intensity: 'medium' },
  
  { sessionType: 'Front splits', bodyParts: [
    { id: 'hips', name: 'Hips', category: 'lower', position: { x: 50, y: 60 } },
    { id: 'glutes', name: 'Glutes', category: 'core', position: { x: 50, y: 55 } }
  ], intensity: 'medium' },
  
  { sessionType: 'Yin yoga', bodyParts: [
    { id: 'spine', name: 'Spine', category: 'core', position: { x: 50, y: 40 } },
    { id: 'hips', name: 'Hips', category: 'lower', position: { x: 50, y: 60 } }
  ], intensity: 'low' }
];

// Body Part Mapping Storage
export const bodyPartMappingStorage = {
  getMappings(): SessionTypeMapping[] {
    if (typeof window === 'undefined') return defaultSessionMappings;
    
    const stored = localStorage.getItem('mm-nirvana-body-mappings');
    if (!stored) {
      this.saveMappings(defaultSessionMappings);
      return defaultSessionMappings;
    }
    
    try {
      return JSON.parse(stored);
    } catch {
      this.saveMappings(defaultSessionMappings);
      return defaultSessionMappings;
    }
  },

  saveMappings(mappings: SessionTypeMapping[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mm-nirvana-body-mappings', JSON.stringify(mappings));
  },

  getBodyPartUsage(days: number = 30): BodyPartUsage[] {
    const mappings = this.getMappings();
    const currentDate = new Date();
    const bodyPartStats: { [key: string]: { count: number; lastTrained: Date | null; totalIntensity: number } } = {};
    
    // Initialize all body parts
    defaultBodyParts.forEach(part => {
      bodyPartStats[part.id] = { count: 0, lastTrained: null, totalIntensity: 0 };
    });
    
    // Analyze sessions from the last N days
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = nirvanaSessionStorage.getByDate(dateString);
      
      if (entry && entry.sessions.length > 0) {
        entry.sessions.forEach(session => {
          const mapping = mappings.find(m => m.sessionType === session.sessionType);
          if (mapping) {
            mapping.bodyParts.forEach(bodyPart => {
              if (bodyPartStats[bodyPart.id]) {
                bodyPartStats[bodyPart.id].count++;
                bodyPartStats[bodyPart.id].lastTrained = new Date(session.timestamp);
                
                // Add intensity weight
                const intensityWeight = mapping.intensity === 'high' ? 3 : mapping.intensity === 'medium' ? 2 : 1;
                bodyPartStats[bodyPart.id].totalIntensity += intensityWeight;
              }
            });
          }
        });
      }
    }
    
    // Convert to BodyPartUsage array
    return defaultBodyParts.map(part => ({
      bodyPartId: part.id,
      name: part.name,
      category: part.category,
      sessionCount: bodyPartStats[part.id].count,
      lastTrained: bodyPartStats[part.id].lastTrained,
      averageIntensity: bodyPartStats[part.id].count > 0 
        ? bodyPartStats[part.id].totalIntensity / bodyPartStats[part.id].count 
        : 0,
      position: part.position
    }));
  }
};

// Session Correlation Analysis
export const sessionCorrelationStorage = {
  analyzeCorrelations(days: number = 60): CorrelationAnalysis {
    const currentDate = new Date();
    const sessionsByDate: { [date: string]: NirvanaSession[] } = {};
    const sessionTypes = nirvanaSessionTypesStorage.get();
    
    // Collect session data
    for (let i = 0; i < days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const entry = nirvanaSessionStorage.getByDate(dateString);
      
      if (entry && entry.sessions.length > 0) {
        sessionsByDate[dateString] = entry.sessions;
      }
    }
    
    const dates = Object.keys(sessionsByDate).sort();
    const correlations: SessionCorrelation[] = [];
    
    // Analyze same-day combinations
    for (let i = 0; i < sessionTypes.length; i++) {
      for (let j = i + 1; j < sessionTypes.length; j++) {
        const sessionA = sessionTypes[i];
        const sessionB = sessionTypes[j];
        
        let sameDayCount = 0;
        let sequenceCount = 0;
        let totalDaysWithA = 0;
        let totalDaysWithB = 0;
        
        dates.forEach((date, dateIndex) => {
          const sessionsToday = sessionsByDate[date];
          const hasA = sessionsToday.some(s => s.sessionType === sessionA);
          const hasB = sessionsToday.some(s => s.sessionType === sessionB);
          
          if (hasA) totalDaysWithA++;
          if (hasB) totalDaysWithB++;
          
          // Same day combination
          if (hasA && hasB) {
            sameDayCount++;
          }
          
          // Sequence analysis (A followed by B within 2 days)
          if (hasA && dateIndex < dates.length - 2) {
            for (let k = 1; k <= 2; k++) {
              const futureDate = dates[dateIndex + k];
              if (futureDate && sessionsByDate[futureDate]) {
                const hasFutureB = sessionsByDate[futureDate].some(s => s.sessionType === sessionB);
                if (hasFutureB) {
                  sequenceCount++;
                  break;
                }
              }
            }
          }
        });
        
        // Calculate success rate and confidence
        const combinationOpportunities = Math.max(totalDaysWithA, totalDaysWithB);
        const actualCombinations = sameDayCount + sequenceCount;
        const successRate = combinationOpportunities > 0 ? actualCombinations / combinationOpportunities : 0;
        const confidence = combinationOpportunities >= 5 ? Math.min(1, combinationOpportunities / 10) : 0;
        
        if (sameDayCount > 0 || sequenceCount > 0) {
          correlations.push({
            sessionA,
            sessionB,
            sameDayCount,
            sequenceCount,
            successRate,
            confidence
          });
        }
      }
    }
    
    // Generate insights
    const insights = this.generateInsights(correlations);
    const recommendations = this.generateRecommendations(correlations, insights);
    
    return {
      correlations: correlations.sort((a, b) => b.successRate - a.successRate),
      insights,
      recommendations,
      analysisDate: new Date()
    };
  },

  generateInsights(correlations: SessionCorrelation[]): SessionInsight[] {
    const insights: SessionInsight[] = [];
    
    // Find strong same-day combinations
    const strongSameDayCombinations = correlations.filter(c => 
      c.sameDayCount >= 3 && c.confidence > 0.5
    );
    
    strongSameDayCombinations.forEach(correlation => {
      insights.push({
        id: generateId(),
        type: 'combination',
        title: `Strong Same-Day Pairing`,
        description: `You often do ${correlation.sessionA} and ${correlation.sessionB} on the same day (${correlation.sameDayCount} times). This combination might be working well for you.`,
        sessions: [correlation.sessionA, correlation.sessionB],
        confidence: correlation.confidence,
        timingRecommendation: 'same day'
      });
    });
    
    // Find preparation sequences (mobility before strength)
    const preparationSequences = correlations.filter(c => {
      const isMobilityFirst = c.sessionA.toLowerCase().includes('mobility');
      const isStrengthSecond = c.sessionB.toLowerCase().includes('handstand') || 
                               c.sessionB.toLowerCase().includes('press') || 
                               c.sessionB.toLowerCase().includes('abs');
      return isMobilityFirst && isStrengthSecond && c.sequenceCount >= 2;
    });
    
    preparationSequences.forEach(correlation => {
      insights.push({
        id: generateId(),
        type: 'preparation',
        title: `Preparation Pattern`,
        description: `${correlation.sessionA} followed by ${correlation.sessionB} within 2 days has occurred ${correlation.sequenceCount} times. This suggests good preparation sequencing.`,
        sessions: [correlation.sessionA, correlation.sessionB],
        confidence: correlation.confidence,
        timingRecommendation: 'within 48 hours'
      });
    });
    
    // Find handstand focus patterns
    const handstandCorrelations = correlations.filter(c => 
      (c.sessionA.toLowerCase().includes('handstand') || c.sessionB.toLowerCase().includes('handstand')) &&
      c.sameDayCount >= 2
    );
    
    if (handstandCorrelations.length > 0) {
      const topHandstandPair = handstandCorrelations[0];
      insights.push({
        id: generateId(),
        type: 'sequence',
        title: `Handstand Training Pattern`,
        description: `Your handstand sessions are most often paired with ${topHandstandPair.sessionA.includes('handstand') ? topHandstandPair.sessionB : topHandstandPair.sessionA}. This suggests a successful training approach.`,
        sessions: [topHandstandPair.sessionA, topHandstandPair.sessionB],
        confidence: topHandstandPair.confidence,
        timingRecommendation: 'same day'
      });
    }
    
    return insights.sort((a, b) => b.confidence - a.confidence);
  },

  generateRecommendations(correlations: SessionCorrelation[], insights: SessionInsight[]): string[] {
    const recommendations: string[] = [];
    
    // Based on insights
    insights.forEach(insight => {
      if (insight.confidence > 0.7) {
        if (insight.type === 'preparation') {
          recommendations.push(`Consider doing ${insight.sessions[0]} before ${insight.sessions[1]} for optimal preparation.`);
        } else if (insight.type === 'combination') {
          recommendations.push(`${insight.sessions[0]} and ${insight.sessions[1]} work well together on the same day.`);
        }
      }
    });
    
    // Find gaps - sessions that are rarely combined but could be
    const mobilitySession = correlations.find(c => 
      c.sessionA.toLowerCase().includes('mobility: shoulder') && 
      c.sessionB.toLowerCase().includes('handstand')
    );
    
    if (!mobilitySession || mobilitySession.sameDayCount < 2) {
      recommendations.push(`Try combining shoulder mobility work with handstand practice for better preparation.`);
    }
    
    // Recovery recommendations
    const highIntensitySessions = ['Handstands', 'Press handstand', 'Handstand push-up'];
    const hasRecoveryPattern = correlations.some(c => 
      highIntensitySessions.includes(c.sessionA) && 
      c.sessionB.toLowerCase().includes('yin')
    );
    
    if (!hasRecoveryPattern) {
      recommendations.push(`Consider adding Yin yoga or gentle mobility work after intense handstand sessions.`);
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }
}

// Winners Bible Storage Module
export const winnersBibleStorage = {
  // Image management
  getImages: (): WinnersBibleImage[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('mm-winners-bible-images');
    if (!stored) return [];

    const images = safeParseJSON<WinnersBibleImage[]>(stored, []);
    return images.map(img => ({
      ...img,
      uploadedAt: new Date(img.uploadedAt)
    })).sort((a, b) => a.order - b.order);
  },

  saveImages: (images: WinnersBibleImage[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mm-winners-bible-images', JSON.stringify(images));
  },

  addImage: (imageData: Omit<WinnersBibleImage, 'id' | 'order' | 'uploadedAt'>): WinnersBibleImage[] => {
    const existingImages = winnersBibleStorage.getImages();

    // Limit to 15 images
    if (existingImages.length >= 15) {
      throw new Error('Maximum of 15 images allowed');
    }

    const newImage: WinnersBibleImage = {
      ...imageData,
      id: generateId(),
      order: existingImages.length,
      uploadedAt: new Date()
    };

    const updatedImages = [...existingImages, newImage];
    winnersBibleStorage.saveImages(updatedImages);
    return updatedImages;
  },

  removeImage: (imageId: string): WinnersBibleImage[] => {
    const existingImages = winnersBibleStorage.getImages();
    const filteredImages = existingImages.filter(img => img.id !== imageId);

    // Reorder remaining images
    const reorderedImages = filteredImages.map((img, index) => ({
      ...img,
      order: index
    }));

    winnersBibleStorage.saveImages(reorderedImages);
    return reorderedImages;
  },

  reorderImages: (imageIds: string[]): WinnersBibleImage[] => {
    const existingImages = winnersBibleStorage.getImages();
    const reorderedImages = imageIds.map((id, index) => {
      const image = existingImages.find(img => img.id === id);
      if (!image) throw new Error(`Image with id ${id} not found`);
      return { ...image, order: index };
    });

    winnersBibleStorage.saveImages(reorderedImages);
    return reorderedImages;
  },

  // Daily tracking
  getEntry: (date: string): WinnersBibleEntry | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`mm-winners-bible-${date}`);
    if (!stored) return null;

    const entry = safeParseJSON<WinnersBibleEntry | null>(stored, null);
    if (entry) {
      entry.createdAt = new Date(entry.createdAt);
      entry.updatedAt = new Date(entry.updatedAt);
      if (entry.morningViewedAt) entry.morningViewedAt = new Date(entry.morningViewedAt);
      if (entry.nightViewedAt) entry.nightViewedAt = new Date(entry.nightViewedAt);
    }
    return entry;
  },

  saveEntry: (entry: WinnersBibleEntry): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`mm-winners-bible-${entry.date}`, JSON.stringify(entry));
  },

  markViewed: (date: string, timeOfDay: 'morning' | 'night'): WinnersBibleEntry => {
    const existing = winnersBibleStorage.getEntry(date);
    const now = new Date();

    if (existing) {
      const updated: WinnersBibleEntry = {
        ...existing,
        [timeOfDay === 'morning' ? 'morningViewed' : 'nightViewed']: true,
        [timeOfDay === 'morning' ? 'morningViewedAt' : 'nightViewedAt']: now,
        updatedAt: now
      };
      winnersBibleStorage.saveEntry(updated);
      return updated;
    } else {
      const newEntry: WinnersBibleEntry = {
        id: generateId(),
        date,
        morningViewed: timeOfDay === 'morning',
        nightViewed: timeOfDay === 'night',
        morningViewedAt: timeOfDay === 'morning' ? now : undefined,
        nightViewedAt: timeOfDay === 'night' ? now : undefined,
        createdAt: now,
        updatedAt: now
      };
      winnersBibleStorage.saveEntry(newEntry);
      return newEntry;
    }
  },

  // Get completion status for daily tracker
  getCompletionStatus: (date: string): { morningCompleted: boolean; nightCompleted: boolean } => {
    const entry = winnersBibleStorage.getEntry(date);
    return {
      morningCompleted: entry?.morningViewed || false,
      nightCompleted: entry?.nightViewed || false
    };
  }
};

// Timezone Storage Module
export const timezoneStorage = {
  get: () => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('mm-timezone');
    if (stored) {
      return stored;
    }
    // Return browser's default timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  save: (timezone: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mm-timezone', timezone);
  },

  // Get the current date in the user's timezone
  getCurrentDate: (): string => {
    if (typeof window === 'undefined') {
      return new Date().toISOString().split('T')[0];
    }

    const timezone = timezoneStorage.get();
    if (!timezone) {
      return new Date().toISOString().split('T')[0];
    }

    // Create a date object in the user's timezone
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };

    const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD format
    return formatter.format(now);
  },

  // Check if a date is "today" in the user's timezone
  isToday: (dateString: string): boolean => {
    const currentDate = timezoneStorage.getCurrentDate();
    return dateString === currentDate;
  },

  // Get a list of common timezones for the settings dropdown
  getCommonTimezones: () => [
    { value: 'Pacific/Auckland', label: 'Auckland (GMT+12/+13)' },
    { value: 'Australia/Sydney', label: 'Sydney (GMT+10/+11)' },
    { value: 'Australia/Brisbane', label: 'Brisbane (GMT+10)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (GMT+8)' },
    { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
    { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
    { value: 'Asia/Kolkata', label: 'Mumbai (GMT+5:30)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
    { value: 'Europe/Moscow', label: 'Moscow (GMT+3)' },
    { value: 'Africa/Cairo', label: 'Cairo (GMT+2)' },
    { value: 'Europe/Berlin', label: 'Berlin (GMT+1/+2)' },
    { value: 'Europe/London', label: 'London (GMT+0/+1)' },
    { value: 'Atlantic/Azores', label: 'Azores (GMT-1/+0)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
    { value: 'America/New_York', label: 'New York (GMT-5/-4)' },
    { value: 'America/Chicago', label: 'Chicago (GMT-6/-5)' },
    { value: 'America/Denver', label: 'Denver (GMT-7/-6)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/-7)' },
    { value: 'Pacific/Honolulu', label: 'Honolulu (GMT-10)' }
  ]
};