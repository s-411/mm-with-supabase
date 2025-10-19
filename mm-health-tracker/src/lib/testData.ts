// TEST DATA UTILITY - FOR LOCAL DEVELOPMENT ONLY
// This file should NOT be deployed to production
// It can be safely deleted without affecting real user data

import { dailyEntryStorage } from './storage';
import { v4 as uuidv4 } from 'uuid';

interface TestDayData {
  date: string;
  calories: Array<{
    id: string;
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    timestamp: Date;
  }>;
  exercises: Array<{
    id: string;
    type: string;
    duration: number;
    caloriesBurned: number;
    timestamp: Date;
  }>;
  deepWorkCompleted: boolean;
}

// Generate test data for the past 5 days
// Based on: 80kg male, 1800 cal target, 170g protein target, 40g fat target
const generateTestData = (): TestDayData[] => {
  const testDays: TestDayData[] = [];
  const today = new Date();
  
  // Day 1 (yesterday) - Good day, met all goals
  const day1 = new Date(today);
  day1.setDate(today.getDate() - 1);
  testDays.push({
    date: day1.toISOString().split('T')[0],
    calories: [
      {
        id: uuidv4(),
        name: 'Greek Yogurt with Berries',
        calories: 280,
        carbs: 25,
        protein: 35,
        fat: 8,
        timestamp: new Date(day1.setHours(8, 30))
      },
      {
        id: uuidv4(),
        name: 'Grilled Chicken Salad',
        calories: 450,
        carbs: 20,
        protein: 55,
        fat: 12,
        timestamp: new Date(day1.setHours(12, 45))
      },
      {
        id: uuidv4(),
        name: 'Protein Shake',
        calories: 320,
        carbs: 8,
        protein: 40,
        fat: 15,
        timestamp: new Date(day1.setHours(15, 20))
      },
      {
        id: uuidv4(),
        name: 'Salmon with Sweet Potato',
        calories: 520,
        carbs: 35,
        protein: 45,
        fat: 18,
        timestamp: new Date(day1.setHours(19, 15))
      },
      {
        id: uuidv4(),
        name: 'Almonds',
        calories: 160,
        carbs: 6,
        protein: 6,
        fat: 14,
        timestamp: new Date(day1.setHours(21, 0))
      }
    ],
    exercises: [
      {
        id: uuidv4(),
        type: 'Weight Training',
        duration: 75,
        caloriesBurned: 320,
        timestamp: new Date(day1.setHours(17, 0))
      }
    ],
    deepWorkCompleted: true
  });

  // Day 2 (2 days ago) - Overate, didn't hit protein goal
  const day2 = new Date(today);
  day2.setDate(today.getDate() - 2);
  testDays.push({
    date: day2.toISOString().split('T')[0],
    calories: [
      {
        id: uuidv4(),
        name: 'Pancakes with Syrup',
        calories: 520,
        carbs: 85,
        protein: 12,
        fat: 18,
        timestamp: new Date(day2.setHours(9, 15))
      },
      {
        id: uuidv4(),
        name: 'Turkey Sandwich',
        calories: 380,
        carbs: 45,
        protein: 25,
        fat: 8,
        timestamp: new Date(day2.setHours(13, 20))
      },
      {
        id: uuidv4(),
        name: 'Pizza (2 slices)',
        calories: 640,
        carbs: 72,
        protein: 28,
        fat: 26,
        timestamp: new Date(day2.setHours(18, 45))
      },
      {
        id: uuidv4(),
        name: 'Ice Cream',
        calories: 280,
        carbs: 35,
        protein: 6,
        fat: 16,
        timestamp: new Date(day2.setHours(21, 30))
      }
    ],
    exercises: [
      {
        id: uuidv4(),
        type: 'Cardio (Treadmill)',
        duration: 30,
        caloriesBurned: 280,
        timestamp: new Date(day2.setHours(7, 30))
      }
    ],
    deepWorkCompleted: false
  });

  // Day 3 (3 days ago) - Light eating day, good protein, in deficit
  const day3 = new Date(today);
  day3.setDate(today.getDate() - 3);
  testDays.push({
    date: day3.toISOString().split('T')[0],
    calories: [
      {
        id: uuidv4(),
        name: 'Protein Smoothie',
        calories: 290,
        carbs: 15,
        protein: 35,
        fat: 12,
        timestamp: new Date(day3.setHours(8, 0))
      },
      {
        id: uuidv4(),
        name: 'Chicken Breast with Rice',
        calories: 420,
        carbs: 45,
        protein: 48,
        fat: 5,
        timestamp: new Date(day3.setHours(12, 30))
      },
      {
        id: uuidv4(),
        name: 'Cottage Cheese with Nuts',
        calories: 280,
        carbs: 8,
        protein: 28,
        fat: 18,
        timestamp: new Date(day3.setHours(16, 0))
      },
      {
        id: uuidv4(),
        name: 'Lean Beef with Vegetables',
        calories: 380,
        carbs: 20,
        protein: 42,
        fat: 15,
        timestamp: new Date(day3.setHours(19, 30))
      }
    ],
    exercises: [
      {
        id: uuidv4(),
        type: 'Swimming',
        duration: 45,
        caloriesBurned: 360,
        timestamp: new Date(day3.setHours(18, 0))
      }
    ],
    deepWorkCompleted: true
  });

  // Day 4 (4 days ago) - High fat day, moderate protein
  const day4 = new Date(today);
  day4.setDate(today.getDate() - 4);
  testDays.push({
    date: day4.toISOString().split('T')[0],
    calories: [
      {
        id: uuidv4(),
        name: 'Avocado Toast with Eggs',
        calories: 480,
        carbs: 35,
        protein: 20,
        fat: 32,
        timestamp: new Date(day4.setHours(9, 45))
      },
      {
        id: uuidv4(),
        name: 'Caesar Salad with Chicken',
        calories: 390,
        carbs: 18,
        protein: 35,
        fat: 24,
        timestamp: new Date(day4.setHours(13, 15))
      },
      {
        id: uuidv4(),
        name: 'Nuts and Seeds Mix',
        calories: 340,
        carbs: 12,
        protein: 15,
        fat: 28,
        timestamp: new Date(day4.setHours(16, 30))
      },
      {
        id: uuidv4(),
        name: 'Pork Chop with Quinoa',
        calories: 520,
        carbs: 42,
        protein: 38,
        fat: 22,
        timestamp: new Date(day4.setHours(20, 0))
      }
    ],
    exercises: [
      {
        id: uuidv4(),
        type: 'Cycling',
        duration: 60,
        caloriesBurned: 420,
        timestamp: new Date(day4.setHours(7, 15))
      }
    ],
    deepWorkCompleted: true
  });

  // Day 5 (5 days ago) - Lazy day, minimal exercise, hit protein but over calories
  const day5 = new Date(today);
  day5.setDate(today.getDate() - 5);
  testDays.push({
    date: day5.toISOString().split('T')[0],
    calories: [
      {
        id: uuidv4(),
        name: 'Protein Cereal with Milk',
        calories: 350,
        carbs: 35,
        protein: 28,
        fat: 12,
        timestamp: new Date(day5.setHours(10, 30))
      },
      {
        id: uuidv4(),
        name: 'Burger with Fries',
        calories: 820,
        carbs: 62,
        protein: 35,
        fat: 45,
        timestamp: new Date(day5.setHours(14, 20))
      },
      {
        id: uuidv4(),
        name: 'Protein Bar',
        calories: 240,
        carbs: 20,
        protein: 25,
        fat: 9,
        timestamp: new Date(day5.setHours(17, 45))
      },
      {
        id: uuidv4(),
        name: 'Steak with Mashed Potatoes',
        calories: 680,
        carbs: 48,
        protein: 52,
        fat: 28,
        timestamp: new Date(day5.setHours(20, 30))
      }
    ],
    exercises: [
      {
        id: uuidv4(),
        type: 'Walking',
        duration: 25,
        caloriesBurned: 120,
        timestamp: new Date(day5.setHours(11, 0))
      }
    ],
    deepWorkCompleted: false
  });

  return testDays;
};

