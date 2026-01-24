# Comprehensive Repository Analysis

## 1. Executive Summary

**Project Name**: Strength Training Analytics Dashboard (workout-dashboard)

**Purpose**: A personal strength training analytics dashboard that visualizes workout data from the "Strong" (MyApp) Android workout app. The dashboard transforms raw SQLite workout data into compelling visual insights.

**Target Audience**:
- Primary: The developer (personal analytics and progress tracking)
- Secondary: Portfolio visitors at bradleycarey.com/dashboard/
- Design goal: Impressive to non-lifters AND insightful for experienced lifters

**Key Statistics**:
- 6+ years of training data (2019-present)
- 969 workouts completed
- 6.8M lbs (3,400+ tons) of total volume lifted
- 800KB JSON dataset with comprehensive metrics

**Technology Overview**: Modern JavaScript SPA built with Preact, Vite, and ECharts for high-performance data visualization with minimal bundle size.

---

## 2. Project Purpose & Domain

### Domain
Personal strength training analytics with focus on powerlifting movements (squat, bench press, deadlift, overhead press).

### Data Source
- **Origin**: "Strong" (package: `com.maxworkoutcoach.workouttrainer.workouttrainer`) Android app
- **Export Method**: Database export feature from app settings
- **Format**: SQLite database (MyApp.db)

### Target Deployment
- **URL**: bradleycarey.com/dashboard/
- **Integration**: Hugo static site at `/dashboard/` subdirectory
- **Hosting**: Netlify (via existing blog infrastructure)

### Design Philosophy
The dashboard must balance two goals:
1. **Impressive to Non-Lifters**: Big numbers, tangible comparisons (tons lifted = Honda Civics), visual appeal
2. **Insightful for Experienced Lifters**: E1RM progression, relative strength metrics, volume analytics, plate milestones

---

## 3. Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Preact | ^10.19.3 | Lightweight React alternative (3KB) |
| **Build Tool** | Vite | ^5.0.8 | Fast development server and optimized builds |
| **State Management** | @preact/signals | ^1.2.2 | Fine-grained reactive state management |
| **Charting** | ECharts | ^5.4.3 | Professional data visualization library |
| **Chart Integration** | echarts-for-react | ^3.0.2 | Preact/React wrapper for ECharts |
| **Icons** | lucide-preact | ^0.294.0 | Modern icon library with Preact support |
| **Styling** | CSS Modules + Custom Properties | Native | Scoped component styles with design tokens |
| **Dev Tooling** | @preact/preset-vite | ^2.8.1 | Vite plugin for Preact with HMR |

### Why These Choices?
- **Preact over React**: 10x smaller bundle size, identical API
- **Vite over CRA**: Instant dev server startup, faster builds
- **Signals over Redux**: Less boilerplate, automatic reactivity, smaller bundle
- **ECharts over Chart.js**: More professional appearance, better interactivity, richer feature set
- **CSS Modules over Styled-Components**: Zero runtime cost, better performance

---

## 4. Architecture Overview

### Application Type
Single Page Application (SPA) with no routing - single scrollable page with multiple sections.

### Data Flow
```
MyApp.db (SQLite)
    ↓
extract_data.py (Python)
    ↓
training_data.json (~800KB)
    ↓
Runtime Fetch (in-memory cache)
    ↓
Preact Components
    ↓
User Interface
```

### State Architecture
- **Global State**: Preact Signals for theme and unit system
- **Persistence**: localStorage for user preferences
- **Component State**: Local hooks (useState, useEffect) for component-specific data
- **No Props Drilling**: Signals accessed directly in components via imports

### Component Architecture
- **Layout Wrapper**: Header + main content container
- **Section Components**: Self-contained visualizations with own styling
- **Utility Modules**: Data fetching, formatting, and conversions
- **CSS Modules**: Scoped styles per component (`.module.css`)

