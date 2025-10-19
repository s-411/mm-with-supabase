// MM Health Tracker - Core Data Models
// Based on roadmap specifications

export interface UserProfile {
  id: string;
  bmr: number;           // Basal Metabolic Rate - critical for calculations
  height: number;        // cm
  weight: number;        // kg
  gender: 'male' | 'female' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyEntry {
  id: string;
  date: string;          // YYYY-MM-DD format (unique per day)
  calories: CalorieEntry[];
  exercises: ExerciseEntry[];
  weight?: number;       // Daily weight entry (optional)
  deepWorkCompleted: boolean;
  injections: InjectionEntry[];
  customMetrics?: CustomMetricEntry[];  // Custom daily metrics
  mits?: MITEntry[];     // Most Important Tasks for tomorrow
  winnersBibleMorning?: boolean;  // Morning Winners Bible viewing
  winnersBibleNight?: boolean;    // Night Winners Bible viewing
  createdAt: Date;
  updatedAt: Date;
}

export interface CalorieEntry {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  timestamp: Date;
}

export interface ExerciseEntry {
  id: string;
  type: string;
  duration: number;      // minutes
  caloriesBurned: number;
  timestamp: Date;
}

export interface InjectionEntry {
  id: string;
  compound: 'Testosterone' | 'Maralyn' | 'Rita Trutard' | string;
  dosage: number;
  unit: string;
  notes?: string;
  timestamp: Date;
}

export interface InjectionTarget {
  id: string;
  compound: string;
  doseAmount: number;
  unit: string;
  frequency: number; // times per week
  weeklyTarget: number; // calculated: doseAmount * frequency
  enabled: boolean;
}

export interface MITEntry {
  id: string;
  task: string;
  completed: boolean;
  order: number;
}

export interface WeeklyObjective {
  id: string;
  objective: string;
  completed: boolean;
  order: number;
}

export interface WeeklyEntry {
  id: string;
  weekStartDate: string;  // Monday's date in YYYY-MM-DD format
  objectives: WeeklyObjective[];
  whyImportant: string;
  fridayReview?: string;
  reviewCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Custom metrics interfaces
export interface CustomMetricDefinition {
  id: string;
  name: string;
  type: 'number' | 'scale' | 'boolean' | 'text';
  enabled: boolean;
  unit?: string;        // For number types (e.g., 'hours', 'glasses')
  min?: number;         // For scale types
  max?: number;         // For scale types
  options?: string[];   // For select types (future)
}

// Winners Bible interfaces
export interface WinnersBibleImage {
  id: string;
  name: string;
  base64Data: string;   // Base64 encoded image data
  mimeType: string;     // image/jpeg, image/png, etc.
  size: number;         // File size in bytes
  order: number;        // Display order
  uploadedAt: Date;
}

export interface WinnersBibleEntry {
  id: string;
  date: string;         // YYYY-MM-DD format
  morningViewed: boolean;
  nightViewed: boolean;
  morningViewedAt?: Date;
  nightViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomMetricEntry {
  id: string;
  metricId: string;     // References CustomMetricDefinition.id
  value: number | boolean | string;
  timestamp: Date;
}

export interface DailyTrackerSettings {
  enableWeight: boolean;
  enableDeepWork: boolean;
  enableCustomMetrics: boolean;
  customMetrics: CustomMetricDefinition[];
}

// Nirvana session tracking
export interface NirvanaSession {
  id: string;
  sessionType: string;
  timestamp: Date;
}

export interface NirvanaEntry {
  id: string;
  date: string;  // YYYY-MM-DD format
  sessions: NirvanaSession[];
  createdAt: Date;
  updatedAt: Date;
}

// Nirvana progress tracking
export interface NirvanaMilestone {
  id: string;
  title: string;
  description: string;
  category: 'handstand' | 'flexibility' | 'strength' | 'balance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  completedDate?: Date;
  targetValue?: number; // For time-based milestones (seconds)
  unit?: string; // 'seconds', 'reps', 'cm', etc.
  order: number; // Display order within category
}

export interface PersonalRecord {
  id: string;
  name: string;
  category: 'handstand' | 'flexibility' | 'strength' | 'balance';
  value: number;
  unit: string; // 'seconds', 'reps', 'cm', 'degrees'
  recordDate: Date;
  previousValue?: number;
  previousDate?: Date;
  notes?: string;
}

export interface NirvanaProgress {
  id: string;
  milestones: NirvanaMilestone[];
  personalRecords: PersonalRecord[];
  createdAt: Date;
  updatedAt: Date;
}

// Body part focus tracking
export interface SessionTypeMapping {
  sessionType: string;
  bodyParts: BodyPart[];
  intensity: 'low' | 'medium' | 'high'; // Training intensity for this body part
}

export interface BodyPart {
  id: string;
  name: string;
  category: 'upper' | 'core' | 'lower';
  position: { x: number; y: number }; // Position on body diagram (percentage)
}

export interface BodyPartUsage {
  bodyPartId: string;
  name: string;
  category: string;
  sessionCount: number;
  lastTrained: Date | null;
  averageIntensity: number;
  position: { x: number; y: number };
}

// Session correlation analysis
export interface SessionCorrelation {
  sessionA: string;
  sessionB: string;
  sameDayCount: number; // Times they occurred on same day
  sequenceCount: number; // Times A preceded B within 2 days
  successRate: number; // Success rate when combined (0-1)
  confidence: number; // Statistical confidence (0-1)
}

export interface SessionInsight {
  id: string;
  type: 'preparation' | 'sequence' | 'combination' | 'recovery';
  title: string;
  description: string;
  sessions: string[];
  confidence: number;
  timingRecommendation?: string; // e.g., "same day", "within 24 hours"
}

export interface CorrelationAnalysis {
  correlations: SessionCorrelation[];
  insights: SessionInsight[];
  recommendations: string[];
  analysisDate: Date;
}

// Form data interfaces for validation
export interface CalorieFormData {
  name: string;
  calories: string;
  carbs: string;
  protein: string;
  fat: string;
}

export interface ExerciseFormData {
  type: string;
  duration: string;
  caloriesBurned: string;
}

export interface InjectionFormData {
  compound: string;
  dosage: string;
  unit: string;
  notes?: string;
}

export interface ProfileFormData {
  bmr: string;
  height: string;
  weight: string;
  gender: 'male' | 'female' | 'other';
}

// Calculated metrics for dashboard
export interface DailyMetrics {
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  calorieBalance: number;     // BMR - consumed + burned
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  completionStatus: {
    calories: boolean;
    exercise: boolean;
    weight: boolean;
    deepWork: boolean;
    mits: boolean;
  };
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MacroChartData {
  carbs: number;
  protein: number;
  fat: number;
}

// Navigation types
export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

// Global app state
export interface AppState {
  profile: UserProfile | null;
  currentDate: string;
  dailyEntries: Record<string, DailyEntry>;
  isLoading: boolean;
  error: string | null;
}

// Action types for reducer
export type AppAction =
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_CURRENT_DATE'; payload: string }
  | { type: 'ADD_CALORIE_ENTRY'; payload: { date: string; entry: CalorieEntry } }
  | { type: 'ADD_EXERCISE_ENTRY'; payload: { date: string; entry: ExerciseEntry } }
  | { type: 'ADD_INJECTION_ENTRY'; payload: { date: string; entry: InjectionEntry } }
  | { type: 'UPDATE_WEIGHT'; payload: { date: string; weight: number } }
  | { type: 'TOGGLE_DEEP_WORK'; payload: { date: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: { profile: UserProfile | null; dailyEntries: Record<string, DailyEntry> } };