// Function to populate localStorage with test data
export const addTestData = () => {
  const testData = generateTestData();
  
  // Add test data to localStorage
  testData.forEach(day => {
    dailyEntryStorage.createOrUpdate(day.date, {
      calories: day.calories,
      exercises: day.exercises,
      deepWorkCompleted: day.deepWorkCompleted
    });
  });
  
  console.log('✅ Test data added for the past 5 days');
  console.log('📊 Data includes varied scenarios: deficits, surpluses, protein goals met/missed, etc.');
  console.log('🗑️ This data can be cleared by calling clearTestData()');
};

// Function to remove test data (for cleanup)
export const clearTestData = () => {
  const today = new Date();
  
  // Clear the past 5 days
  for (let i = 1; i <= 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Remove from localStorage
    const storageKey = `mm-daily-entry-${dateString}`;
    localStorage.removeItem(storageKey);
  }
  
  console.log('🗑️ Test data cleared for the past 5 days');
};

// Function to set up test macro targets in Settings
export const addTestMacroTargets = () => {
  const testTargets = {
    calories: '1800',
    carbs: '180',
    protein: '170',
    fat: '40'
  };
  
  localStorage.setItem('mm-macro-targets', JSON.stringify(testTargets));
  console.log('🎯 Test macro targets set: 1800 cal, 180g carbs, 170g protein, 40g fat');
};

// All-in-one setup function
export const setupTestEnvironment = () => {
  addTestMacroTargets();
  addTestData();
  console.log('🚀 Test environment ready! Refresh the page to see historical data in the 30-day table.');
};