### Performance Strategy
- Static JSON data (no API calls to backend)
- In-memory caching of fetched data
- Manual chunk splitting (ECharts in separate bundle)
- CSS-only animations where possible
- Lazy rendering with Intersection Observer (hero stats)

---

## 5. Directory Structure

```
dashboard-next/
├── data/                          # Data processing scripts and documentation
│   ├── extract_data.py           # Python: SQLite → JSON extraction
│   ├── fix_stronglifts_dates.py  # Date correction for imported data
│   ├── myapp-db-sqlite-schema.json  # Database schema reference
│   ├── MyApp.db                  # Source SQLite database (not committed)
│   └── training_data.md          # Data structure documentation
│
├── public/                        # Static assets served at build root
│   └── training_data.json        # Generated workout data (~800KB)
│
├── src/                           # Application source code
│   ├── components/               # React/Preact components
│   │   ├── Header.jsx            # Top navigation with theme/unit toggles
│   │   ├── Header.module.css
│   │   ├── HeroSection.jsx       # Summary statistics with animated counters
│   │   ├── HeroSection.module.css
│   │   ├── Layout.jsx            # Page wrapper with header
│   │   ├── Layout.module.css
│   │   ├── PersonalRecords.jsx   # PR grid by rep range (1RM, 3RM, 5RM, etc.)
│   │   ├── PersonalRecords.module.css
│   │   ├── PlateMilestones.jsx   # Achievement grid (1-plate, 2-plate, etc.)
│   │   ├── PlateMilestones.module.css
│   │   ├── RelativeStrength/     # Subfolder for complex component
│   │   │   ├── RelativeStrength.jsx      # BW multiples + Wilks score
│   │   │   └── RelativeStrength.module.css
│   │   ├── StrengthProgressionCharts.jsx  # E1RM line charts over time
│   │   ├── StrengthProgressionCharts.module.css
│   │   ├── TrainingPrograms.jsx  # Program timeline cards
│   │   ├── TrainingPrograms.module.css
│   │   ├── VolumeAnalytics.jsx   # Monthly volume trends + day-of-week
│   │   ├── VolumeAnalytics.module.css
│   │   ├── WorkoutCalendar.jsx   # GitHub-style activity heatmap
│   │   └── WorkoutCalendar.module.css
│   │
│   ├── state/                     # Global state management
│   │   └── settings.js           # Signals for theme and unit preferences
│   │
│   ├── styles/                    # Global styles and design tokens
│   │   └── index.css             # CSS custom properties, base styles
│   │
│   ├── utils/                     # Utility functions
│   │   ├── data.js               # Data fetching with in-memory cache
│   │   └── format.js             # Number/weight/date formatting
│   │
│   ├── App.jsx                    # Root component, data loading, section composition
│   ├── App.module.css
│   └── main.jsx                   # Entry point, ReactDOM render
│
├── .gitignore                     # Git exclusions (node_modules, dist, data files)
├── index.html                     # HTML template
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Dependency lock file
├── vite.config.js                 # Vite build configuration
├── ANALYSIS.md                    # This file
├── PLAN.md                        # Original implementation plan
└── REQUIREMENTS.md                # Project requirements and specifications
```

### File Organization Principles
- **Component Co-location**: Each component has its `.jsx` and `.module.css` together
- **Flat Structure**: Most components at same level (except complex ones like RelativeStrength)
- **Clear Separation**: components/ vs state/ vs utils/ vs styles/
- **Data Pipeline**: Separate `data/` folder for preprocessing scripts

---

## 6. Data Pipeline

### Step 1: Source Data
- **File**: `MyApp.db` (SQLite database)
- **Source**: Android "Strong" workout tracking app
- **Export**: Via app's "Export Database" feature
- **Location**: `data/MyApp.db` (gitignored)

### Step 2: Optional Date Correction
```bash
python data/fix_stronglifts_dates.py
```
- Corrects date formats for imported StrongLifts data
- Outputs corrected `MyApp.db`

