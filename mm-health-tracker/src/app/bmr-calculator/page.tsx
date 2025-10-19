'use client';

import React, { useState, useEffect } from 'react';
import { profileStorage } from '@/lib/storage';
import { UserProfile } from '@/types';
import { CalculatorIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function BMRCalculatorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other'
  });
  const [calculatedBMR, setCalculatedBMR] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const existingProfile = profileStorage.get();
    if (existingProfile) {
      setProfile(existingProfile);
      setFormData({
        height: existingProfile.height ? existingProfile.height.toString() : '',
        weight: existingProfile.weight ? existingProfile.weight.toString() : '',
        age: '30', // Default age
        gender: existingProfile.gender || 'male'
      });
    }
  }, []);

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const age = parseFloat(formData.age);

    if (!height || !weight || !age) return;

    let bmr: number;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (formData.gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      // For 'other', use average of male and female formulas
      const maleBMR = 10 * weight + 6.25 * height - 5 * age + 5;
      const femaleBMR = 10 * weight + 6.25 * height - 5 * age - 161;
      bmr = (maleBMR + femaleBMR) / 2;
    }

    setCalculatedBMR(Math.round(bmr));
  };

  const saveBMRToProfile = () => {
    if (!calculatedBMR) return;

    const profileData = {
      bmr: calculatedBMR,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      gender: formData.gender
    };

    if (profile) {
      const updated = profileStorage.update(profileData);
      if (updated) setProfile(updated);
    } else {
      const newProfile = profileStorage.create(profileData);
      setProfile(newProfile);
    }

    setIsSaved(true);
    
    // Redirect to settings after a short delay
    setTimeout(() => {
      router.push('/settings');
    }, 1500);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setCalculatedBMR(null); // Reset calculation when inputs change
    setIsSaved(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
            <CalculatorIcon className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl font-heading">BMR Calculator</h1>
            <p className="text-mm-gray">Calculate your Basal Metabolic Rate for accurate calorie tracking</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="card-mm p-6">
          <h2 className="text-xl font-heading mb-6">Enter Your Information</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-mm-gray mb-2">Height (cm) *</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="175"
                  className="input-mm w-full"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm text-mm-gray mb-2">Weight (kg) *</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="70"
                  className="input-mm w-full"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-mm-gray mb-2">Age (years) *</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="30"
                  className="input-mm w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-mm-gray mb-2">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="input-mm w-full"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              onClick={calculateBMR}
              disabled={!formData.height || !formData.weight || !formData.age}
              className="btn-mm w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate My BMR
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="card-mm p-6">
          <h2 className="text-xl font-heading mb-6">Your BMR Result</h2>
          
          {!calculatedBMR ? (
            <div className="text-center py-12">
              <CalculatorIcon className="w-16 h-16 text-mm-gray/50 mx-auto mb-4" />
              <p className="text-mm-gray">Enter your information and click calculate to see your BMR</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                <div className="text-4xl font-heading text-green-500 mb-2">
                  {calculatedBMR}
                </div>
                <p className="text-lg font-medium mb-1">Calories per day</p>
                <p className="text-sm text-mm-gray">Your Basal Metabolic Rate</p>
              </div>

              {!isSaved ? (
                <button
                  onClick={saveBMRToProfile}
                  className="btn-mm w-full py-3"
                >
                  Save to Profile & Continue
                </button>
              ) : (
                <div className="bg-mm-blue/10 border border-mm-blue/30 rounded-lg p-4 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-mm-blue mr-2" />
                  <span className="text-mm-blue font-medium">BMR saved to your profile!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Information Section */}
      <div className="mt-8 space-y-6">
        <div className="card-mm p-6">
          <h3 className="text-lg font-heading mb-4">About BMR Calculation</h3>
          <div className="space-y-3 text-sm text-mm-gray">
            <p>
              <strong>BMR (Basal Metabolic Rate)</strong> is the number of calories your body burns at rest to maintain basic physiological functions.
            </p>
            <p>
              This calculator uses the <strong>Mifflin-St Jeor Equation</strong>, which is considered one of the most accurate methods for estimating BMR.
            </p>
            <p>
              <strong>How we use your BMR:</strong> Daily Balance = BMR - Food Calories + Exercise Calories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card text-center p-4">
            <div className="text-lg font-heading text-mm-blue mb-2">Step 1</div>
            <div className="text-sm text-mm-gray">Calculate your BMR here</div>
          </div>
          
          <div className="glass-card text-center p-4">
            <div className="text-lg font-heading text-mm-blue mb-2">Step 2</div>
            <div className="text-sm text-mm-gray">Save it to your profile</div>
          </div>
          
          <div className="glass-card text-center p-4">
            <div className="text-lg font-heading text-mm-blue mb-2">Step 3</div>
            <div className="text-sm text-mm-gray">Start tracking calories</div>
          </div>
        </div>
      </div>
    </div>
  );
}