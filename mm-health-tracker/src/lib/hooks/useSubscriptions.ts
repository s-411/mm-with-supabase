import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionService } from '@/lib/services/subscriptions';
import { useProfile } from '@/lib/context-supabase';
import { queryKeys } from '@/lib/query-keys';
import type { Database } from '@/lib/supabase/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];
type SubscriptionCategory = Database['public']['Tables']['subscription_categories']['Row'];

/**
 * Hook to fetch all subscriptions for the current user
 */
export function useSubscriptions() {
  const { user } = useProfile();

  const query = useQuery({
    queryKey: queryKeys.subscriptions.all,
    queryFn: () => SubscriptionService.getSubscriptions(user?.id || ''),
    enabled: !!user?.id && typeof window !== 'undefined',
  });

  const monthlyTotal = SubscriptionService.calculateMonthlyTotal(query.data || []);
  const yearlyTotal = SubscriptionService.calculateYearlyTotal(query.data || []);

  return {
    subscriptions: query.data || [],
    monthlyTotal,
    yearlyTotal,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch subscriptions by category
 */
export function useSubscriptionsByCategory(categoryId: string | null) {
  const { user } = useProfile();

  return useQuery({
    queryKey: queryKeys.subscriptions.byCategory(categoryId || ''),
    queryFn: () => {
      if (!categoryId || !user?.id) return [];
      return SubscriptionService.getSubscriptionsByCategory(user.id, categoryId);
    },
    enabled: !!user?.id && !!categoryId && typeof window !== 'undefined',
  });
}

/**
 * Hook to add a new subscription
 */
export function useAddSubscription() {
  const queryClient = useQueryClient();
  const { user } = useProfile();

  return useMutation({
    mutationFn: async (subscription: Omit<SubscriptionInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      return SubscriptionService.addSubscription({
        ...subscription,
        user_id: user.id,
      });
    },
    onSuccess: () => {
      // Invalidate all subscription queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.byCategory(''),
        refetchType: 'all'
      });
    },
  });
}

/**
 * Hook to update a subscription
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SubscriptionUpdate }) => {
      return SubscriptionService.updateSubscription(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      // Cancel pending queries
      await queryClient.cancelQueries({ queryKey: queryKeys.subscriptions.all });

      // Snapshot previous value
      const previous = queryClient.getQueryData(queryKeys.subscriptions.all);

      // Optimistically update
      queryClient.setQueryData(queryKeys.subscriptions.all, (old: Subscription[] | undefined) => {
        if (!old) return old;
        return old.map(sub => sub.id === id ? { ...sub, ...updates } : sub);
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.subscriptions.all, context.previous);
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.byCategory(''),
        refetchType: 'all'
      });
    },
  });
}

/**
 * Hook to delete a subscription
 */
export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      return SubscriptionService.deleteSubscription(subscriptionId);
    },
    onMutate: async (subscriptionId) => {
      // Cancel pending queries
      await queryClient.cancelQueries({ queryKey: queryKeys.subscriptions.all });

      // Snapshot previous value
      const previous = queryClient.getQueryData(queryKeys.subscriptions.all);

      // Optimistically remove the subscription
      queryClient.setQueryData(queryKeys.subscriptions.all, (old: Subscription[] | undefined) => {
        if (!old) return old;
        return old.filter(sub => sub.id !== subscriptionId);
      });

      return { previous };
    },
    onError: (_error, _subscriptionId, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.subscriptions.all, context.previous);
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.byCategory(''),
        refetchType: 'all'
      });
    },
  });
}

/**
 * Hook to fetch all categories for the current user
 */
export function useCategories() {
  const { user } = useProfile();

  return useQuery({
    queryKey: queryKeys.subscriptions.categories.all,
    queryFn: () => SubscriptionService.getCategories(user?.id || ''),
    enabled: !!user?.id && typeof window !== 'undefined',
  });
}

/**
 * Hook to add a new category
 */
export function useAddCategory() {
  const queryClient = useQueryClient();
  const { user } = useProfile();

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return SubscriptionService.addCategory({
        user_id: user.id,
        name,
        color: color || '#00A1FE',
      });
    },
    onSuccess: () => {
      // Invalidate category queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.categories.all });
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name?: string; color?: string }) => {
      return SubscriptionService.updateCategory(id, { name, color });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.categories.all });
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { user } = useProfile();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First, remove this category from all subscriptions
      const subscriptions = await SubscriptionService.getSubscriptions(user.id);
      const updates = subscriptions
        .filter(sub => sub.category_ids?.includes(categoryId))
        .map(sub => ({
          id: sub.id,
          category_ids: sub.category_ids?.filter(id => id !== categoryId) || [],
        }));

      // Update all subscriptions that have this category
      await Promise.all(
        updates.map(({ id, category_ids }) =>
          SubscriptionService.updateSubscription(id, { category_ids })
        )
      );

      // Then delete the category
      return SubscriptionService.deleteCategory(categoryId);
    },
    onSuccess: () => {
      // Invalidate both category and subscription queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.byCategory(''),
        refetchType: 'all'
      });
    },
  });
}