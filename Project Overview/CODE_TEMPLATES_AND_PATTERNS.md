# Essential Code Templates & Patterns

## 🎯 **Copy-Paste Templates for New Project**

### 1. Core Data Models (`lib/types.ts`)

```typescript
// Base interfaces that work for any data tracking app
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Main entity (adapt fields as needed)
interface TrackingEntity extends BaseEntity {
  name: string;
  // Add entity-specific fields here
}

// Data entry pattern (adapt metrics as needed)
interface DataEntry extends BaseEntity {
  entityId?: string; // Optional - for entries linked to entities
  date: Date;
  // Add measurable fields here
}

// Calculated metrics interface
interface CalculatedMetrics {
  total: number;
  average: number;
  // Add derived calculations here
}

interface EntityWithMetrics extends TrackingEntity {
  metrics: CalculatedMetrics;
  totalEntries: number;
}

// Global statistics
interface GlobalStatistics {
  totalEntries: number;
  // Add global metrics here
}

// Form data interfaces (for validation)
interface EntityFormData {
  name: string;
  // Add form fields here
}

interface EntryFormData {
  date: string;
  // Add form fields here
}
```

### 2. Storage Layer Pattern (`lib/storage.ts`)

```typescript
import { v4 as uuidv4 } from 'uuid';

// Safe JSON parsing
const safeParseJSON = <T>(stored: string | null, fallback: T): T => {
  if (!stored) return fallback;
  try {
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects if needed
    return Array.isArray(parsed)
      ? parsed.map(item => ({
          ...item,
          date: item.date ? new Date(item.date) : undefined,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }))
      : parsed;
  } catch {
    return fallback;
  }
};

const generateId = () => uuidv4();

// Generic storage pattern (copy for each entity type)
export const entityStorage = {
  getAll: (): TrackingEntity[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('app-entities');
    return safeParseJSON(stored, []);
  },

  create: (data: Omit<TrackingEntity, 'id' | 'createdAt' | 'updatedAt'>): TrackingEntity => {
    const entity = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const entities = entityStorage.getAll();
    entities.push(entity);
    localStorage.setItem('app-entities', JSON.stringify(entities));
    return entity;
  },

  update: (id: string, updates: Partial<TrackingEntity>): TrackingEntity | null => {
    const entities = entityStorage.getAll();
    const index = entities.findIndex(e => e.id === id);
    if (index === -1) return null;

    entities[index] = {
      ...entities[index],
      ...updates,
      updatedAt: new Date()
    };
    localStorage.setItem('app-entities', JSON.stringify(entities));
    return entities[index];
  },

  delete: (id: string): boolean => {
    const entities = entityStorage.getAll();
    const filtered = entities.filter(e => e.id !== id);
    if (filtered.length === entities.length) return false;

    localStorage.setItem('app-entities', JSON.stringify(filtered));
    return true;
  },

  getById: (id: string): TrackingEntity | undefined => {
    return entityStorage.getAll().find(e => e.id === id);
  }
};

// Repeat pattern for dataEntryStorage, etc.
```

### 3. Context Pattern (`lib/context.tsx`)