### Step 3: Data Extraction
```bash
python data/extract_data.py
```
- Reads `MyApp.db` SQLite database
- Computes aggregations, time series, PRs, milestones
- Outputs `public/training_data.json` (~800KB)

### Step 4: Runtime Data Loading
```javascript
// src/utils/data.js
const response = await fetch('/dashboard/training_data.json')
const data = await response.json()
```
- Fetched once on app load
- Cached in memory (no re-fetching)
- No backend required (fully static)

### Data Preprocessing Rationale
- **Why Python?**: SQLite access, pandas for aggregations, mature data processing
- **Why JSON?**: Universal format, fast parsing, human-readable
- **Why Static?**: No server needed, CDN cacheable, fast loading
- **Why Client Fetch?**: Keeps JSON separate from bundle, enables future updates without rebuild

---

## 7. Data Model Documentation

Based on `data/training_data.md`, the JSON structure includes:

### Core Data Types

#### Summary
```typescript
{
  firstWorkoutDate: string        // ISO 8601: "2019-01-23"
  lastWorkoutDate: string         // ISO 8601: "2026-01-24"
  totalWorkouts: number           // 969
  totalSets: number
  totalReps: number
  totalVolumeLbs: number          // 6,800,000+
  totalVolumeKg: number
  totalHours: number              // ~800
  avgWorkoutsPerWeek: number
  avgVolumePerWorkoutLbs: number
  avgVolumePerWorkoutKg: number
  bestMonthEver: {
    month: string                 // "YYYY-MM"
    volumeLbs: number
    volumeKg: number
  }
}
```

#### VolumeTimeSeries
```typescript
{
  daily: {
    [date: string]: {             // "YYYY-MM-DD"
      volumeLbs: number
      volumeKg: number
      workoutCount: number
    }
  }
  weekly: {
    [week: string]: {             // "YYYY-WW"
      volumeLbs: number
      volumeKg: number
      workoutCount: number
    }
  }
  monthly: {
    [month: string]: {            // "YYYY-MM"
      volumeLbs: number
      volumeKg: number
      workoutCount: number
    }
  }
}
```

#### WorkoutCalendar
```typescript
{
  [date: string]: {               // "YYYY-MM-DD"
    volumeLbs: number
    volumeKg: number
    count: number                 // Number of workouts that day
  }
}
```

#### BigThreeE1RM
```typescript
{
  squat: {
    [month: string]: {            // "YYYY-MM"
      estimated1RM: number        // Brzycki formula: weight × (36 / (37 - reps))
      bestSet: {
        weight: number
        reps: number
      }
    }
  }
  bench: { /* same structure */ }
  deadlift: { /* same structure */ }
  ohp: { /* same structure */ }
}
```

#### PlateMilestones
```typescript
{
  [exerciseName: string]: {
    plateCount: number            // 1, 2, 3, 4, 5, 6 (plates per side)
    date: string                  // ISO 8601
    weightLbs: number             // 135, 225, 315, 405, 495, 585
  }
}
```
**Note**: 1 plate = 45 lbs per side + 45 lb bar = 135 lbs total

#### RelativeStrength
```typescript
{
  [lift: string]: {               // 'squat', 'bench', 'deadlift'
    [month: string]: {            // "YYYY-MM"
      estimated1RM: number
      bodyWeightLbs: number
      bwMultiple: number          // e1RM / bodyweight (e.g., 2.1x)
      wilks: number               // Wilks coefficient score
    }
  }
}
```

#### PowerliftingTotals
```typescript
{
  raw: {
    bestTotal: number             // Squat + Bench + Deadlift actual
    date: string
  }
  estimated: {
    bestTotal: number             // Based on E1RMs
    date: string
  }
}
```

#### AllTimePRs
```typescript
{
  [exerciseName: string]: {
    [repRange: string]: {         // "1RM", "3RM", "5RM", "10RM"
      weight: number
      reps: number
      estimated1RM: number
      date: string
    }
  }
}
```

