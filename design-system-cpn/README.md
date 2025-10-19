# MM Design System

**A complete styling package for Measured Managed applications** - extracted from the brilliant MM v2 design system.

This package contains everything you need to replicate the exact same design styling in any new React/Next.js application. Every color, font, button shape, component style, and layout pattern has been carefully extracted and documented.

## 🎨 Design Overview

The MM design system features:
- **Dark theme** with strategic blue accent color (#00A1FE)
- **100px border radius buttons** for distinctive CTA styling
- **Custom typography** with National2Condensed headings and ESKlarheit body text
- **Glassmorphism effects** with subtle backdrop blur
- **Mobile-responsive patterns** with card-based layouts
- **Consistent spacing** and component architecture

## 📁 Package Contents

```
design-system-cpn/
├── README.md                    # This comprehensive guide
├── package.json                 # Dependencies and configuration
├── postcss.config.mjs          # PostCSS setup for Tailwind CSS 4
├── styles/
│   └── globals.css             # Complete CSS system with all styles
├── fonts/
│   ├── National-2-Condensed-Bold.ttf
│   └── ESKlarheitGrotesk-Rg.otf
├── config/
│   ├── colors.json             # Complete color palette reference
│   └── design-tokens.json      # All design tokens and specifications
└── examples/
    ├── button-examples.tsx     # Button components and patterns
    ├── card-examples.tsx       # Card layouts and components
    ├── form-examples.tsx       # Form inputs and validation patterns
    └── layout-examples.tsx     # Navigation and layout structures
```

## 🚀 Quick Start

### 1. Copy to Your Project

Copy the entire `design-system-cpn` folder to your new project root:

```bash
cp -r design-system-cpn /path/to/your/new/project/
```

### 2. Install Dependencies

Install the required dependencies:

```bash
npm install @tailwindcss/postcss@^4.1.0 tailwindcss@^4.1.0 postcss@^8.4.41
```

### 3. Setup Configuration

Copy the configuration files to your project root:

```bash
cp design-system-cpn/postcss.config.mjs ./
```

### 4. Copy Font Files

Copy the font files to your public directory:

```bash
mkdir -p public/fonts
cp design-system-cpn/fonts/* public/fonts/
```

### 5. Import Styles

Import the main CSS file in your app:

```typescript
// app/layout.tsx or pages/_app.tsx
import './design-system-cpn/styles/globals.css'
```

### 6. Apply Base Layout

Use this base layout structure:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cpn-dark text-cpn-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
```

## 🎨 Color System

### Brand Colors
- **Primary Blue**: `#00A1FE` - CTA buttons, active states, highlights
- **Dark Background**: `#1f1f1f` - Main background color
- **Dark Elevated**: `#2a2a2a` - Cards, modals, elevated surfaces
- **Gray**: `#ababab` - Secondary text, borders, inactive states
- **White**: `#ffffff` - Primary text, high contrast elements

### Usage
```css
/* CSS Variables */
var(--color-mm-blue)
var(--color-mm-dark)
var(--color-mm-dark2)
var(--color-mm-gray)
var(--color-mm-white)

/* Tailwind Classes */
.bg-mm-blue .text-mm-blue .border-mm-blue
.bg-mm-dark .text-mm-dark .border-mm-dark
.bg-mm-dark2 .text-mm-dark2 .border-mm-dark2
.bg-mm-gray .text-mm-gray .border-mm-gray
.bg-mm-white .text-mm-white .border-mm-white
```

## 🔤 Typography

### Fonts
- **Headings**: National2Condensed (bold, condensed style)
- **Body**: ESKlarheit (clean, readable text)

### Usage
```tsx
<h1 className="font-heading">Heading Text</h1>
<p className="font-body">Body text content</p>

/* Auto-applied to HTML elements */
h1, h2, h3, h4, h5, h6 // Automatically use heading font
body, p, span, div     // Automatically use body font
```

### Typography Scale
- **h1**: 2.5rem (40px)
- **h2**: 2rem (32px)
- **h3**: 1.5rem (24px)
- **h4**: 1.25rem (20px)
- **h5**: 1rem (16px)
- **h6**: 0.875rem (14px)

## 🎯 Component Styles

### Primary Buttons
The signature 100px border radius blue buttons:

```tsx
<button className="btn-mm">
  Primary Action
</button>

// With icon
<button className="btn-mm">
  <PlusIcon className="w-4 h-4" />
  Add Data
</button>
```

### Secondary Buttons
Outlined buttons with hover effects:

```tsx
<button className="btn-secondary">
  Secondary Action
</button>
```

### Form Inputs
Dark theme inputs with blue focus states:

```tsx
<input
  type="text"
  className="input-mm"
  placeholder="Enter text"
/>

<select className="select-mm">
  <option>Choose option</option>
</select>

<textarea className="input-mm min-h-[100px]">
</textarea>
```

### Cards
Multiple card variations for different content types:

```tsx
// Standard card
<div className="card-mm">
  Content here
</div>

// Glass effect card
<div className="glass-card">
  Semi-transparent content
</div>

// Hoverable card
<div className="card-mm hover:border-mm-blue/30 transition-all duration-200 group">
  Interactive content
</div>
```

### Rating Tiles (Signature Pattern)
The distinctive hotness rating system:

```tsx
// First row: 5.0 - 7.5
<div className="grid grid-cols-6 gap-2 mb-2">
  {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5].map((rating) => (
    <button
      key={rating}
      className={`rating-tile ${selected === rating ? 'selected' : ''}`}
      onClick={() => setSelected(rating)}
    >
      {rating}
    </button>
  ))}
</div>

// Second row: 8.0 - 10.0
<div className="grid grid-cols-5 gap-2">
  {[8.0, 8.5, 9.0, 9.5, 10.0].map((rating) => (
    <button
      key={rating}
      className={`rating-tile ${selected === rating ? 'selected' : ''}`}
      onClick={() => setSelected(rating)}
    >
      {rating}
    </button>
  ))}
</div>
```

## 🏗️ Layout Patterns

### App Layout Structure
```tsx
<div className="flex h-screen bg-mm-dark">
  {/* Desktop Sidebar */}
  <aside className="hidden md:flex md:flex-col md:w-64 bg-mm-dark border-r border-mm-gray/20">
    <div className="p-6">
      <h1 className="text-2xl font-heading text-mm-blue">App Name</h1>
      <nav className="space-y-2 mt-8">
        <a href="#" className="sidebar-item active">Dashboard</a>
        <a href="#" className="sidebar-item">Other Page</a>
      </nav>
    </div>
  </aside>

  {/* Main Content */}
  <main className="flex-1 overflow-auto pb-16 md:pb-0">
    {children}
  </main>

  {/* Mobile Navigation */}
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-mm-dark2 border-t border-mm-gray/20">
    <div className="grid grid-cols-4 py-2">
      <div className="mobile-nav-item active">
        <HomeIcon className="w-5 h-5" />
        <span className="text-xs mt-1">Home</span>
      </div>
      // More nav items...
    </div>
  </div>
</div>
```

### Navigation Styles
```tsx
// Sidebar items
<a href="#" className="sidebar-item">Navigation Item</a>
<a href="#" className="sidebar-item active">Active Item</a>

// Mobile navigation
<div className="mobile-nav-item">
  <Icon className="w-5 h-5" />
  <span className="text-xs mt-1">Label</span>
</div>
<div className="mobile-nav-item active">
  <Icon className="w-5 h-5" />
  <span className="text-xs mt-1">Active</span>
</div>
```

### Responsive Grids
```tsx
// Card grids
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {cards.map(card => <Card key={card.id} {...card} />)}
</div>

// Statistics grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard title="Total" value="$2,450" />
  <StatCard title="Count" value="15" />
  <StatCard title="Average" value="$163" />
  <StatCard title="Time" value="12.5h" />
</div>
```

## 📱 Mobile Responsiveness

The design system is mobile-first with these key patterns:

### Breakpoints
- **Mobile**: max-width: 768px
- **Tablet**: 769px to 1024px
- **Desktop**: min-width: 1025px

### Mobile Adaptations
- **Tables → Cards**: Desktop tables become mobile card layouts
- **Sidebar → Bottom Nav**: Desktop sidebar becomes mobile bottom navigation
- **Reduced Spacing**: Smaller padding and margins on mobile
- **Touch Targets**: Larger tap areas for mobile interaction

### Responsive Components
```tsx
// Desktop table, mobile cards
<div className="hidden md:block">
  <table className="table-cpn">
    {/* Table content */}
  </table>
</div>

<div className="md:hidden space-y-4">
  {data.map(item => (
    <div key={item.id} className="card-cpn">
      {/* Card content */}
    </div>
  ))}
</div>
```

## 🎭 Animation System

### Available Animations
```css
.animate-fade-in    /* 0.5s fade in */
.animate-slide-up   /* 0.3s slide up */
.animate-slide-in   /* 0.3s slide in from left */
.animate-pulse      /* 2s infinite pulse */
```

### Custom Transitions
```css
/* All components use these transition speeds */
--transition-fast: 0.2s     /* Hover effects */
--transition-medium: 0.3s   /* Modal animations */
--transition-slow: 0.5s     /* Page transitions */
```

## 🛡️ Form Validation

### Error States
```tsx
<input
  className={`input-cpn ${error ? 'border-red-500' : ''}`}
  value={value}
  onChange={onChange}
/>
{error && <p className="text-error">{error}</p>}
```

### Success States
```tsx
<input className="input-mm border-green-500" />
<p className="text-success">Valid input!</p>
```

### Loading States
```tsx
<button className="btn-mm" disabled={loading}>
  {loading ? (
    <>
      <div className="animate-pulse w-4 h-4 bg-mm-dark rounded-full"></div>
      Loading...
    </>
  ) : (
    'Submit'
  )}
</button>
```

## 🔧 Advanced Patterns

### Modal System
```tsx
// Modal backdrop and content
<div className="modal-backdrop" onClick={onClose} />
<div className="modal-content">
  <div className="modal-header">
    <h3 className="text-lg font-heading text-mm-white">Title</h3>
    <button className="modal-close" onClick={onClose}>
      <XIcon className="w-6 h-6" />
    </button>
  </div>
  {/* Modal content */}
</div>
```

### Table Styling
```tsx
<table className="table-cpn">
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

### Color Mixing Effects
The design system uses CSS `color-mix()` for dynamic transparency:

```css
/* Glass effects */
background-color: color-mix(in srgb, var(--color-mm-dark) 80%, transparent);

/* Subtle borders */
border-color: color-mix(in srgb, var(--color-mm-gray) 20%, transparent);

/* Hover states */
background-color: color-mix(in srgb, var(--color-mm-blue) 30%, transparent);
```

## 📋 Implementation Checklist

When implementing in a new project:

- [ ] Install Tailwind CSS 4.1 and PostCSS
- [ ] Copy font files to `/public/fonts/`
- [ ] Import `globals.css` in your main layout
- [ ] Set up the base layout structure with `bg-mm-dark text-mm-white`
- [ ] Copy PostCSS configuration
- [ ] Test all component styles work correctly
- [ ] Implement responsive navigation (sidebar + mobile nav)
- [ ] Set up modal system if needed
- [ ] Configure form validation styles
- [ ] Test mobile responsiveness

## 🎨 Design Philosophy

This design system embodies:

1. **Distinctive Branding**: The 100px border radius buttons and strategic blue accent create instant brand recognition
2. **Dark Theme Excellence**: Carefully crafted contrast ratios for accessibility and visual appeal
3. **Mobile-First Responsive**: Every component adapts gracefully from mobile to desktop
4. **Consistent Spacing**: Systematic padding, margins, and gap usage throughout
5. **Performance-Focused**: Minimal CSS with maximum visual impact
6. **Developer-Friendly**: Intuitive class names and clear patterns

## 🔄 Maintenance

To keep the design system up to date:

1. **Version Control**: Track changes to design tokens in `/config/` files
2. **Component Updates**: Update examples when adding new patterns
3. **Documentation**: Keep README updated with new components or patterns
4. **Testing**: Verify all components work across different screen sizes

## 📞 Support

This design system was extracted from MM v2. For questions or improvements:

1. Check the `/examples/` folder for implementation patterns
2. Review `/config/design-tokens.json` for specifications
3. Reference the original MM v2 application for context

---

**Copy this folder to any new project and you'll have the exact same brilliant design system ready to use immediately!** 🚀