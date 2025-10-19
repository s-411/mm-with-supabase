# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the **MM Design System** and project planning for Measured Managed applications. The main components are:

- **Design System** (`design-system-cpn/`) - Complete styling package extracted from MM v2, built with Tailwind CSS 4.0
- **Project Planning** (`Project Overview/`, `mm-health-tracker-prd.md`) - Development roadmaps and implementation guides for new health tracking application
- **Example Layouts** - Reference implementations and UI patterns

## Common Commands

### Development
```bash
npm run dev          # Start Next.js development server
npm run build        # Build the application
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Dependencies
- **Node.js**: >=18.0.0 required
- **Core**: Tailwind CSS 4.1, PostCSS, Next.js >=14.0.0
- **Peer Dependencies**: React >=18.0.0, React DOM >=18.0.0

## Architecture

### Directory Structure
```
design-system-cpn/
├── styles/globals.css           # Complete CSS system with Tailwind 4.0 theme
├── fonts/                       # Custom fonts (National2Condensed, ESKlarheit)
├── config/                      # Design tokens and color definitions
│   ├── colors.json             # Color palette reference
│   └── design-tokens.json      # Complete design specifications
└── examples/                    # React component examples
    ├── button-examples.tsx     # Button patterns and variations
    ├── card-examples.tsx       # Card layouts and components
    ├── form-examples.tsx       # Form inputs and validation
    └── layout-examples.tsx     # Navigation and layout structures
```

### Design System Architecture

**Theme Configuration**: Uses Tailwind CSS 4.0's `@theme` directive in `styles/globals.css` to define custom properties:
- **Primary Brand Color**: `--color-mm-blue: #00A1FE` (single source of truth - change here updates entire system)
- **Supporting Colors**: mm-dark (#1f1f1f), mm-dark2 (#2a2a2a), mm-white (#ffffff), mm-gray (#ababab)
- **Custom Fonts**: National2Condensed (headings), ESKlarheit (body text)
- **Border Radius**: `--radius-mm: 100px` (signature button style), plus card/input variants
- **Transition Timing**: Fast (0.2s), medium (0.3s), slow (0.5s) tokens

**Component System**: Built around reusable CSS classes:
- `.btn-mm` - Primary blue buttons with 100px border radius
- `.btn-secondary` - Outlined secondary buttons
- `.input-mm` - Dark theme form inputs with blue focus states
- `.card-mm` - Standard card component with dark theme styling
- `.glass-card` - Semi-transparent cards with backdrop blur
- `.rating-tile` - Signature hotness rating grid system

**Color System**: Uses CSS `color-mix()` for dynamic transparency effects and modern color manipulation without opacity utilities.

**Typography**: Automatic font assignment via CSS:
- Headings (h1-h6) automatically use National2Condensed
- Body text automatically uses ESKlarheit
- `.font-heading` and `.font-body` classes available for manual override

**Responsive Design**: Mobile-first approach with specific patterns:
- Desktop sidebar → Mobile bottom navigation
- Desktop tables → Mobile card layouts
- Breakpoints: mobile (max 768px), tablet (769-1024px), desktop (1025px+)

### Key Design Patterns

**Signature Elements**:
- 100px border radius buttons for distinctive blue branding
- Dark theme (#1f1f1f) with strategic blue accent (#00A1FE)
- Glass morphism effects using `color-mix()` and `backdrop-filter`
- Two-row rating grid system (5.0-7.5, 8.0-10.0)

**Layout Patterns**:
- Flex-based app shell with sidebar and main content
- Card-grid layouts for responsive content display
- Mobile-bottom navigation with icon + label pattern

### Integration Guidelines

When implementing this design system:
1. Copy font files to `/public/fonts/`
2. Import `styles/globals.css` in main layout
3. Use `bg-mm-dark text-mm-white` on root layout
4. Reference `/examples/` for component implementation patterns
5. Use design tokens from `/config/design-tokens.json` for specifications

### Color System Management

**Primary Brand Color**: The entire design system's blue theme is controlled by a single CSS custom property:
```css
--color-mm-blue: #00A1FE;
```
- Changing this value in `styles/globals.css` automatically updates all buttons, focus states, hover effects, and brand accents
- All components reference `var(--color-mm-blue)` ensuring consistent theming
- Provides flexibility to adjust the blue shade system-wide from one location

### Package Information

- **Name**: mm-design-system
- **Type**: Private package for Measured Managed applications
- **License**: MIT
- **Main Entry**: styles/globals.css

## Development Context

### Project Planning Files
- `mm-health-tracker-prd.md` - Phased development plan for health tracking application
- `Project Overview/NEW_PROJECT_ROADMAP.md` - Step-by-step implementation roadmap with commands
- `Project Overview/CODE_TEMPLATES_AND_PATTERNS.md` - Reusable code patterns and templates
- `Project Overview/PROJECT_ANALYSIS_AND_REPLICATION_GUIDE.md` - Analysis of existing implementation

### Design System Usage
When building new applications with this design system:
1. The design system is **pre-existing and complete** - do not modify core styles
2. All new development should replicate existing design patterns exactly
3. Use provided examples and screenshots as reference for exact implementation
4. Focus on **incremental development** - build one page at a time to completion