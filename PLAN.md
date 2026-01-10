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

| Stat | Value | Notes |
|------|-------|-------|
| Total Volume | 3,416 tons | Big animated number |
| Total Workouts | 969 | ~6 years of consistency |
| Hours Trained | 734 | ~30 days non-stop |
| Bar Travel | 32+ miles | Unique, relatable metric |
| Training Since | Jan 2019 | Years of commitment |

**Implementation**: Large stat cards with count-up animations on load.

---

### 2. Workout Consistency Calendar
*Goal: Show dedication visually, like GitHub contribution graph*

- GitHub-style heatmap (964 workout days)
- Color intensity = volume that day
- Year selector or scrollable view
- Hover shows date + volume + workout count

**Data source**: `workoutCalendar`

---

### 3. Strength Progression Charts
*Goal: Core value for lifters - see progress over time*

#### 3a. Big Three E1RM Over Time (Line Chart)
- Squat, Bench, Deadlift, OHP lines
- Monthly granularity
- Hover shows exact values
- Option to toggle lifts on/off

**Data source**: `bigThreeE1RM`

#### 3b. Powerlifting Total Progression
- Combined S+B+D total over time
- Highlight club milestones (500/750/1000/1100/1200 lbs)
- Current vs Peak indicator

**Data source**: `powerliftingTotals`

---

### 4. Plate Milestones Timeline
*Goal: Celebrate strength achievements in a way anyone understands*

Visual timeline showing first time hitting:
- 1 plate (135 lbs)
- 2 plates (225 lbs)
- 3 plates (315 lbs)
- 4+ plates (405+ lbs)

For each major lift (Squat, Bench, Deadlift).

**Data source**: `plateMilestones`

---

### 5. Relative Strength & Benchmarks
*Goal: Context for experienced lifters*

#### 5a. Body Weight Multiples
- Current multiples (Squat: 2.22x, Bench: 1.52x, Deadlift: 2.58x)
- Visual gauge or progress bar vs benchmarks
- Benchmarks: Beginner → Intermediate → Advanced → Elite

#### 5b. Wilks Score
- Current: 325, Best: 348
- Visual comparison to population benchmarks

**Data source**: `relativeStrength`

---

### 6. Volume Analytics

#### 6a. Monthly Volume Trend (Area Chart)
- Volume over time with best month highlighted
- Rolling average overlay

**Data source**: `volumeTimeSeries.monthly`

#### 6b. Workouts by Day of Week (Bar Chart)
- Shows training schedule patterns
- Helpful for identifying consistency

**Data source**: `workoutsByDayOfWeek`

---

### 7. Training Programs Timeline
*Goal: Show evolution and experimentation*

Horizontal timeline showing:
- Program name, date range
- PRs set during program
- Total volume in program

**Data source**: `programs`

---

### 8. Personal Records Section

#### 8a. All-Time PRs Table/Cards
- Sortable/filterable list
- Shows weight, reps, estimated 1RM, date

#### 8b. Days Since Last PR Warnings
- Highlight lifts that haven't seen a PR recently
- Gamification element

**Data source**: `allTimePRs`, `daysSinceLastPR`

---

### 9. Milestones Achievement Gallery
*Goal: Celebrate key achievements*

- Volume milestones (100K, 250K, 500K, 1M, etc.)
- Club milestones (500/1000/1200 lb totals)
- Plate milestones (combined view)

**Data source**: `milestones`, `plateMilestones`, `powerliftingTotals.clubMilestones`

---

### 10. Exercise Deep Dive (Optional/Expandable)
*Goal: Granular analysis for power users*

- Per-exercise volume over time
- Exercise frequency
- PR history per exercise

**Data source**: `exerciseProgress`

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
| **Icons** | Lucide | Modern, 1000+ icons, includes fitness/chart/UI icons, MIT licensed |
| **Number Formatting** | `Intl.NumberFormat` | Native, no bundle cost, locale-aware |
| **Date Formatting** | `Intl.DateTimeFormat` | Native; add `date-fns` only if needed |
| **Animations** | CSS + Intersection Observer | Scroll-triggered reveals, count-up animations |
| **Calendar Heatmap** | Custom ECharts implementation | ECharts has excellent heatmap support |

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

## Confirmed Decisions

| Decision | Choice |
|----------|--------|
| **Framework** | Preact (React-compatible, 3KB) |
| **Charts** | ECharts (with echarts-for-react) |
| **Build Tool** | Vite |
| **Styling** | CSS Modules + Custom Properties |
| **Icons** | Lucide |
| **Data Loading** | Build-time embed |
| **Device Priority** | Desktop-first |
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

1. Initialize Vite + Preact project
2. Set up project structure (components, styles, data)
3. Create base layout and navigation
4. Implement hero/summary section first (quick win)
5. Add charts incrementally, testing each
6. Implement unit toggle and theme toggle
7. Polish responsive design
8. Deploy to static hosting