```typescript
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { entityStorage, dataEntryStorage } from './storage';
import { calculateMetrics } from './calculations';

// State interface
interface AppState {
  entities: TrackingEntity[];
  dataEntries: DataEntry[];
  globalStats: GlobalStatistics;
  isLoading: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { entities: TrackingEntity[]; dataEntries: DataEntry[] } }
  | { type: 'ADD_ENTITY'; payload: TrackingEntity }
  | { type: 'UPDATE_ENTITY'; payload: TrackingEntity }
  | { type: 'DELETE_ENTITY'; payload: string }
  | { type: 'ADD_DATA_ENTRY'; payload: DataEntry }
  | { type: 'UPDATE_DATA_ENTRY'; payload: DataEntry }
  | { type: 'DELETE_DATA_ENTRY'; payload: string };

// Initial state
const initialState: AppState = {
  entities: [],
  dataEntries: [],
  globalStats: { totalEntries: 0 },
  isLoading: true
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_DATA':
      const globalStats = calculateGlobalStats(action.payload.dataEntries);
      return {
        ...state,
        entities: action.payload.entities,
        dataEntries: action.payload.dataEntries,
        globalStats,
        isLoading: false
      };

    case 'ADD_ENTITY':
      return {
        ...state,
        entities: [...state.entities, action.payload]
      };

    // Add other cases...

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  entitiesWithMetrics: EntityWithMetrics[];
  actions: {
    addEntity: (data: EntityFormData) => void;
    updateEntity: (id: string, data: Partial<EntityFormData>) => void;
    deleteEntity: (id: string) => void;
    addDataEntry: (data: EntryFormData) => void;
    updateDataEntry: (id: string, data: Partial<EntryFormData>) => void;
    deleteDataEntry: (id: string) => void;
    getEntityById: (id: string) => TrackingEntity | undefined;
  };
} | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on mount
  useEffect(() => {
    const entities = entityStorage.getAll();
    const dataEntries = dataEntryStorage.getAll();
    dispatch({ type: 'LOAD_DATA', payload: { entities, dataEntries } });
  }, []);

  // Calculate entities with metrics
  const entitiesWithMetrics = state.entities.map(entity => ({
    ...entity,
    metrics: calculateEntityMetrics(entity.id, state.dataEntries),
    totalEntries: state.dataEntries.filter(entry => entry.entityId === entity.id).length
  }));

  // Actions
  const actions = {
    addEntity: (data: EntityFormData) => {
      const entity = entityStorage.create({
        name: data.name,
        // Map form data to entity
      });
      dispatch({ type: 'ADD_ENTITY', payload: entity });
    },

    updateEntity: (id: string, data: Partial<EntityFormData>) => {
      const updated = entityStorage.update(id, {
        name: data.name,
        // Map updates
      });
      if (updated) {
        dispatch({ type: 'UPDATE_ENTITY', payload: updated });
      }
    },

    deleteEntity: (id: string) => {
      if (entityStorage.delete(id)) {
        // Also delete related entries
        const relatedEntries = state.dataEntries.filter(entry => entry.entityId === id);
        relatedEntries.forEach(entry => dataEntryStorage.delete(entry.id));
        dispatch({ type: 'DELETE_ENTITY', payload: id });
      }
    },

    // Add other actions...
  };

  return (
    <AppContext.Provider value={{ state, entitiesWithMetrics, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hooks
export function useEntities() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useEntities must be used within AppProvider');
  return {
    entities: context.state.entities,
    entitiesWithMetrics: context.entitiesWithMetrics,
    addEntity: context.actions.addEntity,
    updateEntity: context.actions.updateEntity,
    deleteEntity: context.actions.deleteEntity,
    getEntityById: context.actions.getEntityById
  };
}

export function useDataEntries() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useDataEntries must be used within AppProvider');
  return {
    dataEntries: context.state.dataEntries,
    addDataEntry: context.actions.addDataEntry,
    updateDataEntry: context.actions.updateDataEntry,
    deleteDataEntry: context.actions.deleteDataEntry
  };
}

export function useGlobalStats() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useGlobalStats must be used within AppProvider');
  return {
    globalStats: context.state.globalStats,
    isLoading: context.state.isLoading
  };
}
```

### 4. Modal Component Pattern

