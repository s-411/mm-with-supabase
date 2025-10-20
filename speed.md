# App Performance Optimization with TanStack Query

## Problem Summary

The app feels laggy with 1-2 second delays on user interactions because it uses a **pessimistic-then-update** pattern:

**Current Flow (Slow):**
```
User clicks → Wait for Supabase → Get response → Update UI
                    ↓
              1-2 second delay here
```

**What we had with localStorage (Fast):**
```
User clicks → Update UI immediately
```

## The Solution: TanStack Query (React Query)

Replace custom hooks with TanStack Query, which handles optimistic updates, caching, and rollbacks automatically.

### Why TanStack Query?

**Benefits:**
- **Automatic caching** - data fetched once, shared across components
- **Background refetching** - keeps data fresh automatically
- **Optimistic updates** - UI updates instantly with automatic rollback
- **Request deduplication** - multiple components can request same data, only one network call
- **Retry logic** - automatic retries on failure
- **Loading/error states** - unified across the app
- **DevTools** - incredible debugging experience

**Why it's perfect for this app:**
1. **8 metrics being tracked** - caching prevents redundant fetches
2. **Multiple hooks fetch overlapping data** - Query deduplication saves network calls
3. **User interactions are frequent** - optimistic updates are critical
4. **Service-based architecture** - minimal refactoring needed
5. **Future-proof** - as features are added, Query handles complexity automatically

## Migration Plan (4-5 Days Total)

### Phase 1: Setup (30 min)

**Install dependency:**
```bash
npm install @tanstack/react-query
```

**Wrap app in QueryClientProvider:**
```typescript
// src/app/layout.tsx or src/app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Phase 2: Convert Hooks (1-2 days)

Replace custom hooks with TanStack Query equivalents. Keep existing services unchanged.

#### Example: Convert `useDaily`

**Before (current code):**
```typescript
// src/lib/hooks/useDaily.ts
export function useDaily(date: string) {
  const [data, setData] = useState<DailyData>({ ... });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadDailyData(); }, [date]);

  const addCalorieEntry = useCallback(async (entry) => {
    const newEntry = await dailyService.addCalorieEntry(date, entry);
    setData(prev => ({ ...prev, calories: [...prev.calories, newEntry] }));
    return newEntry;
  }, [date]);

  return { entry, calories, exercises, mits, loading, error, addCalorieEntry, ... };
}
```

**After (with TanStack Query):**
```typescript
// src/lib/hooks/useDaily.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyService } from '@/lib/services/daily.service';
import { useApp } from '@/lib/context-supabase';

// Query key factory for type safety and consistency
export const dailyKeys = {
  all: ['daily'] as const,
  byDate: (date: string) => [...dailyKeys.all, date] as const,
  calories: (date: string) => [...dailyKeys.byDate(date), 'calories'] as const,
  exercises: (date: string) => [...dailyKeys.byDate(date), 'exercises'] as const,
  mits: (date: string) => [...dailyKeys.byDate(date), 'mits'] as const,
};

// Main data fetching hook
export function useDaily(date: string) {
  const { user } = useApp();
  const queryClient = useQueryClient();

  // Service instance helper
  const getDailyService = useCallback(async () => {
    if (!user?.id) throw new Error('Not authenticated');
    const profileService = new ProfileService(supabase);
    const profile = await profileService.get(user.id);
    if (!profile) throw new Error('Profile not found');
    return new DailyService(supabase, profile.id);
  }, [user?.id]);

  // Fetch all daily data
  const { data, isLoading, error } = useQuery({
    queryKey: dailyKeys.byDate(date),
    queryFn: async () => {
      const service = await getDailyService();
      const [entry, calories, exercises, mits] = await Promise.all([
        service.getByDate(date),
        service.getCalorieEntries(date),
        service.getExerciseEntries(date),
        service.getMITs(date),
      ]);
      return { entry, calories, exercises, mits };
    },
    enabled: !!user?.id,
  });

  return {
    entry: data?.entry ?? null,
    calories: data?.calories ?? [],
    exercises: data?.exercises ?? [],
    mits: data?.mits ?? [],
    isLoading,
    error: error?.message ?? null,
  };
}

