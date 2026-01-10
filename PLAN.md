# Implementation Plan

The goal of this document is to take the requirements from `REQUIREMENTS.md` and break them down into an implementation plan.

## Data Summary

The `training_data.json` contains rich workout data spanning 2019-01-23 to 2025-10-24 (~6 years):
- **969 workouts**, 9,620 sets, 59,036 reps
- **6.8M lbs** (3,416 tons) total volume lifted
- **734 hours** in the gym
- **43 exercises** tracked with PRs
- **5+ training programs** documented
- **Powerlifting total**: 1,276 lbs (squat 442, bench 321, deadlift 513)

---

## Charts/Visualizations/Sections

### 1. Hero/Summary Section
*Goal: Impressive to everyone, immediately communicates scale of dedication*

| Stat | Value | Comparative Context |
|------|-------|---------------------|
| Total Volume | 3,416 tons | "Equivalent to lifting 2,000+ Honda Civics" |
| Total Workouts | 969 | "6 years of consistency" |
| Hours Trained | 734 | "30 days straight in the gym" |
| Bar Travel | 29.35 miles | "Climbed Mount Everest 5.3x" |
| Training Since | Jan 2019 | Calculate dynamically: "X years, Y months" |

**Implementation**:
- Single hero card with primary stat (powerlifting total or volume) prominently displayed
- Secondary stats as smaller elements below for clear visual hierarchy
- Count-up animations: animate only on first view (Intersection Observer + localStorage flag)
- Respect `prefers-reduced-motion` media query
- Keep animations fast (< 1.5s)

**Data source**: `summary`, `barTravel.landmarks`

---

### 2. Workout Consistency Calendar
*Goal: Show dedication visually, like GitHub contribution graph*

**Primary approach**: Year-by-year cards stacked vertically
- Each year is a full heatmap card (simpler than continuous scroll)
- Users scroll page naturally to see full history
- Color intensity uses **percentile-based buckets** (0-25%, 25-50%, 50-75%, 75%+) not linear scaling
- Hover shows: date, volume, workout count

**Alternative** (more complex): Multi-year horizontal scroll with sticky year headers

**Implementation notes**:
- 6 years × 52 weeks × 7 days = ~2,200 cells total
- Consider virtualization if performance issues arise
- Mobile: Single year view with year picker dropdown

**Data source**: `workoutCalendar`

---

### 3. Strength Progression Charts
*Goal: Core value for lifters - see progress over time*

#### 3a. Big Three E1RM Over Time
- **Primary view**: Running PR line (monotonically increasing, shows exactly when each PR was set)
- **Secondary view**: Toggle to see raw E1RM scatter with trend line overlay
- Per-workout data (500+ points per lift) - do NOT aggregate to monthly
- Use **30-day rolling average** to smooth noise, with raw points as semi-transparent dots behind

**Chart approach**: Small multiples (4 separate mini-charts stacked vertically) OR tabs/toggle to show one lift at a time
- Avoid 4 lines on one chart (too cluttered)
- Consider area chart for single-lift view (more visual impact)

**Data source**: `bigThreeE1RM.e1rmHistory`

#### 3b. Powerlifting Total Progression
- **Area chart** showing total over time (requires `powerliftingTotals.history`)
- Horizontal milestone lines at 500/750/1000/1100/1200 with labels
- Peak annotation marking all-time best point
- **Stacked option**: Toggle to see S/B/D contribution stacked

**Data source**: `powerliftingTotals` (NOTE: Must include `history` array - see Data Export section)

---

### 4. Plate Milestones Achievement Grid
*Goal: Celebrate strength achievements in a way anyone understands*

