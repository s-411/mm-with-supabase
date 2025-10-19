// MM Design System - Form Examples
// Copy these patterns to implement forms in your application

import React, { useState } from 'react';

export function FormExamples() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    rating: 6.0,
    ethnicity: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-heading text-mm-white">Form Examples</h2>

      {/* Basic Form Fields */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Basic Form Fields</h3>
        <div className="space-y-4 max-w-md">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-mm-gray mb-1">
              Name <span className="text-mm-blue">*</span>
            </label>
            <input
              type="text"
              className="input-mm"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            {errors.name && (
              <p className="text-error">{errors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-mm-gray mb-1">
              Email
            </label>
            <input
              type="email"
              className="input-mm"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          {/* Number Input */}
          <div>
            <label className="block text-sm font-medium text-mm-gray mb-1">
              Age <span className="text-mm-blue">*</span>
            </label>
            <input
              type="number"
              className="input-mm"
              placeholder="18+"
              min="18"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            />
            {errors.age && (
              <p className="text-error">{errors.age}</p>
            )}
          </div>

          {/* Select Dropdown */}
          <div>
            <label className="block text-sm font-medium text-mm-gray mb-1">
              Ethnicity (Optional)
            </label>
            <select
              className="select-mm"
              value={formData.ethnicity}
              onChange={(e) => setFormData(prev => ({ ...prev, ethnicity: e.target.value }))}
            >
              <option value="">Prefer not to say</option>
              <option value="asian">Asian</option>
              <option value="black">Black</option>
              <option value="hispanic">Hispanic/Latino</option>
              <option value="white">White</option>
              <option value="middle-eastern">Middle Eastern</option>
              <option value="mixed">Mixed</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-sm font-medium text-mm-gray mb-1">
              Description
            </label>
            <textarea
              className="input-mm min-h-[100px] resize-vertical"
              placeholder="Optional description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>
      </section>

      {/* Rating Tiles (Hotness Rating) */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Rating Tiles</h3>
        <div>
          <label className="block text-sm font-medium text-mm-gray mb-3">
            Hotness Rating
          </label>

          {/* First Row: 5.0 - 7.5 */}
          <div className="grid grid-cols-6 gap-2 mb-2">
            {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5].map((rating) => (
              <button
                key={rating}
                type="button"
                className={`rating-tile ${formData.rating === rating ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, rating }))}
              >
                {rating}
              </button>
            ))}
          </div>

          {/* Second Row: 8.0 - 10.0 */}
          <div className="grid grid-cols-5 gap-2">
            {[8.0, 8.5, 9.0, 9.5, 10.0].map((rating) => (
              <button
                key={rating}
                type="button"
                className={`rating-tile ${formData.rating === rating ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, rating }))}
              >
                {rating}
              </button>
            ))}
          </div>

          {/* Rating Labels */}
          <div className="flex justify-between text-xs text-mm-gray mt-2">
            <span>5.0-6.0: Below Average</span>
            <span>8.5-10.0: Exceptional</span>
          </div>
        </div>
      </section>

      {/* Form States */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Form States</h3>
        <div className="space-y-4 max-w-md">
          {/* Success State */}
          <div>
            <label className="block text-sm font-medium text-mm-gray mb-1">
              Success Input
            </label>
            <input
              type="text"
              className="input-mm border-green-500"
              value="Valid input"
              readOnly
            />
            <p className="text-success">Input is valid!</p>
          </div>

          {/* Error State */}
          <div>
            <label className="block text-sm font-medium text-mm-gray mb-1">
              Error Input
            </label>
            <input
              type="text"
              className="input-mm border-red-500"
              value="Invalid input"
              readOnly
            />
            <p className="text-error">This field is required</p>
          </div>

          {/* Disabled State */}
          <div>
            <label className="block text-sm font-medium text-mm-gray mb-1">
              Disabled Input
            </label>
            <input
              type="text"
              className="input-mm"
              value="Cannot edit"
              disabled
            />
          </div>
        </div>
      </section>

      {/* Form Actions */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Form Actions</h3>
        <div className="flex gap-3">
          <button type="submit" className="btn-mm">
            Save Changes
          </button>
          <button type="button" className="btn-secondary">
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

// Usage Examples:

// 1. Basic Input Field Component
export const InputField = ({
  label,
  required = false,
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
  [key: string]: any;
}) => (
  <div>
    <label className="block text-sm font-medium text-mm-gray mb-1">
      {label}
      {required && <span className="text-mm-blue ml-1">*</span>}
    </label>
    <input
      className={`input-mm ${error ? 'border-red-500' : ''}`}
      {...props}
    />
    {error && <p className="text-error">{error}</p>}
  </div>
);

// 2. Select Field Component
export const SelectField = ({
  label,
  options,
  required = false,
  error,
  ...props
}: {
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  [key: string]: any;
}) => (
  <div>
    <label className="block text-sm font-medium text-mm-gray mb-1">
      {label}
      {required && <span className="text-mm-blue ml-1">*</span>}
    </label>
    <select
      className={`select-mm ${error ? 'border-red-500' : ''}`}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-error">{error}</p>}
  </div>
);

// 3. Rating Selector Component
export const RatingSelector = ({
  value,
  onChange,
  label = "Rating"
}: {
  value: number;
  onChange: (rating: number) => void;
  label?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-mm-gray mb-3">
      {label}
    </label>

    {/* First Row: 5.0 - 7.5 */}
    <div className="grid grid-cols-6 gap-2 mb-2">
      {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5].map((rating) => (
        <button
          key={rating}
          type="button"
          className={`rating-tile ${value === rating ? 'selected' : ''}`}
          onClick={() => onChange(rating)}
        >
          {rating}
        </button>
      ))}
    </div>

    {/* Second Row: 8.0 - 10.0 */}
    <div className="grid grid-cols-5 gap-2">
      {[8.0, 8.5, 9.0, 9.5, 10.0].map((rating) => (
        <button
          key={rating}
          type="button"
          className={`rating-tile ${value === rating ? 'selected' : ''}`}
          onClick={() => onChange(rating)}
        >
          {rating}
        </button>
      ))}
    </div>

    <div className="flex justify-between text-xs text-mm-gray mt-2">
      <span>5.0-6.0: Below Average</span>
      <span>8.5-10.0: Exceptional</span>
    </div>
  </div>
);

// 4. Form with Validation
export const ValidatedForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    rating: 6.0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age) || age < 18) {
      newErrors.age = 'Age must be 18 or older';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Submit logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Form submitted:', formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <InputField
        label="Name"
        required
        value={formData.name}
        onChange={(e: any) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        error={errors.name}
        placeholder="Enter name"
      />

      <InputField
        label="Age"
        type="number"
        required
        value={formData.age}
        onChange={(e: any) => setFormData(prev => ({ ...prev, age: e.target.value }))}
        error={errors.age}
        placeholder="18+"
        min="18"
      />

      <RatingSelector
        value={formData.rating}
        onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
      />

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="btn-mm"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};