```typescript
'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEntities } from '@/lib/context';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddEntityModal({ isOpen, onClose }: AddEntityModalProps) {
  const { addEntity } = useEntities();
  const [formData, setFormData] = useState<EntityFormData>({
    name: '',
    // Initialize form fields
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    // Add other validation

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    try {
      addEntity(formData);
      onClose();
      // Reset form
      setFormData({ name: '' });
      setErrors({});
    } catch (error) {
      console.error('Failed to add entity:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-mm-dark2 rounded-lg w-full max-w-md border border-mm-gray/20">
        <div className="flex items-center justify-between p-6 border-b border-mm-gray/20">
          <h2 className="text-xl font-heading text-mm-white">Add New Entity</h2>
          <button
            onClick={onClose}
            className="text-mm-gray hover:text-mm-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-mm-white mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-mm w-full"
              placeholder="Enter name"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-mm-gray/30 text-mm-gray rounded-lg hover:border-mm-gray/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-mm"
            >
              Add Entity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 5. Design System CSS (`app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Theme Variables - UPDATE THESE */
:root {
  --color-mm-blue: #3b82f6;      /* Primary brand color */
  --color-mm-dark: #1f1f1f;      /* Main background */
  --color-mm-dark2: #2a2a2a;     /* Elevated surfaces, cards */
  --color-mm-white: #ffffff;     /* Primary text */
  --color-mm-gray: #ababab;      /* Secondary text, borders */
}

/* Component Classes - COPY THESE EXACTLY */
@layer components {
  .btn-mm {
    @apply bg-mm-blue text-mm-dark px-6 py-2 rounded-full font-medium transition-all duration-200 hover:bg-mm-blue/90 focus:outline-none focus:ring-2 focus:ring-mm-blue focus:ring-offset-2 focus:ring-offset-mm-dark;
  }

  .input-mm {
    @apply bg-mm-dark border border-mm-gray/30 text-mm-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-mm-blue focus:ring-offset-2 focus:ring-offset-mm-dark focus:border-mm-blue transition-colors;
  }

  .card-mm {
    @apply bg-mm-dark2 border border-mm-gray/20 rounded-lg p-6;
  }

  .sidebar-item {
    @apply flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-mm-gray hover:text-mm-white hover:bg-mm-dark2/50;
  }

  .sidebar-item.active {
    @apply text-mm-blue bg-mm-blue/10 border border-mm-blue/20;
  }

  .mobile-nav-item {
    @apply flex flex-col items-center gap-1 px-3 py-2 transition-colors text-mm-gray;
  }

  .mobile-nav-item.active {
    @apply text-mm-blue;
  }

  .table-mm {
    @apply w-full border border-mm-gray/20 rounded-lg overflow-hidden;
  }

  .table-mm th {
    @apply bg-mm-dark2 text-mm-white font-heading text-left px-4 py-3 border-b border-mm-gray/20;
  }

  .table-mm td {
    @apply px-4 py-3 text-mm-gray border-b border-mm-gray/10;
  }

  .table-mm tr:hover td {
    @apply bg-mm-dark2/30;
  }
}

/* Animations */
@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
```

### 6. Navigation Component Pattern

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  // Add other icons
} from '@heroicons/react/24/outline';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  // Add other navigation items
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:block w-64 bg-mm-dark border-r border-mm-gray/20 h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-heading text-mm-white">App Name</h1>
      </div>

      <nav className="px-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

## 🔧 **Quick Migration Commands**

### Find & Replace for New Project
```bash
# Theme migration
find . -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/cpn-yellow/mm-blue/g'
find . -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/cpn-/mm-/g'
find . -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs sed -i 's/CPN/MM/g'

# Color values
find . -name "*.css" | xargs sed -i 's/#f2f661/#3b82f6/g'
```

### Essential Files to Create First
1. `lib/types.ts` - Data models
2. `lib/storage.ts` - localStorage operations
3. `lib/context.tsx` - Global state
4. `lib/calculations.ts` - Derived metrics
5. `app/globals.css` - Design system
6. `components/Sidebar.tsx` - Navigation
7. `components/modals/AddEntityModal.tsx` - CRUD modal

This template system has been battle-tested with CPN v2. Copy these patterns exactly and adapt the data models for your specific use case!