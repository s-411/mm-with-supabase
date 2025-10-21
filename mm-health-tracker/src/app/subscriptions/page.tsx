'use client';

import React, { useState, useEffect } from 'react';
import {
  useSubscriptions,
  useAddSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  useCategories,
  useAddCategory,
  useDeleteCategory,
} from '@/lib/hooks/useSubscriptions';
import { formatDateForDisplay } from '@/lib/dateUtils';
import {
  PlusIcon,
  XMarkIcon,
  CreditCardIcon,
  TrashIcon,
  TagIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import type { Database } from '@/lib/supabase/database.types';

// Force dynamic rendering to avoid hydration issues
export const dynamic = 'force-dynamic';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionCategory = Database['public']['Tables']['subscription_categories']['Row'];

export default function SubscriptionsPage() {
  const { subscriptions, monthlyTotal, yearlyTotal, isLoading } = useSubscriptions();
  const { data: categories = [] } = useCategories();
  const addSubscriptionMutation = useAddSubscription();
  const updateSubscriptionMutation = useUpdateSubscription();
  const deleteSubscriptionMutation = useDeleteSubscription();
  const addCategoryMutation = useAddCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    billing_date: '',
    billing_frequency: 'monthly' as 'monthly' | 'yearly' | 'weekly' | 'quarterly',
    category_ids: [] as string[],
    notes: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#00A1FE',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter subscriptions by selected category
  const filteredSubscriptions = selectedFilter
    ? subscriptions.filter(sub => sub.category_ids?.includes(selectedFilter))
    : subscriptions;

  // Calculate totals for filtered subscriptions
  const filteredMonthlyTotal = filteredSubscriptions
    .filter(sub => sub.active !== false)
    .reduce((total, sub) => {
      let monthlyAmount = Number(sub.price) || 0;
      switch (sub.billing_frequency) {
        case 'weekly':
          monthlyAmount = monthlyAmount * 4.33;
          break;
        case 'quarterly':
          monthlyAmount = monthlyAmount / 3;
          break;
        case 'yearly':
          monthlyAmount = monthlyAmount / 12;
          break;
      }
      return total + monthlyAmount;
    }, 0);

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.price.trim() || parseFloat(formData.price) <= 0) {
      errors.price = 'Please enter a valid price';
    }
    if (!formData.billing_date) errors.billing_date = 'Billing date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await addSubscriptionMutation.mutateAsync({
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        billing_date: formData.billing_date,
        billing_frequency: formData.billing_frequency,
        category_ids: formData.category_ids,
        notes: formData.notes.trim() || null,
        active: true,
      });

      // Reset form
      setFormData({
        name: '',
        price: '',
        billing_date: '',
        billing_frequency: 'monthly',
        category_ids: [],
        notes: '',
      });
      setFormErrors({});
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding subscription:', error);
      setFormErrors({ submit: 'Failed to add subscription. Please try again.' });
    }
  };

  const handleDeleteSubscription = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteSubscriptionMutation.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
      setDeleteConfirmName('');
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Failed to delete subscription. Please try again.');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryForm.name.trim()) {
      setFormErrors({ categoryName: 'Category name is required' });
      return;
    }

    // Check for duplicate category
    if (categories.some(cat => cat.name.toLowerCase() === categoryForm.name.trim().toLowerCase())) {
      setFormErrors({ categoryName: 'Category already exists' });
      return;
    }

    try {
      await addCategoryMutation.mutateAsync({
        name: categoryForm.name.trim(),
        color: categoryForm.color,
      });

      setCategoryForm({ name: '', color: '#00A1FE' });
      setShowCategoryForm(false);
      setFormErrors({});
    } catch (error) {
      console.error('Error adding category:', error);
      setFormErrors({ categorySubmit: 'Failed to add category. Please try again.' });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? It will be removed from all subscriptions.')) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const toggleCategorySelection = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }));
  };

  const formatPrice = (price: number, frequency: string | null) => {
    const formatted = `$${price.toFixed(2)}`;
    const frequencyLabel = frequency === 'yearly' ? '/yr' :
                          frequency === 'weekly' ? '/wk' :
                          frequency === 'quarterly' ? '/qtr' : '/mo';
    return `${formatted}${frequencyLabel}`;
  };

  const getNextBillingDate = (billingDate: string, frequency: string | null) => {
    const date = new Date(billingDate + 'T12:00:00');
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    while (date < today) {
      switch (frequency) {
        case 'weekly':
          date.setDate(date.getDate() + 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + 1);
          break;
        case 'quarterly':
          date.setMonth(date.getMonth() + 3);
          break;
        case 'yearly':
          date.setFullYear(date.getFullYear() + 1);
          break;
        default:
          date.setMonth(date.getMonth() + 1);
      }
    }

    return date;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-mm-gray">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading mb-2">Subscriptions</h1>
        <p className="text-mm-gray">Track and manage your recurring subscriptions</p>
      </div>

      {/* Totals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-mm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-mm-gray mb-1">Monthly Total</p>
              <p className="text-2xl font-bold text-mm-blue">${filteredMonthlyTotal.toFixed(2)}</p>
            </div>
            <CreditCardIcon className="w-8 h-8 text-mm-blue opacity-50" />
          </div>
        </div>
        <div className="card-mm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-mm-gray mb-1">Yearly Total</p>
              <p className="text-2xl font-bold">${(filteredMonthlyTotal * 12).toFixed(2)}</p>
            </div>
            <CreditCardIcon className="w-8 h-8 text-mm-gray opacity-50" />
          </div>
        </div>
        <div className="card-mm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-mm-gray mb-1">Active Subscriptions</p>
              <p className="text-2xl font-bold">{filteredSubscriptions.filter(s => s.active !== false).length}</p>
            </div>
            <CheckIcon className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-mm flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Subscription
        </button>

        <button
          onClick={() => setShowCategoryForm(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <TagIcon className="w-5 h-5" />
          Add Category
        </button>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-mm-gray" />
          <select
            value={selectedFilter || ''}
            onChange={(e) => setSelectedFilter(e.target.value || null)}
            className="input-mm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories List */}
      {categories.length > 0 && (
        <div className="card-mm p-4 mb-6">
          <h3 className="text-sm font-semibold text-mm-gray mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="flex items-center gap-2 px-3 py-1 rounded-full border border-mm-gray/30"
                style={{ backgroundColor: `${cat.color}20`, borderColor: cat.color }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm">{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-0.5 hover:bg-red-500/20 rounded-full transition-colors"
                  title="Delete category"
                >
                  <XMarkIcon className="w-3 h-3 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filteredSubscriptions.length === 0 ? (
          <div className="card-mm p-12 text-center">
            <CreditCardIcon className="w-12 h-12 mx-auto mb-4 text-mm-gray opacity-50" />
            <p className="text-mm-gray mb-4">
              {selectedFilter ? 'No subscriptions in this category' : 'No subscriptions yet'}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-mm"
            >
              Add Your First Subscription
            </button>
          </div>
        ) : (
          filteredSubscriptions.map(subscription => {
            const nextBilling = getNextBillingDate(subscription.billing_date, subscription.billing_frequency);
            const daysUntil = Math.ceil((nextBilling.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const subscriptionCategories = categories.filter(cat =>
              subscription.category_ids?.includes(cat.id)
            );

            return (
              <div key={subscription.id} className={`card-mm p-6 ${subscription.active === false ? 'opacity-60' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left side - Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{subscription.name}</h3>
                      {subscription.active === false && (
                        <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full">Inactive</span>
                      )}
                    </div>

                    {/* Categories */}
                    {subscriptionCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {subscriptionCategories.map(cat => (
                          <span
                            key={cat.id}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${cat.color}30`, color: cat.color }}
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-mm-gray">
                      <span>Next billing: {formatDateForDisplay(nextBilling.toISOString().split('T')[0])} ({daysUntil} days)</span>
                      {subscription.notes && (
                        <span className="italic">{subscription.notes}</span>
                      )}
                    </div>
                  </div>

                  {/* Right side - Price and Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-mm-blue">
                        {formatPrice(Number(subscription.price), subscription.billing_frequency)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDeleteConfirmId(subscription.id);
                        setDeleteConfirmName(subscription.name);
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Remove subscription"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Subscription Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-mm-dark2 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-heading mb-4">Add Subscription</h2>

            <form onSubmit={handleAddSubscription} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-mm-gray mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-mm w-full"
                  placeholder="Netflix, Spotify, etc."
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm text-mm-gray mb-2">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="input-mm w-full"
                  placeholder="9.99"
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                )}
              </div>

              {/* Billing Date */}
              <div>
                <label className="block text-sm text-mm-gray mb-2">Billing Date *</label>
                <input
                  type="date"
                  value={formData.billing_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, billing_date: e.target.value }))}
                  className="input-mm w-full"
                />
                {formErrors.billing_date && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.billing_date}</p>
                )}
              </div>

              {/* Billing Frequency */}
              <div>
                <label className="block text-sm text-mm-gray mb-2">Billing Frequency</label>
                <select
                  value={formData.billing_frequency}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    billing_frequency: e.target.value as 'monthly' | 'yearly' | 'weekly' | 'quarterly'
                  }))}
                  className="input-mm w-full"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm text-mm-gray mb-2">Categories</label>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.category_ids.includes(cat.id)}
                          onChange={() => toggleCategorySelection(cat.id)}
                          className="rounded border-mm-gray/30"
                        />
                        <span className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm text-mm-gray mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-mm w-full"
                  rows={3}
                  placeholder="Optional notes..."
                />
              </div>

              {formErrors.submit && (
                <p className="text-red-500 text-sm">{formErrors.submit}</p>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addSubscriptionMutation.isPending}
                  className="btn-mm flex-1"
                >
                  {addSubscriptionMutation.isPending ? 'Adding...' : 'Add Subscription'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormErrors({});
                    setFormData({
                      name: '',
                      price: '',
                      billing_date: '',
                      billing_frequency: 'monthly',
                      category_ids: [],
                      notes: '',
                    });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-mm-dark2 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-heading mb-4">Add Category</h2>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm text-mm-gray mb-2">Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-mm w-full"
                  placeholder="Entertainment, Work, etc."
                />
                {formErrors.categoryName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.categoryName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-mm-gray mb-2">Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                    className="h-10 w-20"
                  />
                  <span className="text-sm text-mm-gray">{categoryForm.color}</span>
                </div>
              </div>

              {formErrors.categorySubmit && (
                <p className="text-red-500 text-sm">{formErrors.categorySubmit}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={addCategoryMutation.isPending}
                  className="btn-mm flex-1"
                >
                  {addCategoryMutation.isPending ? 'Adding...' : 'Add Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setFormErrors({});
                    setCategoryForm({ name: '', color: '#00A1FE' });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-mm-dark2 rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
              <h3 className="text-lg font-heading">Delete Subscription</h3>
            </div>
            <p className="text-mm-gray mb-6">
              Are you sure you want to delete <strong>{deleteConfirmName}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteSubscription}
                disabled={deleteSubscriptionMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex-1"
              >
                {deleteSubscriptionMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName('');
                }}
                className="btn-secondary px-4 py-2 rounded-lg flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}