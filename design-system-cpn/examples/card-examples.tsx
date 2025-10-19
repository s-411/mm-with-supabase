// MM Design System - Card Examples
// Copy these patterns to implement cards in your application

import React from 'react';

export function CardExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-heading text-mm-white">Card Examples</h2>

      {/* Basic Cards */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Basic Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Standard Card */}
          <div className="card-mm">
            <h4 className="text-lg font-heading text-mm-white mb-2">Standard Card</h4>
            <p className="text-mm-gray text-sm">
              This is a basic card with standard styling. Perfect for displaying content
              with consistent spacing and borders.
            </p>
          </div>

          {/* Card with Header */}
          <div className="card-mm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-heading text-mm-white">Card with Header</h4>
              <button className="text-mm-gray hover:text-mm-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
            <p className="text-mm-gray text-sm">
              Card with header actions and proper spacing.
            </p>
          </div>

          {/* Hoverable Card */}
          <div className="card-mm hover:border-mm-yellow/30 transition-all duration-200 group cursor-pointer">
            <h4 className="text-lg font-heading text-mm-white group-hover:text-mm-blue transition-colors mb-2">
              Hoverable Card
            </h4>
            <p className="text-mm-gray text-sm">
              This card has hover effects with smooth transitions.
            </p>
          </div>
        </div>
      </section>

      {/* Glass Cards */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Glass Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Glass Card */}
          <div className="glass-card">
            <h4 className="text-lg font-heading text-mm-white mb-2">Glass Effect Card</h4>
            <p className="text-mm-gray text-sm">
              Semi-transparent card with backdrop blur effect for modern glassmorphism design.
            </p>
          </div>

          {/* Glass Card with Content */}
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-mm-yellow rounded-full flex items-center justify-center">
                <span className="text-mm-dark font-bold">CPN</span>
              </div>
              <div>
                <h4 className="text-lg font-heading text-mm-white">Glass Card</h4>
                <p className="text-xs text-mm-gray">With avatar and content</p>
              </div>
            </div>
            <p className="text-mm-gray text-sm">
              Enhanced glass card with avatar and structured content layout.
            </p>
          </div>
        </div>
      </section>

      {/* Data Cards */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Data Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Statistics Card */}
          <div className="card-mm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-heading text-mm-white">Sarah</h3>
                <p className="text-sm text-mm-gray">24 • Mixed</p>
                <div className="mt-1">
                  <span className="text-sm font-medium text-mm-blue">8.5</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-mm-gray hover:text-mm-blue transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <button className="text-mm-gray hover:text-mm-white transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-mm-gray">Total Spent</p>
                  <p className="font-medium text-mm-white">$2,450</p>
                </div>
                <div>
                  <p className="text-mm-gray">Total Nuts</p>
                  <p className="font-medium text-mm-white">15</p>
                </div>
                <div>
                  <p className="text-mm-gray">Cost/Nut</p>
                  <p className="font-medium text-mm-blue">$163.33</p>
                </div>
                <div>
                  <p className="text-mm-gray">Total Time</p>
                  <p className="font-medium text-mm-white">12.5h</p>
                </div>
              </div>

              <div className="text-xs text-mm-gray pt-2 border-t border-mm-gray/10">
                8 entries
              </div>
            </div>

            <button className="w-full btn-mm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Data
            </button>
          </div>

          {/* Summary Card */}
          <div className="card-mm">
            <h4 className="text-lg font-heading text-mm-white mb-4">Monthly Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-mm-gray">Total Spent</span>
                <span className="text-mm-white font-medium">$1,234.56</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mm-gray">Total Sessions</span>
                <span className="text-mm-white font-medium">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mm-gray">Avg Cost/Session</span>
                <span className="text-mm-blue font-medium">$53.68</span>
              </div>
            </div>
          </div>

          {/* Empty State Card */}
          <div className="card-mm">
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-mm-gray/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-mm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h4 className="text-lg font-heading text-mm-white mb-2">No Data Yet</h4>
              <p className="text-mm-gray text-sm mb-4">
                Add your first entry to see metrics and analytics.
              </p>
              <button className="btn-mm">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Card Layouts */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Card Layouts</h3>

        {/* Horizontal Card */}
        <div className="card-mm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-mm-yellow rounded-lg flex items-center justify-center">
              <span className="text-2xl font-heading text-mm-dark">JD</span>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-heading text-mm-white">Jane Doe</h4>
              <p className="text-sm text-mm-gray">22 • Asian • 9.0 Rating</p>
              <p className="text-xs text-mm-gray mt-1">Last session: 2 days ago</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium text-mm-blue">$156.50</p>
              <p className="text-xs text-mm-gray">Cost/Nut</p>
            </div>
          </div>
        </div>

        {/* Card with Actions */}
        <div className="card-mm mt-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-heading text-mm-white">Recent Activity</h4>
              <p className="text-sm text-mm-gray">Last updated 5 minutes ago</p>
            </div>
            <button className="btn-secondary text-sm py-1 px-3">
              View All
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-mm-gray/10">
              <span className="text-mm-white">Added new entry for Sarah</span>
              <span className="text-xs text-mm-gray">2 min ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-mm-gray/10">
              <span className="text-mm-white">Updated profile for Emma</span>
              <span className="text-xs text-mm-gray">1 hour ago</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-mm-white">Created new profile</span>
              <span className="text-xs text-mm-gray">3 hours ago</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Usage Examples:

// 1. Basic Profile Card Component
export const ProfileCard = ({
  name,
  age,
  ethnicity,
  rating,
  totalSpent,
  totalNuts,
  costPerNut,
  totalTime,
  entryCount,
  onEdit,
  onAddData
}: {
  name: string;
  age: number;
  ethnicity: string;
  rating: number;
  totalSpent: number;
  totalNuts: number;
  costPerNut: number;
  totalTime: number;
  entryCount: number;
  onEdit: () => void;
  onAddData: () => void;
}) => (
  <div className="card-mm hover:border-mm-yellow/30 transition-all duration-200 group">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-2xl font-heading text-mm-white group-hover:text-mm-blue transition-colors">
          {name}
        </h3>
        <p className="text-sm text-mm-gray">
          {age} • {ethnicity}
        </p>
        <div className="mt-1">
          <span className="text-sm font-medium text-mm-blue">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="text-mm-gray hover:text-mm-white transition-colors p-1"
        title="Edit profile"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>

    <div className="space-y-3 mb-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-mm-gray">Total Spent</p>
          <p className="font-medium text-mm-white">${totalSpent.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-mm-gray">Total Nuts</p>
          <p className="font-medium text-mm-white">{totalNuts}</p>
        </div>
        <div>
          <p className="text-mm-gray">Cost/Nut</p>
          <p className="font-medium text-mm-blue">${costPerNut.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-mm-gray">Total Time</p>
          <p className="font-medium text-mm-white">{totalTime}h</p>
        </div>
      </div>

      <div className="text-xs text-mm-gray pt-2 border-t border-mm-gray/10">
        {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
      </div>
    </div>

    <button
      onClick={onAddData}
      className="w-full btn-mm flex items-center justify-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Add Data
    </button>
  </div>
);

// 2. Statistics Card Component
export const StatCard = ({
  title,
  value,
  subtitle,
  trend,
  icon
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}) => (
  <div className="card-mm">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium text-mm-gray">{title}</h4>
      {icon && <div className="text-mm-gray">{icon}</div>}
    </div>
    <p className="text-2xl font-heading text-mm-white mb-1">{value}</p>
    {subtitle && (
      <p className={`text-xs ${
        trend === 'up' ? 'text-green-400' :
        trend === 'down' ? 'text-red-400' :
        'text-mm-gray'
      }`}>
        {subtitle}
      </p>
    )}
  </div>
);

// 3. Empty State Card Component
export const EmptyStateCard = ({
  title,
  description,
  actionText,
  onAction,
  icon
}: {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  icon?: React.ReactNode;
}) => (
  <div className="card-mm">
    <div className="text-center py-6">
      {icon && (
        <div className="w-12 h-12 bg-mm-gray/20 rounded-full flex items-center justify-center mx-auto mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-lg font-heading text-mm-white mb-2">{title}</h4>
      <p className="text-mm-gray text-sm mb-4">{description}</p>
      <button className="btn-mm" onClick={onAction}>
        {actionText}
      </button>
    </div>
  </div>
);