**Implementation**: Achievement cards grid (NOT timeline)
- 4×5 grid: rows = lifts (S/B/D/OHP), columns = plate counts (1-5)
- Unlocked achievements glow/highlight with date achieved
- Locked achievements grayed out (shows what's left to achieve)
- Very "gamification" feel that matches celebration goal

| | 1 Plate (135) | 2 Plates (225) | 3 Plates (315) | 4 Plates (405) | 5 Plates (495) |
|---|---|---|---|---|---|
| Squat | ✓ | ✓ | ✓ | | |
| Bench | ✓ | ✓ | | | |
| Deadlift | ✓ | ✓ | ✓ | ✓ | |
| OHP | ✓ | | | | |

**Why grid over timeline**: Simpler, more impactful, shows both achievements AND goals. Save timeline for Programs section.

**Data source**: `plateMilestones`

---

### 5. Relative Strength & Benchmarks
*Goal: Context for experienced lifters*

#### 5a. Body Weight Multiples
- **Bullet charts** (NOT gauges - gauges waste space and are hard to compare)
- 4 horizontal bullet bars stacked vertically (S/B/D/OHP)
- Background bands showing beginner/intermediate/advanced/elite ranges
- Your value as a bold bar, showing at a glance: "Advanced on squat/deadlift, intermediate on bench"
- Very Tufte-approved (high data-ink ratio)

#### 5b. Wilks Score
- **CSS-based scale bar** (no ECharts needed)
- Horizontal line from 0 to 500 (world class)
- Benchmark zones with subtle colors
- Current and best marked with different indicators

**Data source**: `relativeStrength`

---

### 6. Volume Analytics

#### 6a. Monthly Volume Trend (Area Chart)
- Area chart with **3-month rolling average** overlay for smoothing
- Best month highlighted with annotation
- **Default to last 2 years** with "show all" toggle (72+ months is crowded)
- Vertical lines at year boundaries for readability
- Add yearly aggregation view as alternative

**Data source**: `volumeTimeSeries.monthly`

#### 6b. Workouts by Day of Week (Horizontal Bar Chart)
- Horizontal bars, sorted by count (not day order)
- Show both count AND average volume (dual bars or text labels)
- Annotation: "Most active: Monday (235 workouts)"

**Data source**: `workoutsByDayOfWeek`

---

### 7. Training Programs
*Goal: Show evolution and experimentation*

**Implementation**: Vertical card list (NOT horizontal timeline)
- 17 programs over 6 years with overlaps - too crowded for horizontal
- Simple scrollable list of program cards
- Each card shows: name, date range, workouts, PRs set, total volume
- Sorted by start date with time markers on the side
- CSS-only (no ECharts needed)

**Why vertical list over Gantt/timeline**: Easier to implement, actually more readable, handles overlapping programs gracefully.

**Data source**: `programs`

---

### 8. Personal Records Section

#### 8a. All-Time PRs Grid
- **Rep PR grid** for compact overview:
  - Rows: Lifts (S/B/D/OHP + accessories)
  - Columns: Rep ranges (1-5 or 1-10)
  - Cells: Weight achieved
  - Heat coloring by relative strength or recency
- Click cell to expand with date/details
- Filterable by lift category

#### 8b. Days Since Last PR (Subtle Indicator)
- Show as subtle indicator on PR cards, NOT a separate "warning" section
- Frame as opportunity not failure: "Time to chase a new one?"
- Note: Current data shows ~1146 days for all lifts - verify this is correct

**Data source**: `allTimePRs`, `daysSinceLastPR`

---

### 9. Milestones Achievement Gallery
*Goal: Celebrate key achievements*

- Volume milestones (100K, 250K, 500K, 1M, etc.)
- Club milestones (500/1000/1200 lb totals)
- Plate milestones (combined view)

**Data source**: `milestones`, `plateMilestones`, `powerliftingTotals.clubMilestones`

---

### 10. Exercise Deep Dive (FIRST-CLASS SECTION)
*Goal: Main interactive feature - most valuable section for serious lifters*

**This should NOT be optional** - it's the drill-down from summary sections.

**Implementation**:
- Searchable/filterable exercise list (43 exercises)
- Per-exercise detail view:
  - Volume over time (sparkline or small chart)
  - PR progression timeline
  - Frequency (workouts per month)
  - Last performed date
  - Total volume, sets, reps

**UX**: Everything else is summary, this is the deep dive. Consider as the main interactive feature of the dashboard.

**Data source**: `exerciseProgress`

---

### 11. Bar Travel Visualization (NEW - Engagement Feature)
*Goal: Impressive to non-lifters, shareable*

**Data available**:
```json
"barTravel": {
  "total": { "miles": 29.35 },
  "landmarks": { "everestClimbs": 5.34, "empireStateBuildings": 106 }
}
```

**Implementation**: Fun, visual comparison graphic
- Visual of Mt. Everest with "5.3 climbs" marker
- Or Empire State Building × 106
- Pure engagement/shareability feature
- CSS-only, no ECharts needed

**Data source**: `barTravel`

---

### 12. Body Weight Chart (NEW)
*Goal: Context for relative strength interpretation*

**Data available**:
```json
"bodyWeight": {
  "current": { "lbs": 205.0 },
  "starting": { "lbs": 180.0 },
  "monthlyTimeline": [...]
}
```

**Implementation**: Small line chart showing body weight over time
- Helps interpret relative strength changes
- Simple sparkline-style chart

**Data source**: `bodyWeight`

---

## Technologies

### Core Stack

| Category | Choice | Rationale |
|----------|--------|-----------|
| **Build Tool** | Vite | Fast HMR, excellent static site support, tree-shaking |
| **Framework** | Preact | React-compatible API (~3KB), transferable skills, great ecosystem |
| **Styling** | CSS Modules + Custom Properties | Scoped styles, theming via variables, modern CSS Grid/Flexbox |
| **Charts** | ECharts | Highly customizable, supports Tufte-style visualizations, excellent defaults |

**Key packages**: `preact`, `preact/compat`, `echarts`, `echarts-for-react`

### Libraries & Utilities

| Purpose | Choice | Notes |
|---------|--------|-------|
| **State Management** | Preact Signals | Lightweight reactive state for unit toggle, theme, filters. Avoid Redux/Zustand - overkill for this project |
| **Icons** | Lucide | Modern, 1000+ icons, includes fitness/chart/UI icons, MIT licensed |
| **Number Formatting** | `Intl.NumberFormat` | Native, no bundle cost, locale-aware |
| **Date Formatting** | `Intl.DateTimeFormat` | Native; add `date-fns` only if needed |
| **Animations** | CSS + Intersection Observer | Scroll-triggered reveals, count-up animations |
| **Calendar Heatmap** | Custom ECharts implementation | ECharts has excellent heatmap support |

#### State Management Example
```javascript
// state/settings.js
import { signal, computed } from '@preact/signals'

export const unit = signal('imperial')  // 'imperial' | 'metric'
export const theme = signal('auto')     // 'light' | 'dark' | 'auto'

// Derived
export const isMetric = computed(() => unit.value === 'metric')
```

### Bundle Size Estimate

| Library | Size (gzipped) |
|---------|----------------|
| Preact runtime | ~3KB |
| ECharts (tree-shaken) | ~150KB (full) / ~80KB (core charts only) |
| Lucide (tree-shaken) | ~1KB per icon used |
| **Total estimate** | ~100-150KB |

### Requirements Mapping

| Requirement | Implementation |
|-------------|----------------|
| Metric/Imperial toggle | Global Preact context/state, all data has both units pre-computed |
| Light/Dark mode | CSS custom properties, `prefers-color-scheme` + manual toggle |
| Loading states | Skeleton components with CSS shimmer animation |
| Empty states | Graceful fallback messages with icons |
| Error states | Error boundary components with retry option |
| a11y | Semantic HTML, ARIA labels, keyboard navigation, WCAG color contrast |
| i18n | `Intl` APIs for dates/numbers; full i18n deferred to nice-to-have |
| Responsive | Desktop-first, ensure mobile usability |

---

## Design System / UX UI

### Existing Blog Design Tokens (from hugo-coder)

| Token | Light | Dark |
|-------|-------|------|
| Background | `#fafafa` | `#212121` |
| Foreground | `#212121` | `#dadada` |
| Alt Background | `#e0e0e0` | `#424242` |
| Link Color | `#1565c0` | `#42a5f5` |
| Font | System stack (Segoe UI, Roboto, etc.) | Same |
| Code Font | SFMono-Regular, Consolas, Menlo | Same |

### Dashboard Design Tokens (Proposed)

Extend the blog palette with semantic colors for data visualization:

| Purpose | Light Mode | Dark Mode |
|---------|------------|-----------|
| **Base Background** | `#fafafa` | `#1a1a2e` (slightly blue-tinted for depth) |
| **Card Background** | `#ffffff` | `#242438` |
| **Text Primary** | `#212121` | `#e0e0e0` |
| **Text Secondary** | `#666666` | `#a0a0a0` |
| **Squat** | `#2563eb` (blue) | `#60a5fa` |
| **Bench** | `#dc2626` (red) | `#f87171` |
| **Deadlift** | `#16a34a` (green) | `#4ade80` |
| **OHP** | `#9333ea` (purple) | `#c084fc` |
| **Accent/Highlight** | `#f59e0b` (amber) | `#fbbf24` |
| **Success** | `#22c55e` | `#4ade80` |
| **Warning** | `#eab308` | `#facc15` |
| **Error** | `#ef4444` | `#f87171` |

### Typography Scale

```css
--font-xs: 0.75rem;    /* 12px - labels, captions */
--font-sm: 0.875rem;   /* 14px - secondary text */
--font-base: 1rem;     /* 16px - body text */
--font-lg: 1.125rem;   /* 18px - emphasis */
--font-xl: 1.25rem;    /* 20px - section headers */
--font-2xl: 1.5rem;    /* 24px - card titles */
--font-3xl: 1.875rem;  /* 30px - page sections */
--font-4xl: 2.25rem;   /* 36px - hero stats */
--font-5xl: 3rem;      /* 48px - main hero number */
```

### Spacing System (8px base)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Breakpoints

```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

### Component Patterns

#### Cards
```css
.card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

#### Stat Display (Hero Numbers)
```css
.stat-value {
  font-size: var(--font-5xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.stat-label {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

#### Loading State
```css
.skeleton {
  background: linear-gradient(90deg, var(--color-skeleton) 25%, var(--color-skeleton-highlight) 50%, var(--color-skeleton) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Accessibility Considerations

- All text meets WCAG AA contrast ratios (4.5:1 for body, 3:1 for large text)
- Chart colors distinguishable with colorblindness (tested with simulation)
- Interactive elements have focus states
- Charts have text alternatives (data tables on request)
- Semantic HTML (headings, landmarks)
- Skip-to-content link

### Design Principles (Tufte-Inspired)

Following Edward Tufte's "Envisioning Information" principles:

| Principle | Application in Dashboard |
|-----------|-------------------------|
| **Data-ink ratio** | Minimize non-data pixels. No decorative gradients, shadows, or 3D effects |
| **Small multiples** | Use repeated mini-charts for exercise comparisons, monthly trends |
| **Micro/macro readings** | Overview stats visible at glance; details on hover/drill-down |
| **Layering & separation** | Use whitespace and subtle borders, not heavy dividers |
| **No chartjunk** | Every visual element must convey data. No purely decorative elements |
| **High data density** | Pack meaningful information; avoid empty space |

### Chart Variety Strategy

To avoid repetition while maintaining coherence:

| Data Type | Visualization | Why This Form |
|-----------|---------------|---------------|
| Progression over time | Sparklines + line charts | Shows trend direction |
| Calendar data | Heatmap | Natural mapping to time |
| Comparisons | Horizontal bars | Easy to read values |
| Proportions | Treemap or waffle chart | Better than pie charts |
| Benchmarks | Bullet charts or gauges | Shows target vs actual |
| Distributions | Strip plots or histograms | Shows spread, not just average |
| Rankings | Slope charts | Shows change in rank |
| Milestones | Timeline with markers | Narrative flow |

### Visual Consistency

- **Color palette**: Limited colors with semantic meaning (e.g., blue=squat, red=bench, green=deadlift)
- **Typography**: Single font family, clear hierarchy
- **Spacing**: Consistent grid system (8px base unit)
- **Animation**: Purposeful only (entry animations, data updates), not decorative

---

## Hosting and Deployment

### Decision: Hugo /static folder

**Why**: Simplest path to deployment with existing setup.

```
blog/
├── static/
│   └── dashboard/          <- Vite builds here
│       ├── index.html
│       ├── assets/
│       └── data/
│           └── training_data.json
```

**Workflow**:
1. Develop dashboard in `static/dashboard/` with its own `package.json`
2. Run `npm run build` -> outputs to `static/dashboard/dist/`
3. Hugo copies static files to `public/dashboard/`
4. Netlify deploys as usual
5. Access at: `bradleycarey.com/dashboard/`

**Alternative if coupling becomes painful**: Move to subdomain later (easy migration).

### Netlify Configuration

Update `netlify.toml`:
```toml
[build]
command = "cd static/dashboard && npm ci && npm run build && cd ../.. && hugo"
publish = "public"
```

---

## Future Considerations

### User Data Upload (Nice-to-have)
- Client-side JSON parsing (no backend needed)
- File input component with drag-drop
- Validation against expected schema
- Privacy-first: all processing in browser

### Multiple Data Sources
- Abstract data loading into a service layer
- Support different input formats (CSV, other apps)
- Keep transformation logic separate from visualization

---

## Responsive Strategy

| Section | Desktop (1024px+) | Tablet (768px) | Mobile (640px) |
|---------|-------------------|----------------|----------------|
| Hero Stats | 5 cards in row | 3+2 grid | Stacked (2+2+1) |
| Calendar | Full year cards | Same | Single year + picker |
| Line Charts | Full width | Same | Taller aspect ratio |
| Day of Week | Horizontal bars | Same | Vertical bars |
| Programs | Cards in grid | Single column | Same |
| Exercise Deep Dive | Table view | Card view | Accordion |

**Key breakpoints**:
- 1024px: Desktop (full features)
- 768px: Tablet (maintain most features)
- 640px: Mobile (simplify heatmap, stack everything)

---

## Performance Budget

| Metric | Target |
|--------|--------|
| JS bundle (gzipped) | < 150KB |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Performance | > 90 |
| JSON data file | < 500KB |

**Note**: `training_data.json` with full `bigThreeE1RM.e1rmHistory` is potentially large (2000+ points × 4 lifts). Mitigate with gzip compression on server.

---

## Data Export Changes Required

**CRITICAL**: Before implementation, modify `data/extract_data.py`:

1. **Include full powerlifting total history**:
   ```python
   # Line 1487-1491: Change from subset to full
   'powerliftingTotals': powerlifting_totals,  # Include 'history' array
   ```

2. **Verify `daysSinceLastPR` calculation** - current data shows ~1146 days for all lifts

3. **Sync `training_data.md` documentation** with actual output structure

Without the `powerliftingTotals.history` array, section 3b (Powerlifting Total Progression) cannot be implemented.

---

## Confirmed Decisions

| Decision | Choice |
|----------|--------|
| **Framework** | Preact (React-compatible, 3KB) |
| **State Management** | Preact Signals (lightweight, reactive) |
| **Charts** | ECharts (with echarts-for-react) |
| **Build Tool** | Vite |
| **Styling** | CSS Modules + Custom Properties |
| **Icons** | Lucide |
| **Data Loading** | Build-time embed |
| **Device Priority** | Desktop-first, responsive |
| **Hosting** | Hugo /static folder -> bradleycarey.com/dashboard/ |
| **CSS Framework** | None (CSS Modules, no Tailwind) |
| **Color Scheme** | TBD (defer to design phase) |

---

## Verification Strategy

### Development Testing
1. `npm run dev` - Local development server with HMR
2. Verify all chart types render correctly with real data
3. Test metric/imperial toggle updates all values
4. Test light/dark mode toggle
5. Verify responsive behavior on mobile viewports

### Production Testing
1. `npm run build` - Production build
2. `npm run preview` - Preview production build locally
3. Verify bundle size is reasonable (<200KB gzipped)
4. Test on bradleycarey.com static hosting (Hugo integration)
5. Lighthouse audit for performance, accessibility

---

## Next Steps

### ✅ Phase 1: Foundation (COMPLETED)
1. ✅ Initialize Vite + Preact project
2. ✅ Set up project structure (components, styles, data)
3. ✅ Configure design tokens and global CSS
4. ✅ Create state management (Preact Signals for theme/unit toggles)
5. ✅ Create data loading utilities with formatting helpers
6. ✅ Create base layout and navigation header
7. ✅ Implement hero/summary section with animated count-ups
8. ✅ Implement unit toggle (imperial/metric) and theme toggle (light/dark/auto)

**Status**: Basic app structure complete with header, hero section, and working toggles

### ✅ Phase 2: Core Visualizations (COMPLETED)
9. ✅ Add Workout Consistency Calendar (heatmap) - VERIFIED WORKING
   - ✅ Year-by-year cards stacked vertically (desktop)
   - ✅ Percentile-based color buckets for intensity (GitHub-style)
   - ✅ Hover tooltips with date, volume, workout count
   - ✅ Mobile: Single year view with year picker dropdown
   - ✅ All 7 years (2019-2025) rendering correctly
   - ✅ Data loading fixed (converted object to array format)
   - ✅ Hero section animations working
   - ✅ **Light mode tested** - All elements readable, proper contrast
   - ✅ **Dark mode tested** - Colors stand out, no readability issues
   - ✅ **Mobile responsive** (375x667) - Year picker functional
   - ✅ **Desktop responsive** (1280x800) - All years visible
   - ✅ **Performance verified** - ~2,200 cells render smoothly

10. ✅ Add Strength Progression Charts (E1RM over time) - VERIFIED WORKING
   - ✅ Four lift charts (Squat, Bench, Deadlift, OHP) in responsive grid
   - ✅ Toggle between "Running PR" (step chart) and "Raw E1RM" (scatter + 30-day rolling average)
   - ✅ Running PR view shows monotonically increasing PRs with step chart
   - ✅ Raw E1RM view shows semi-transparent scatter points + smooth 30-day rolling average line
   - ✅ Proper color coding per lift (blue/red/green/purple)
   - ✅ **Light mode tested** - Excellent contrast, readable axes and labels
   - ✅ **Dark mode tested** - Lighter color variants, good contrast on dark background
   - ✅ **Unit toggle tested** - Charts update correctly from lbs to kg
   - ✅ **Toggle functionality verified** - Smooth transitions between views

11. ✅ Add Powerlifting Total Progression chart - VERIFIED WORKING
   - ✅ Area chart showing total progression over time
   - ✅ Peak annotation marking all-time best (1276 lbs / 580 kg)
   - ✅ Milestone lines at 500/750/1000/1100/1200 lb clubs (imperial only)
   - ✅ Golden/amber gradient area fill for visual impact
   - ✅ **Light mode tested** - Clean area fill, readable milestone labels
   - ✅ **Dark mode tested** - Proper gradient opacity, visible on dark background
   - ✅ **Unit toggle tested** - Switches correctly between lbs and kg

**Status**: Phase 2 complete! Heatmap and strength progression charts fully implemented and verified in both light/dark modes with unit toggling.

### 📋 Phase 3: Additional Sections (IN PROGRESS)
13. ✅ Add Plate Milestones achievement grid - VERIFIED WORKING
   - ✅ 4×5 grid layout (4 lifts × 5 plate counts)
   - ✅ Color-coded borders per lift (Squat=blue, Bench=red, Deadlift=green, OHP=purple)
   - ✅ Unlocked achievements show checkmark, weight, and date
   - ✅ Locked achievements show lock icon with reduced opacity
   - ✅ Gradient backgrounds on unlocked cards
   - ✅ Legend showing "Achieved" vs "Locked"
   - ✅ **Light mode tested** - Clean white cards with subtle gradients, excellent readability
   - ✅ **Dark mode tested** - Dark backgrounds with vibrant colored borders
   - ✅ **Unit toggle tested** - Switches between lbs/kg correctly
   - ✅ **Mobile responsive** - Grid scales appropriately for smaller screens
   - ✅ Hover effects on unlocked cards (lift/scale animation)
14. ✅ Add Relative Strength & Benchmarks - VERIFIED WORKING
   - ✅ Bullet charts for bodyweight multiples (S/B/D/OHP)
   - ✅ Background bands showing strength standards (Untrained → Novice → Intermediate → Advanced → Elite)
   - ✅ Current value bars with color-coding per lift
   - ✅ Best value markers as dashed lines
   - ✅ Strength level classification (e.g., "Advanced", "Novice")
   - ✅ CSS-based Wilks score visualization
   - ✅ Benchmark zones (Beginner → Intermediate → Advanced → Elite → World Class)
   - ✅ Current and Best markers on Wilks scale
   - ✅ **Light mode tested** - Excellent contrast, readable labels and scales
   - ✅ **Dark mode tested** - Inverted band colors (darker to lighter), proper visibility
   - ✅ **Responsive layout** - Stats adapt for mobile viewports
15. Add Volume Analytics (monthly trends, day of week)
16. Add Training Programs timeline
17. Add Personal Records section
18. Add Exercise Deep Dive (main interactive feature)

### 🎨 Phase 4: Polish & Deploy (TODO)
19. Polish responsive design
20. Performance optimization
21. Accessibility audit
22. Deploy to static hosting
