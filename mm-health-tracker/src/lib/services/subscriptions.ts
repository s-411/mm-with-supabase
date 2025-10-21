import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

type SubscriptionCategory = Database['public']['Tables']['subscription_categories']['Row'];
type SubscriptionCategoryInsert = Database['public']['Tables']['subscription_categories']['Insert'];

export class SubscriptionService {
  /**
   * Get all subscriptions for a user
   */
  static async getSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('billing_date', { ascending: true });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single subscription by ID
   */
  static async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }

    return data;
  }

  /**
   * Add a new subscription
   */
  static async addSubscription(subscription: Omit<SubscriptionInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();

    if (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing subscription
   */
  static async updateSubscription(
    subscriptionId: string,
    updates: SubscriptionUpdate
  ): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a subscription
   */
  static async deleteSubscription(subscriptionId: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }

  /**
   * Get all categories for a user
   */
  static async getCategories(userId: string): Promise<SubscriptionCategory[]> {
    const { data, error } = await supabase
      .from('subscription_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Add a new category
   */
  static async addCategory(category: Omit<SubscriptionCategoryInsert, 'id' | 'created_at' | 'updated_at'>): Promise<SubscriptionCategory> {
    const { data, error } = await supabase
      .from('subscription_categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a category
   */
  static async updateCategory(
    categoryId: string,
    updates: Partial<Pick<SubscriptionCategory, 'name' | 'color'>>
  ): Promise<SubscriptionCategory> {
    const { data, error } = await supabase
      .from('subscription_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a category
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('subscription_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Get subscriptions by category
   */
  static async getSubscriptionsByCategory(userId: string, categoryId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .contains('category_ids', [categoryId])
      .order('billing_date', { ascending: true });

    if (error) {
      console.error('Error fetching subscriptions by category:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Calculate monthly total for active subscriptions
   */
  static calculateMonthlyTotal(subscriptions: Subscription[]): number {
    return subscriptions
      .filter(sub => sub.active !== false)
      .reduce((total, sub) => {
        let monthlyAmount = Number(sub.price) || 0;

        // Convert to monthly based on billing frequency
        switch (sub.billing_frequency) {
          case 'weekly':
            monthlyAmount = monthlyAmount * 4.33; // Average weeks per month
            break;
          case 'quarterly':
            monthlyAmount = monthlyAmount / 3;
            break;
          case 'yearly':
            monthlyAmount = monthlyAmount / 12;
            break;
          // 'monthly' is already in the right format
        }

        return total + monthlyAmount;
      }, 0);
  }

  /**
   * Calculate yearly total for active subscriptions
   */
  static calculateYearlyTotal(subscriptions: Subscription[]): number {
    return subscriptions
      .filter(sub => sub.active !== false)
      .reduce((total, sub) => {
        let yearlyAmount = Number(sub.price) || 0;

        // Convert to yearly based on billing frequency
        switch (sub.billing_frequency) {
          case 'weekly':
            yearlyAmount = yearlyAmount * 52;
            break;
          case 'monthly':
            yearlyAmount = yearlyAmount * 12;
            break;
          case 'quarterly':
            yearlyAmount = yearlyAmount * 4;
            break;
          // 'yearly' is already in the right format
        }

        return total + yearlyAmount;
      }, 0);
  }
}