// Mutation hook for adding calorie entry
export function useAddCalorieEntry(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (entry: {
      food_name: string;
      calories: number;
      carbs?: number;
      protein?: number;
      fat?: number;
    }) => {
      const service = await getDailyService(user);
      return service.addCalorieEntry(date, entry);
    },

    // OPTIMISTIC UPDATE: UI updates instantly
    onMutate: async (newEntry) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: dailyKeys.byDate(date) });

      // Snapshot the previous value
      const previous = queryClient.getQueryData(dailyKeys.byDate(date));

      // Optimistically update to the new value
      queryClient.setQueryData(dailyKeys.byDate(date), (old: any) => ({
        ...old,
        calories: [...(old?.calories ?? []), { ...newEntry, id: 'temp-' + Date.now() }],
      }));

      // Return context with snapshot
      return { previous };
    },

    // ROLLBACK on error
    onError: (err, newEntry, context) => {
      queryClient.setQueryData(dailyKeys.byDate(date), context?.previous);
      console.error('Failed to add calorie entry:', err);
    },

    // SYNC after settled
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dailyKeys.byDate(date) });
    },
  });
}

// Mutation hook for deleting calorie entry
export function useDeleteCalorieEntry(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const service = await getDailyService(user);
      return service.deleteCalorieEntry(entryId);
    },

    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey: dailyKeys.byDate(date) });
      const previous = queryClient.getQueryData(dailyKeys.byDate(date));

      // Remove entry optimistically
      queryClient.setQueryData(dailyKeys.byDate(date), (old: any) => ({
        ...old,
        calories: old?.calories?.filter((c: any) => c.id !== entryId) ?? [],
      }));

      return { previous };
    },

    onError: (err, entryId, context) => {
      queryClient.setQueryData(dailyKeys.byDate(date), context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dailyKeys.byDate(date) });
    },
  });
}

// Mutation hook for toggling deep work
export function useToggleDeepWork(date: string) {
  const queryClient = useQueryClient();
  const { user } = useApp();

  return useMutation({
    mutationFn: async () => {
      const service = await getDailyService(user);
      return service.toggleDeepWork(date);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: dailyKeys.byDate(date) });
      const previous = queryClient.getQueryData(dailyKeys.byDate(date));

      // Toggle optimistically
      queryClient.setQueryData(dailyKeys.byDate(date), (old: any) => ({
        ...old,
        entry: {
          ...old?.entry,
          deep_work_completed: !old?.entry?.deep_work_completed,
        },
      }));

      return { previous };
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(dailyKeys.byDate(date), context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dailyKeys.byDate(date) });
    },
  });
}

// Similar mutation hooks for:
// - useUpdateWeight(date)
// - useAddMIT(date)
// - useDeleteMIT(date)
// - useToggleMIT(date)
```

#### Component Usage

**Before:**
```typescript
const {
  entry,
  calories,
  loading,
  error,
  addCalorieEntry,
  removeCalorieEntry,
  toggleDeepWork,
} = useDaily(currentDate);

// In handlers:
await addCalorieEntry({ food_name: 'Chicken', calories: 350 });
await toggleDeepWork();
```

**After:**
```typescript
const { entry, calories, isLoading, error } = useDaily(currentDate);
const addCalorieMutation = useAddCalorieEntry(currentDate);
const deleteCalorieMutation = useDeleteCalorieEntry(currentDate);
const toggleDeepWorkMutation = useToggleDeepWork(currentDate);

// In handlers (instant UI updates):
addCalorieMutation.mutate({ food_name: 'Chicken', calories: 350 });
toggleDeepWorkMutation.mutate();

// Can also await if needed:
await addCalorieMutation.mutateAsync({ food_name: 'Chicken', calories: 350 });
```

### Phase 3: Add Optimistic Updates (1 day)

Add `onMutate` handlers for all mutations:

**Critical mutations to optimize:**
1. ✅ Toggle Deep Work
2. ✅ Add/Delete Calorie Entry
3. ✅ Add/Delete Exercise Entry
4. ✅ Update Weight
5. ✅ Add/Delete/Toggle MITs
6. ✅ Toggle Weekly Objectives
7. ✅ Update Friday Review
8. ✅ Toggle Winners Bible (morning/night)
9. ✅ Add/Delete Injections
10. ✅ Add/Delete Nirvana Sessions

**Pattern for all mutations:**
```typescript
export function useSomeMutation(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      // Call service
      return await service.doSomething(data);
    },

    onMutate: async (data) => {
      // 1. Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['key', date] });

      // 2. Snapshot previous value
      const previous = queryClient.getQueryData(['key', date]);

      // 3. Optimistically update
      queryClient.setQueryData(['key', date], (old) => {
        // Return new optimistic state
      });

      // 4. Return context for rollback
      return { previous };
    },

    onError: (err, data, context) => {
      // Rollback to previous state
      queryClient.setQueryData(['key', date], context?.previous);
    },

    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['key', date] });
    },
  });
}
```

### Phase 4: Polish (1 day)

**Cleanup:**
- Remove unnecessary `reload()` calls from components
- Remove old `useState` for data (keep only UI state like `showWeightForm`)
- Remove old `useEffect` data fetching logic

**Configure background refetch:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // Consider fresh for 5 min
      gcTime: 1000 * 60 * 10,          // Keep in cache for 10 min
      refetchOnWindowFocus: true,      // Refetch when user returns to tab
      refetchOnReconnect: true,        // Refetch when network reconnects
      refetchInterval: 1000 * 60 * 5,  // Background refetch every 5 min (optional)
    },
  },
});
```

