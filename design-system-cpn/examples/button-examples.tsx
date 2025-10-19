// MM Design System - Button Examples
// Copy these patterns to implement buttons in your application

import React from 'react';

export function ButtonExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-heading text-mm-white">Button Examples</h2>

      {/* Primary Buttons */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Primary Buttons</h3>
        <div className="space-y-4">
          {/* Basic Primary Button */}
          <button className="btn-mm">
            Primary Button
          </button>

          {/* Primary Button with Icon */}
          <button className="btn-mm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Item
          </button>

          {/* Disabled Primary Button */}
          <button className="btn-mm" disabled>
            Disabled Button
          </button>

          {/* Full Width Primary Button */}
          <button className="btn-mm w-full">
            Full Width Button
          </button>
        </div>
      </section>

      {/* Secondary Buttons */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Secondary Buttons</h3>
        <div className="space-y-4">
          {/* Basic Secondary Button */}
          <button className="btn-secondary">
            Secondary Button
          </button>

          {/* Secondary Button with Icon */}
          <button className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </section>

      {/* Button Sizes */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Button Sizes</h3>
        <div className="space-y-4">
          {/* Small Button */}
          <button className="btn-mm text-sm py-2 px-4">
            Small Button
          </button>

          {/* Large Button */}
          <button className="btn-mm text-lg py-4 px-6">
            Large Button
          </button>
        </div>
      </section>

      {/* Icon-Only Buttons */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Icon-Only Buttons</h3>
        <div className="flex gap-4">
          {/* Edit Icon Button */}
          <button className="p-2 text-mm-gray hover:text-mm-white transition-colors rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Delete Icon Button */}
          <button className="p-2 text-mm-gray hover:text-red-400 transition-colors rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Share Icon Button */}
          <button className="p-2 text-mm-gray hover:text-mm-blue transition-colors rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
      </section>

      {/* Button Groups */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Button Groups</h3>
        <div className="flex gap-2">
          <button className="btn-mm">
            Save
          </button>
          <button className="btn-secondary">
            Cancel
          </button>
        </div>
      </section>

      {/* Loading States */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Loading States</h3>
        <div className="space-y-4">
          {/* Loading Button */}
          <button className="btn-mm" disabled>
            <div className="animate-pulse w-4 h-4 bg-mm-dark rounded-full"></div>
            Loading...
          </button>

          {/* Spinner Button */}
          <button className="btn-mm" disabled>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </button>
        </div>
      </section>
    </div>
  );
}

// Usage Examples:

// 1. Basic Usage
export const BasicButton = () => (
  <button className="btn-mm">
    Click Me
  </button>
);

// 2. Form Submit Button
export const SubmitButton = ({ isLoading }: { isLoading: boolean }) => (
  <button
    type="submit"
    className="btn-mm w-full"
    disabled={isLoading}
  >
    {isLoading ? 'Saving...' : 'Save Changes'}
  </button>
);

// 3. Action Button with Icon
export const AddDataButton = ({ onClick }: { onClick: () => void }) => (
  <button className="btn-mm" onClick={onClick}>
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    Add Data
  </button>
);

// 4. Edit Button (Icon Only)
export const EditButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="text-mm-gray hover:text-mm-white transition-colors p-1"
    onClick={onClick}
    title="Edit profile"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  </button>
);

// 5. Modal Close Button
export const ModalCloseButton = ({ onClose }: { onClose: () => void }) => (
  <button className="modal-close" onClick={onClose}>
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);