#### BarTravel
```typescript
{
  [exerciseName: string]: {
    totalDistanceMeters: number   // Volume × ROM estimate
    totalDistanceMiles: number
    avgPerWorkoutMeters: number
  }
  total: {
    miles: number                 // 29+ miles (148,000 feet)
    meters: number
  }
}
```

#### TrainingPrograms
```typescript
{
  programs: Array<{
    name: string                  // "Starting Strength", "5/3/1 BBB", etc.
    startDate: string
    endDate: string | null        // null if current
    workoutCount: number
    totalVolumeLbs: number
    totalVolumeKg: number
    prsSet: number                // PRs achieved during program
  }>
}
```

#### BodyWeight
```typescript
{
  [month: string]: {              // "YYYY-MM"
    avgBodyWeightLbs: number
    avgBodyWeightKg: number
  }
}
```

#### WorkoutsByDayOfWeek
```typescript
{
  [day: string]: {                // "Monday", "Tuesday", etc.
    count: number
    avgVolumeLbs: number
    avgVolumeKg: number
  }
}
```

---

## 8. Component Inventory

| Component | File Path | Purpose | Visualization Type | Data Dependencies |
|-----------|-----------|---------|-------------------|-------------------|
| **App** | `App.jsx` | Root component, orchestrates data loading and section composition | N/A | All data |
| **Layout** | `components/Layout.jsx` | Page wrapper with header and main content container | N/A | None |
| **Header** | `components/Header.jsx` | Top navigation with theme toggle and unit toggle buttons | CSS buttons | Signals (theme, unit) |
| **HeroSection** | `components/HeroSection.jsx` | Summary statistics with animated count-up numbers | CSS grid + Intersection Observer | `summary`, `barTravel` |
| **WorkoutCalendar** | `components/WorkoutCalendar.jsx` | GitHub-style contribution graph showing workout frequency | ECharts heatmap | `workoutCalendar` |
| **StrengthProgressionCharts** | `components/StrengthProgressionCharts.jsx` | E1RM progression over time for squat, bench, deadlift, OHP | ECharts line/area charts | `bigThreeE1RM` |
| **PlateMilestones** | `components/PlateMilestones.jsx` | Achievement grid showing first time hitting 1-plate, 2-plate, etc. | CSS grid with cards | `plateMilestones` |
| **RelativeStrength** | `components/RelativeStrength/` | Bodyweight multiples and Wilks score visualization | Custom CSS bullet charts | `relativeStrength`, `bodyWeight` |
| **VolumeAnalytics** | `components/VolumeAnalytics.jsx` | Monthly volume trends and workouts by day of week | ECharts area + bar charts | `volumeTimeSeries`, `workoutsByDayOfWeek` |
| **TrainingPrograms** | `components/TrainingPrograms.jsx` | Timeline of training programs with stats | CSS timeline cards | `programs` |
| **PersonalRecords** | `components/PersonalRecords.jsx` | PR table by exercise and rep range (1RM, 3RM, 5RM, etc.) | CSS table/grid | `allTimePRs`, `exerciseProgress` |

### Component Design Patterns

#### Data Loading Pattern
```jsx
// App.jsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  loadTrainingData()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false))
}, [])

if (loading) return <Loading />
if (error) return <Error message={error} />
return <Dashboard data={data} />
```

#### Animated Count-Up Pattern
```jsx
// HeroSection.jsx - Intersection Observer + localStorage cache
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hasAnimated) {
      animateValue(0, targetValue, 1500)
      setHasAnimated(true)
      localStorage.setItem('animatedStats', JSON.stringify({ [label]: true }))
    }
  }, { threshold: 0.5 })

  observer.observe(cardRef.current)
  return () => observer.disconnect()
}, [])
```