**Add loading skeletons** (optional but nice):
```typescript
{isLoading ? (
  <div className="animate-pulse bg-mm-gray/20 h-20 rounded-lg" />
) : (
  <div className="card-mm p-3">
    {/* Content */}
  </div>
)}
```

**Test edge cases:**
- Network offline → comes back online
- Concurrent mutations (user clicks multiple things rapidly)
- Race conditions (user changes date while mutation is pending)
- Error states (server returns 400/500)

## Migration Checklist

### Setup
- [ ] Install `@tanstack/react-query`
- [ ] Create `QueryClient` with default options
- [ ] Wrap app in `QueryClientProvider`
- [ ] Add `ReactQueryDevtools` (dev only)

### Convert Hooks
- [ ] `useDaily` → `useQuery` + mutation hooks
- [ ] `useWeekly` → `useQuery` + mutation hooks
- [ ] `useInjections` → `useQuery` + mutation hooks
- [ ] `useNirvana` → `useQuery` + mutation hooks
- [ ] `useWinnersBible` → `useQuery` + mutation hooks
- [ ] `useMacroTargets` → `useQuery` + mutation hooks

### Add Optimistic Updates
- [ ] Toggle Deep Work
- [ ] Add/Delete Calorie Entry
- [ ] Add/Delete Exercise Entry
- [ ] Update Weight
- [ ] Add/Delete/Toggle MITs
- [ ] Toggle Weekly Objectives
- [ ] Update Weekly Objectives
- [ ] Update Friday Review
- [ ] Toggle Winners Bible (morning/night)
- [ ] Add/Delete Injections
- [ ] Add/Delete Nirvana Sessions

### Component Updates
- [ ] `src/app/daily/page.tsx`
- [ ] `src/app/calories/page.tsx`
- [ ] `src/app/injections/page.tsx`
- [ ] `src/app/nirvana/page.tsx`
- [ ] `src/app/winners-bible/page.tsx`
- [ ] `src/app/settings/page.tsx`

### Polish
- [ ] Remove old `reload()` calls
- [ ] Remove old `useState` for data
- [ ] Remove old `useEffect` data fetching
- [ ] Add loading skeletons
- [ ] Test offline/online scenarios
- [ ] Test concurrent mutations
- [ ] Test error rollbacks
- [ ] Configure background refetch intervals

## Expected Performance Gains

**Before:**
- Toggle action: 2-4 seconds
- Add entry: 2-4 seconds
- Delete entry: 2-4 seconds
- Page navigation: Fresh fetch every time (1-2 seconds)

**After:**
- Toggle action: **0ms perceived latency**
- Add entry: **0ms perceived latency**
- Delete entry: **0ms perceived latency**
- Page navigation: **Instant** (cached data)

## Key Query Keys Structure

```typescript
// Query key factory pattern for consistency
export const queryKeys = {
  daily: {
    all: ['daily'] as const,
    byDate: (date: string) => [...queryKeys.daily.all, date] as const,
  },
  weekly: {
    all: ['weekly'] as const,
    byWeek: (weekStart: string) => [...queryKeys.weekly.all, weekStart] as const,
  },
  injections: {
    all: ['injections'] as const,
    byDateRange: (start: string, end: string) =>
      [...queryKeys.injections.all, start, end] as const,
  },
  nirvana: {
    all: ['nirvana'] as const,
    byDate: (date: string) => [...queryKeys.nirvana.all, date] as const,
  },
  winnersBible: {
    all: ['winnersBible'] as const,
    entries: () => [...queryKeys.winnersBible.all, 'entries'] as const,
  },
  settings: {
    all: ['settings'] as const,
    macroTargets: () => [...queryKeys.settings.all, 'macroTargets'] as const,
  },
};
```

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Query Key Factories](https://tkdodo.eu/blog/effective-react-query-keys)
- [Practical React Query](https://tkdodo.eu/blog/practical-react-query) (excellent blog series)

## Notes

- Services (`DailyService`, `WeeklyService`, etc.) **remain unchanged**
- Keep existing `context-supabase.tsx` for auth state
- TanStack Query replaces only the **data fetching/mutation** logic
- Can migrate incrementally (hook by hook, page by page)
- DevTools are invaluable for debugging cache state
