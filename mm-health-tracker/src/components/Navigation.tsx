'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDaysIcon,
  BeakerIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  FireIcon,
  CalculatorIcon,
  SparklesIcon,
  Bars3Icon,
  PhotoIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import {
  CalendarDaysIcon as CalendarDaysIconSolid,
  BeakerIcon as BeakerIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  HeartIcon as HeartIconSolid,
  FireIcon as FireIconSolid,
  CalculatorIcon as CalculatorIconSolid,
  SparklesIcon as SparklesIconSolid,
  PhotoIcon as PhotoIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  {
    href: '/daily',
    label: 'Daily Tracker',
    icon: CalendarDaysIcon,
    iconSolid: CalendarDaysIconSolid
  },
  {
    href: '/calories',
    label: 'Calories',
    icon: FireIcon,
    iconSolid: FireIconSolid
  },
  {
    href: '/injections',
    label: 'Injections',
    icon: BeakerIcon,
    iconSolid: BeakerIconSolid
  },
  {
    href: '/nirvana',
    label: 'Nirvana',
    icon: UserIcon,
    iconSolid: UserIconSolid
  },
  {
    href: '/winners-bible',
    label: 'Winners Bible',
    icon: PhotoIcon,
    iconSolid: PhotoIconSolid
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: ChartBarIcon,
    iconSolid: ChartBarIconSolid
  },
  {
    href: '/calculator',
    label: 'Calculator',
    icon: CalculatorIcon,
    iconSolid: CalculatorIconSolid
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Cog6ToothIcon,
    iconSolid: Cog6ToothIconSolid
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-mm-dark border-r border-mm-gray/20 min-h-screen">
      <div className="p-6">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center mb-8">
          <img
            src="/favicon.png"
            alt="MM Health Tracker"
            className="w-10 h-10"
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.iconSolid : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="mt-auto p-6 border-t border-mm-gray/20">
        {/* Version Info */}
        <div className="text-center">
          <p className="text-xs text-mm-gray mb-2">MM Health Tracker</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-mm-blue rounded-full"></div>
            <div className="w-2 h-2 bg-mm-blue rounded-full"></div>
            <div className="w-2 h-2 bg-mm-blue rounded-full"></div>
            <div className="w-2 h-2 bg-mm-blue rounded-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-mm-dark2 border-t border-mm-gray/20 z-50">
      <div className="grid grid-cols-4 py-2">
        {navigation.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function TopHeader() {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    }

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMobileMenu]);

  // Main navigation items with full text
  const mainNavigation = navigation.slice(0, 6); // Daily, Calories, Injections, Nirvana, Winners Bible, Analytics
  // Icon-only navigation items
  const iconNavigation = navigation.slice(6); // Calculator, Settings

  return (
    <header className="sticky top-0 z-50 bg-mm-dark border-b border-mm-gray/20 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <img
            src="/favicon.png"
            alt="MM Health Tracker"
            className="w-10 h-10"
          />
        </div>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.iconSolid : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`header-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Icon Items + Profile */}
        <div className="flex items-center space-x-2">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-mm-dark2/50 transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-mm-gray" />
          </button>

          {/* Icon-only navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {iconNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = isActive ? item.iconSolid : item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`header-nav-item-icon ${isActive ? 'active' : ''}`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden bg-mm-dark2 border-b border-mm-gray/20" ref={mobileMenuRef}>
          <div className="px-6 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = isActive ? item.iconSolid : item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`header-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mm-dark">
      {/* Top Header */}
      <TopHeader />

      {/* Main Content */}
      <main className="pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}