#### Signal-Based Theme Pattern
```jsx
// Settings read directly in components
import { isMetric } from '../state/settings'

function Component() {
  const metric = isMetric.value  // Auto-reactive
  return <div>{metric ? 'kg' : 'lbs'}</div>
}
```

#### ECharts Integration Pattern
```jsx
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

<ReactEChartsCore
  echarts={echarts}
  option={chartOption}
  style={{ height: '400px' }}
/>
```

---

## 9. State Management

### Global Signals

#### Unit System
```javascript
// src/state/settings.js
export const unit = signal(
  localStorage.getItem('unit') || 'imperial'
)

export const isMetric = computed(() => unit.value === 'metric')

export function toggleUnit() {
  unit.value = unit.value === 'imperial' ? 'metric' : 'imperial'
}
```
- **Values**: `'imperial'` | `'metric'`
- **Persistence**: localStorage
- **Usage**: Weight (lbs/kg), distance (miles/km) formatting

#### Theme System
```javascript
export const theme = signal(
  localStorage.getItem('theme') || 'auto'
)

export function toggleTheme() {
  const themes = ['auto', 'light', 'dark']
  const current = themes.indexOf(theme.value)
  theme.value = themes[(current + 1) % themes.length]
}

function applyTheme(themeValue) {
  if (themeValue === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', themeValue)
  }
}
```
- **Values**: `'auto'` | `'light'` | `'dark'`
- **Persistence**: localStorage
- **Auto Mode**: Uses CSS `@media (prefers-color-scheme: dark)`
- **Manual Override**: Sets `data-theme` attribute on `<html>`

### Persistence Strategy
```javascript
effect(() => {
  localStorage.setItem('unit', unit.value)
})

effect(() => {
  localStorage.setItem('theme', theme.value)
  applyTheme(theme.value)
})
```
- Signals automatically sync to localStorage on change
- Effects run on every signal update
- No explicit save/load functions needed

### Why Signals Over Redux?
1. **Less Boilerplate**: No actions, reducers, or dispatch
2. **Fine-Grained Reactivity**: Only re-render components using changed signal
3. **Smaller Bundle**: ~1KB vs 12KB+ for Redux
4. **Built-in Computed**: Derived state with `computed()`
5. **Side Effects**: `effect()` for localStorage sync

---

## 10. Design System

### Color Palette

#### Lift-Specific Colors
```css
--color-squat: #2563eb (blue)        /* Dark: #60a5fa */
--color-bench: #dc2626 (red)         /* Dark: #f87171 */
--color-deadlift: #16a34a (green)    /* Dark: #4ade80 */
--color-ohp: #9333ea (purple)        /* Dark: #c084fc */
```
**Rationale**: Color-coded lifts help users quickly identify exercises across different chart types.

#### Semantic Colors
```css
--color-accent: #f59e0b (amber)
--color-success: #22c55e (green)
--color-warning: #eab308 (yellow)
--color-error: #ef4444 (red)
```

#### Strength Bands (Bodyweight Multiples)
```css
--color-band-untrained: #e5e7eb → #374151
--color-band-novice: #d1d5db → #4b5563
--color-band-intermediate: #9ca3af → #6b7280
--color-band-advanced: #6b7280 → #9ca3af
--color-band-elite: #4b5563 → #d1d5db
```
Used in RelativeStrength component for strength standards visualization.

#### Wilks Benchmark Colors
```css
--color-benchmark-beginner: #93c5fd → #1e40af
--color-benchmark-intermediate: #60a5fa → #2563eb
--color-benchmark-advanced: #3b82f6 → #3b82f6
--color-benchmark-elite: #2563eb → #60a5fa
--color-benchmark-world: #1e40af → #93c5fd
```

