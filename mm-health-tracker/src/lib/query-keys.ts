/**
 * Query Key Factories for TanStack Query
 *
 * Centralized query key management for type safety and consistency.
 * Using hierarchical keys enables efficient cache invalidation.
 *
 * Pattern:
 * - ['resource'] - all items of that resource
 * - ['resource', id] - specific item
 * - ['resource', id, 'relation'] - related data
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

export const queryKeys = {
  /**
   * Daily entries and related data (calories, exercises, MITs, weight)
   */
  daily: {
    all: ['daily'] as const,
    byDate: (date: string) => ['daily', date] as const,
    calories: (date: string) => ['daily', date, 'calories'] as const,
    exercises: (date: string) => ['daily', date, 'exercises'] as const,
    mits: (date: string) => ['daily', date, 'mits'] as const,
    weight: (date: string) => ['daily', date, 'weight'] as const,
    // Range queries for analytics
    range: (start: string, end: string) => ['daily', 'range', start, end] as const,
  },

  /**
   * Weekly objectives and Friday reviews
   */
  weekly: {
    all: ['weekly'] as const,
    byWeek: (weekStart: string) => ['weekly', weekStart] as const,
    objectives: (weekStart: string) => ['weekly', weekStart, 'objectives'] as const,
    review: (weekStart: string) => ['weekly', weekStart, 'review'] as const,
  },

  /**
   * Injection entries
   */
  injections: {
    all: ['injections'] as const,
    byDateRange: (start: string, end: string) => ['injections', start, end] as const,
  },

  /**
   * Nirvana training system (sessions, milestones, records)
   */
  nirvana: {
    all: ['nirvana'] as const,
    sessions: {
      all: ['nirvana', 'sessions'] as const,
      byDate: (date: string) => ['nirvana', 'sessions', date] as const,
    },
    weekly: {
      all: ['nirvana', 'weekly'] as const,
      byWeek: (weekStart: string) => ['nirvana', 'weekly', weekStart] as const,
    },
    milestones: {
      all: ['nirvana', 'milestones'] as const,
    },
    personalRecords: {
      all: ['nirvana', 'personalRecords'] as const,
    },
    bodyPartMappings: {
      all: ['nirvana', 'bodyPartMappings'] as const,
    },
  },

  /**
   * Winners Bible image system
   */
  winnersBible: {
    all: ['winnersBible'] as const,
    images: () => ['winnersBible', 'images'] as const,
    status: (date: string) => ['winnersBible', 'status', date] as const,
  },

  /**
   * Settings and configuration
   */
  settings: {
    all: ['settings'] as const,
    profile: () => ['settings', 'profile'] as const,
    macroTargets: () => ['settings', 'macroTargets'] as const,
    compounds: () => ['settings', 'compounds'] as const,
    foodTemplates: () => ['settings', 'foodTemplates'] as const,
    sessionTypes: () => ['settings', 'sessionTypes'] as const,
    trackerSettings: () => ['settings', 'trackerSettings'] as const,
  },
} as const;

/**
 * Type helpers for extracting query key types
 */
export type QueryKey = typeof queryKeys;
export type DailyQueryKey = ReturnType<typeof queryKeys.daily.byDate>;
export type WeeklyQueryKey = ReturnType<typeof queryKeys.weekly.byWeek>;
export type InjectionsQueryKey = ReturnType<typeof queryKeys.injections.byDateRange>;
