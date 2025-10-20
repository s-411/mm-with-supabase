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
    byDate: (date: string) => [...queryKeys.daily.all, date] as const,
    calories: (date: string) => [...queryKeys.daily.byDate(date), 'calories'] as const,
    exercises: (date: string) => [...queryKeys.daily.byDate(date), 'exercises'] as const,
    mits: (date: string) => [...queryKeys.daily.byDate(date), 'mits'] as const,
    weight: (date: string) => [...queryKeys.daily.byDate(date), 'weight'] as const,
    // Range queries for analytics
    range: (start: string, end: string) =>
      [...queryKeys.daily.all, 'range', start, end] as const,
  },

  /**
   * Weekly objectives and Friday reviews
   */
  weekly: {
    all: ['weekly'] as const,
    byWeek: (weekStart: string) => [...queryKeys.weekly.all, weekStart] as const,
    objectives: (weekStart: string) =>
      [...queryKeys.weekly.byWeek(weekStart), 'objectives'] as const,
    review: (weekStart: string) =>
      [...queryKeys.weekly.byWeek(weekStart), 'review'] as const,
  },

  /**
   * Injection entries
   */
  injections: {
    all: ['injections'] as const,
    byDateRange: (start: string, end: string) =>
      [...queryKeys.injections.all, start, end] as const,
  },

  /**
   * Nirvana training system (sessions, milestones, records)
   */
  nirvana: {
    all: ['nirvana'] as const,
    sessions: {
      all: [...queryKeys.nirvana.all, 'sessions'] as const,
      byDate: (date: string) =>
        [...queryKeys.nirvana.sessions.all, date] as const,
    },
    weekly: {
      all: [...queryKeys.nirvana.all, 'weekly'] as const,
      byWeek: (weekStart: string) =>
        [...queryKeys.nirvana.weekly.all, weekStart] as const,
    },
    milestones: {
      all: [...queryKeys.nirvana.all, 'milestones'] as const,
    },
    personalRecords: {
      all: [...queryKeys.nirvana.all, 'personalRecords'] as const,
    },
    bodyPartMappings: {
      all: [...queryKeys.nirvana.all, 'bodyPartMappings'] as const,
    },
  },

  /**
   * Winners Bible image system
   */
  winnersBible: {
    all: ['winnersBible'] as const,
    images: () => [...queryKeys.winnersBible.all, 'images'] as const,
    status: (date: string) =>
      [...queryKeys.winnersBible.all, 'status', date] as const,
  },

  /**
   * Settings and configuration
   */
  settings: {
    all: ['settings'] as const,
    profile: () => [...queryKeys.settings.all, 'profile'] as const,
    macroTargets: () => [...queryKeys.settings.all, 'macroTargets'] as const,
    compounds: () => [...queryKeys.settings.all, 'compounds'] as const,
    foodTemplates: () => [...queryKeys.settings.all, 'foodTemplates'] as const,
    sessionTypes: () => [...queryKeys.settings.all, 'sessionTypes'] as const,
    trackerSettings: () => [...queryKeys.settings.all, 'trackerSettings'] as const,
  },
} as const;

/**
 * Type helpers for extracting query key types
 */
export type QueryKey = typeof queryKeys;
export type DailyQueryKey = ReturnType<typeof queryKeys.daily.byDate>;
export type WeeklyQueryKey = ReturnType<typeof queryKeys.weekly.byWeek>;
export type InjectionsQueryKey = ReturnType<typeof queryKeys.injections.byDateRange>;