### Typography Scale
```css
--font-xs: 0.75rem    /* 12px */
--font-sm: 0.875rem   /* 14px */
--font-base: 1rem     /* 16px - body text */
--font-lg: 1.125rem   /* 18px */
--font-xl: 1.25rem    /* 20px */
--font-2xl: 1.5rem    /* 24px */
--font-3xl: 1.875rem  /* 30px - h2 */
--font-4xl: 2.25rem   /* 36px - h1 */
--font-5xl: 3rem      /* 48px - hero numbers */
```
**System**: 1.125× modular scale (major second)

### Spacing System
```css
--space-1: 0.25rem    /* 4px */
--space-2: 0.5rem     /* 8px - base unit */
--space-3: 0.75rem    /* 12px */
--space-4: 1rem       /* 16px */
--space-6: 1.5rem     /* 24px */
--space-8: 2rem       /* 32px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */
```
**System**: 8px base grid (multiples of 4px)

### Border Radius
```css
--radius-sm: 0.25rem  /* 4px */
--radius-md: 0.5rem   /* 8px */
--radius-lg: 0.75rem  /* 12px */
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 1px 3px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1)
```
Darker in dark mode (0.3-0.4 alpha).

### Font Families
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--font-mono: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace
```
System font stack for native performance.

### Light/Dark Mode Architecture

#### Auto Mode (Default)
```css
:root { /* light colors */ }

@media (prefers-color-scheme: dark) {
  :root { /* dark colors */ }
}
```

#### Manual Override
```css
[data-theme="light"] { /* force light */ }
[data-theme="dark"] { /* force dark */ }
```

### Accessibility Features

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
Respects user preference for reduced animations.

#### Focus Indicators
```css
*:focus-visible {
  outline: 2px solid var(--color-link);
  outline-offset: 2px;
}
```
Visible focus for keyboard navigation.

---

## 11. User Features

### Theme Toggle
**Location**: Header (top-right)

**Behavior**:
- Cycles: Auto → Light → Dark → Auto
- Icon changes per state (Sun/Moon/Auto)
- Persists to localStorage
- Auto mode respects system preference

**Implementation**: `src/state/settings.js:toggleTheme()`

### Unit System Toggle
**Location**: Header (top-right, next to theme)

**Behavior**:
- Toggles: Imperial ⇄ Metric
- Affects: Weights (lbs/kg), distances (miles/km)
- Persists to localStorage
- Instant reactivity via Signals

**Conversions**:
- Weight: 1 lb = 0.453592 kg
- Distance: 1 mile = 1.60934 km

**Implementation**: `src/state/settings.js:toggleUnit()`

### Interactive Charts
**ECharts Features**:
- Hover tooltips with exact values
- Legend toggles (click to hide/show series)
- Zoom/pan on desktop (shift+drag)
- Responsive to window resize
- Dark mode aware colors

### Animated Statistics
**HeroSection Count-Up**:
- Triggers on scroll into view (Intersection Observer)
- 1.5 second animation duration
- Only animates once per session (localStorage cache)
- Respects `prefers-reduced-motion`
- Fallback: Instant display if reduced motion preferred

### Workout Calendar Heatmap
**Interaction**:
- Hover shows date + volume + workout count
- Color intensity based on volume
- Gaps show rest days
- GitHub-style visual language

---

## 12. Build & Deployment

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
```
- Vite dev server with HMR (Hot Module Replacement)
- Preact Fast Refresh for instant updates
- Opens browser automatically

### Production Build
```bash
npm run build        # Build for production
```
**Output**: `dist/` directory
- Minified and optimized bundles
- Manual chunk: `echarts.js` (separate from main bundle)
- Asset hashing for cache busting
- Source maps disabled

### Preview Production Build
```bash
npm run preview      # Serve dist/ folder
```
Tests production build locally.

### Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [preact()],
  base: '/dashboard/',              // URL base path
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'echarts': ['echarts', 'echarts-for-react']  // Separate chunk
        }
      }
    }
  }
})
```

### Hugo Integration
**Target Location**: `C:\source\blog\static\dashboard\`

**Deployment Steps**:
1. Run `npm run build` in this repo
2. Copy `dist/` contents to `C:\source\blog\static\dashboard\`
3. Commit and push blog repo
4. Netlify auto-deploys from blog repo

**URL Structure**:
```
bradleycarey.com/               # Hugo blog root
bradleycarey.com/dashboard/     # This SPA
bradleycarey.com/dashboard/assets/  # JS/CSS bundles
```

### Base Path Handling
```javascript
// All fetches use absolute path with base
fetch('/dashboard/training_data.json')
```
```html
<!-- index.html -->
<base href="/dashboard/" />
```

### CDN & Caching
- **Netlify CDN**: Automatic global distribution
- **Asset Hashing**: `main.abc123.js` for cache busting
- **JSON Caching**:
  - Client: In-memory cache (no re-fetch)
  - Browser: HTTP cache based on headers
  - CDN: Edge caching

### Performance Optimizations
1. **Bundle Splitting**: ECharts separate (~700KB) from main (~50KB)
2. **Tree Shaking**: Only imported ECharts components included
3. **Preact**: 3KB framework vs 40KB React
4. **CSS Modules**: No runtime CSS-in-JS overhead
5. **Static Data**: No backend latency
6. **In-Memory Cache**: Single fetch per session

---

## 13. Performance Considerations

### Bundle Size Strategy
- **Main Bundle**: ~50KB gzipped (Preact + app code)
- **ECharts Chunk**: ~700KB gzipped (loaded separately)
- **CSS**: ~10KB (design tokens + component styles)
- **Data JSON**: ~800KB (fetched, not bundled)

**Total First Load**: ~1.5MB (competitive for data-heavy SPA)

### Code Splitting
```javascript
// Automatic route-based splitting (if routing added)
// Manual chunk splitting for large dependencies
manualChunks: {
  'echarts': ['echarts', 'echarts-for-react']
}
```

### Data Loading Strategy
```javascript
// Fetch once, cache in memory
let cachedData = null
export async function loadTrainingData() {
  if (cachedData) return cachedData
  cachedData = await fetch('/dashboard/training_data.json').then(r => r.json())
  return cachedData
}
```
- No re-fetching on component re-renders
- No Redux store overhead
- Browser HTTP caching applies

### Animation Performance
```css
/* CSS-only animations use GPU */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Avoid layout thrashing */
.card {
  will-change: transform;  /* Hint to browser */
}
```

### Chart Rendering
- **ECharts Canvas Renderer**: GPU-accelerated
- **Lazy Initialization**: Charts render only when data loaded
- **Responsive Debouncing**: Window resize throttled

### Reduced Motion Support
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (prefersReducedMotion) {
  setDisplayValue(value)  // Skip animation
} else {
  animateValue()          // Animate count-up
}
```

### Image/Asset Optimization
- **No images** in current build (all vector/CSS)
- Icons via `lucide-preact` (tree-shakeable)
- SVG logos inline (no HTTP requests)

### Metrics Targets
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <2.5s
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)

---

## 14. Future Considerations

Based on `PLAN.md` and `REQUIREMENTS.md`:

### Not Yet Implemented

#### Exercise Deep Dive Section
- **Purpose**: Detailed per-exercise analytics
- **Features**:
  - Volume trends over time
  - PR timeline
  - Rep range distribution
  - Set/rep patterns
- **Data**: Already available in `exerciseProgress` object
- **Why Deferred**: Scope management, priority on overview sections

#### User Data Upload
- **Vision**: Allow users to upload their own `training_data.json`
- **UX**: Drag-and-drop or file picker
- **Storage**: localStorage or IndexedDB (client-side only)
- **Challenges**:
  - Validate JSON structure
  - Handle missing fields gracefully
  - Privacy considerations (all client-side)

#### Multiple Data Sources
- **Goal**: Support CSV, Excel, other apps (Strong, StrongLifts, Fitbod)
- **Approach**:
  1. Client-side parsers (Papa Parse for CSV)
  2. Normalization layer to `training_data.json` schema
  3. Data source selector UI
- **Complexity**: Each app has different schema

#### Additional Visualizations
- **Injury Timeline**: Track deloads/injuries
- **Set Volume Breakdown**: Warmup vs working sets
- **Rep Range Analysis**: Where do you spend most volume?
- **Muscle Group Balance**: Push/Pull/Legs distribution

### Nice-to-Haves (From Requirements)

#### Locale-Aware Formatting
```javascript
// Future enhancement
const locale = navigator.language  // e.g., 'en-US', 'de-DE'
new Intl.DateTimeFormat(locale).format(date)
new Intl.NumberFormat(locale).format(number)
```

#### Internationalization (i18n)
- **Current**: All text hardcoded in English
- **Future**: String extraction, translation files
- **Libraries**: `preact-i18n` or custom solution

#### Export Features
- **PDF Report**: Summary stats + charts
- **Share Image**: Social media card generator
- **CSV Export**: Raw data for external analysis

#### Comparison Mode
- **Feature**: Compare two time periods
- **UX**: Date range picker
- **Visualization**: Side-by-side or overlay charts

#### Mobile App
- **Vision**: Native iOS/Android app
- **Approach**: React Native or Capacitor.js
- **Advantage**: Offline access, push notifications for PRs

### Technical Debt & Improvements

#### TypeScript Migration
- **Current**: JavaScript with JSDoc comments
- **Future**: Full TypeScript for type safety
- **Benefit**: Better IDE support, catch bugs earlier

#### Testing
- **Unit Tests**: Vitest (Vite-native)
- **Component Tests**: Preact Testing Library
- **E2E Tests**: Playwright
- **Coverage Target**: 80%+

#### Accessibility Audit
- **Screen Reader Testing**: NVDA/JAWS/VoiceOver
- **Keyboard Navigation**: Tab order, skip links
- **ARIA Attributes**: Proper semantic HTML
- **Color Contrast**: WCAG AA compliance

#### Performance Monitoring
- **Real User Monitoring**: Google Analytics, Sentry
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Bundle Analysis**: `rollup-plugin-visualizer`

---

## Verification Checklist

- [x] File created at repository root: `C:\source\blog\static\dashboard-next\ANALYSIS.md`
- [x] All 14 sections from plan included
- [x] Markdown formatting correct (tables, code blocks, headings)
- [x] Accurate technology versions from `package.json`
- [x] Complete data model from `training_data.md`
- [x] Component inventory matches actual source files
- [x] State management details from `settings.js`
- [x] Design system from `styles/index.css`
- [x] Build configuration from `vite.config.js`
- [x] Future considerations from `PLAN.md`

---

## Appendix: Quick Reference

### Key Files to Understand the Codebase
1. `src/App.jsx` - Entry point, data orchestration
2. `src/state/settings.js` - Global state (theme, units)
3. `src/utils/data.js` - Data loading and caching
4. `src/styles/index.css` - Design tokens and base styles
5. `data/training_data.md` - Data structure reference
6. `vite.config.js` - Build configuration

### Common Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
python data/extract_data.py  # Regenerate JSON from SQLite
```

### Important URLs
- **Development**: http://localhost:5173
- **Production**: https://bradleycarey.com/dashboard/
- **Source Repo**: https://github.com/avianbc/blog
- **Hugo Theme**: https://github.com/luizdepra/hugo-coder

### Key Metrics
- 6+ years of data
- 969 workouts
- 6.8M lbs lifted
- 800KB JSON
- ~50KB main bundle (gzipped)
- ~1.5MB total first load

---

*Last Updated*: 2026-01-24
*Repository*: `C:\source\blog\static\dashboard-next`
*Author*: Bradley Carey
*Purpose*: Personal strength training analytics dashboard
