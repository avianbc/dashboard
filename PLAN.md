# Strength Training Dashboard - Implementation Plan

## Current State
- ✅ Data extraction scripts (extract_data.py, fix_stronglifts_dates.py)
- ✅ training_data.json generated with rich workout data (800KB, 969 workouts)
- ✅ REQUIREMENTS.md defined
- ❌ SvelteKit project not initialized
- ❌ No dashboard components built

## Key Technical Decisions (Finalized)

### 1. Charting Library: **ECharts**
- **Why**: High-level API, impressive out-of-box visuals, good performance
- **Alternative considered**: D3.js (rejected: too low-level, longer dev time)

### 2. Icon Library: **lucide-svelte**
- **Why**: Clean modern design, tree-shakeable, good Svelte integration
- **Alternative considered**: heroicons (similar quality, lucide slightly preferred)

### 3. Date Formatting: **date-fns**
- **Why**: Lightweight, modular, excellent TypeScript support
- **Alternative considered**: dayjs (similar but date-fns has better tree-shaking)

### 4. Data Loading Strategy: **Async fetch from static/**
- **Why**: 800KB JSON too large to bundle, better caching, faster initial load
- **Location**: `static/data/training_data.json`

### 5. Styling Approach: **Modern CSS (custom properties, grid, flexbox)**
- **Why**: No preprocessor needed, better browser support, simpler build
- **No Tailwind**: Keep dependencies minimal, more control over design

### 6. Unit System: **Client-side toggle with localStorage persistence**
- **Default**: Imperial (lbs) based on data source
- **Toggle**: Allow user to switch to metric

### 7. SvelteKit Adapter: **adapter-static**
- **Why**: No backend needed, deploy to any static host
- **Config**: Prerender all pages, no SSR needed

## Data Structure Analysis

### Complete Data Inventory

From training_data.json (800KB, 6+ years of training data), we have:

| Data Section | Count/Size | Key Fields | Use Cases |
|--------------|------------|------------|-----------|
| `summary` | 1 object | totalWorkouts (969), totalVolumeLbs (6.8M), totalHours (734), totalReps (59k), totalSets (9620), bestMonthEver, bestYearEver | Hero stats cards |
| `volumeTimeSeries` | 964 daily, 285 weekly, 68 monthly, 7 yearly | date, volumeLbs/Kg, workouts | Main volume chart, trends |
| `workoutCalendar` | 964 dates | count, volumeLbs/Kg | Calendar heatmap |
| `exerciseProgress` | 43 exercises | totalVolume, firstPerformed, lastPerformed, prs[] | Exercise-specific insights |
| `bigThreeE1RM` | 315-403 points per lift | date, e1rmLbs, actualWeightLbs, reps | Strength progression charts |
| `bigThreeVolume` | History per lift | dailyVolume by lift | Lift-specific volume analysis |
| `programs` | 17 programs | name, dates, workouts, volume, prsSet | Program effectiveness comparison |
| `workoutsByDayOfWeek` | 7 days | count, avgVolumeLbs | Weekly pattern visualization |
| `notableWorkouts` | 15 entries | date, reason, category, volume | Special achievements timeline |
| `milestones` | 16 entries | date, milestone text (volume thresholds) | Achievement timeline |
| `plateMilestones` | 4 lifts × up to 4 plates | date, weightLbs for 135/225/315/405 | Plate achievement visualization |
| `powerliftingTotals` | current + peak + 5 clubs | totalLbs, squatE1rm, benchE1rm, deadliftE1rm | Total progress, club badges |
| `allTimePRs` | 4 lifts | repPRs (1-10 reps), maxEver, bestE1rm | PR matrix table |
| `daysSinceLastPR` | 4 lifts | days (squat: 243, bench: 190, deadlift: 130, ohp: 241) | Motivation cards |
| `barTravel` | By lift + total | totalMiles (29.35), landmarks (5.34 Everests!) | Fun infographic |
| `bodyWeight` | Timeline | current, starting, monthlyTimeline, stalePeriods | Body weight tracking |
| `relativeStrength` | 4 lifts | best (2.22x squat), current, monthlyProgression | Strength-to-weight ratio |

### Notable Stats to Highlight

- **Duration**: 6.8 years (Jan 23, 2019 → Oct 24, 2025)
- **Best period**: 2021 (220 workouts, 1.7M lbs volume)
- **Peak strength**: 1,276 lbs total (442 squat + 321 bench + 513 deadlift e1rm)
- **Most impressive**: Bar traveled 29.35 miles = 5.34 Mt. Everest climbs
- **Consistency pattern**: Mon/Fri heavy (245 & 226 workouts), never on Sunday
- **Relative strength peak**: 2.22x bodyweight squat @ 180 lbs

---

## 🎨 UX Design Specification: "Iron Archive"

### Design Philosophy

**Concept**: A blend of industrial gym aesthetics with editorial data storytelling. The design should feel like opening a beautifully crafted training log - weighty, honest, and earned. Not flashy gym-bro neon, not sterile corporate dashboards. This is **artifact-quality** - something you'd want framed.

**Tone**: Warm industrial meets data journalism. Think: vintage weightlifting photography meets NYT interactive graphics. Gravitas without pretension.

**Memorable Element**: The massive hero stats hit like PRs - you feel the weight of 6.8 million pounds immediately. The warm copper accents make achievements glow like trophies.

**Dual Themes**:
- **Dark Mode ("Iron Archive")**: Deep charcoal backgrounds, chalk-white text, copper accents
- **Light Mode ("Chalk & Iron")**: Warm cream/paper backgrounds, iron-dark text, same copper accents

### Color System

**Shared Accent Colors** (both themes):
```css
:root {
  /* Accent - Earned Metal */
  --accent-copper: #c17f59;
  --accent-copper-hover: #d4936d;
  --accent-gold: #d4a84b;

  /* Lift Colors */
  --lift-squat: #c44536;        /* Deep red */
  --lift-bench: #4a7c9b;        /* Steel blue */
  --lift-deadlift: #4a8c5c;     /* Forest green */
  --lift-ohp: #c9a227;          /* Amber */

  /* Status Colors */
  --status-pr: #d4a84b;
  --status-recent: #4a8c5c;     /* < 90 days */
  --status-aging: #c9a227;      /* 90-180 days */
  --status-overdue: #c44536;    /* > 180 days */
}
```

**Dark Mode**:
```css
[data-theme="dark"] {
  --bg-deep: #0f0e0d;
  --bg-primary: #1a1816;
  --bg-elevated: #252220;
  --bg-card: #2d2926;
  --text-primary: #f5f2eb;
  --text-secondary: #a8a299;
  --text-muted: #6b6560;
}
```

**Light Mode**:
```css
[data-theme="light"] {
  --bg-deep: #f5f2eb;
  --bg-primary: #ebe7df;
  --bg-elevated: #ffffff;
  --bg-card: #ffffff;
  --text-primary: #1a1816;
  --text-secondary: #4a4640;
  --text-muted: #7a756e;
}
```

### Typography

**Font Stack**:
- **Display** (headlines): Bebas Neue
- **Body** (text): Source Sans 3
- **Mono** (data/numbers): JetBrains Mono

**Type Scale**: 0.75rem → 0.875rem → 1rem → 1.125rem → 1.25rem → 1.5rem → 2rem → 2.5rem → 3.5rem → 5rem

### Component Design Specifications

See full specifications in design plan for:
1. **Hero Stats Cards** - 3×2 grid, copper accents, staggered animation
2. **Volume Chart** - Area chart with gradient fill, theme-aware
3. **Big Three Chart** - Multi-line with lift colors, PR markers
4. **Calendar Heatmap** - GitHub-style, 12×12px cells
5. **PR Table** - Lift color-coding, monospace numbers
6. **Days Since PR** - Status color cards
7. **Day of Week Bars** - Horizontal bars showing patterns

**Full design specification**: `C:\Users\brad.carey\.claude\plans\jaunty-singing-patterson.md`

---

## 🚀 Quick Start: First Commands to Run

Once you're ready to begin implementation:

```bash
# 1. Initialize SvelteKit project (choose TypeScript, ESLint, Prettier)
pnpm create svelte@latest .

# 2. Install core dependencies
pnpm install

# 3. Install additional dependencies
pnpm add echarts lucide-svelte date-fns clsx
pnpm add -D @sveltejs/adapter-static

# 4. Start dev server
pnpm dev
```

---

## 🎯 MVP Feature Prioritization

To get a working impressive dashboard quickly, focus on these features first:

### Phase 1-2-3 (Core MVP - Get this working first!)
1. **Project setup** (Phase 1)
2. **Summary stat cards** (Phase 4.1) - Quick wins, immediately impressive
3. **Volume over time chart** (Phase 3.1) - Core visualization
4. **Basic layout and styling** (Phase 4.4)

### Phase 3-4 (Enhanced Dashboard)
5. **Exercise progress charts** (Phase 3.2)
6. **Personal records section** (Phase 4.2)
7. **Calendar heatmap** (Phase 3.4)
8. **Recent activity** (Phase 4.3)

### Phase 5-6 (Polish)
9. **Additional visualizations** (Phase 3.3, Phase 5)
10. **Performance optimization** (Phase 6.1)
11. **Responsive refinement** (Phase 6.2-6.4)

**Strategy**: Build vertically (complete features) rather than horizontally (half-built features). Get something impressive working quickly, then iterate.

---

## 📊 Detailed Visualization Specifications

### 1. HERO STATS CARDS ⭐ (MVP - Phase 1)

**Purpose**: Immediate visual impact with impressive lifetime numbers

**Data Source**: `summary`, `barTravel`, `powerliftingTotals`

**Six Cards**:
1. **Total Workouts**: 969 / "Since Jan 2019" / Calendar icon
2. **Total Volume**: 6.8M lbs / "3,417 tons lifted" / Weight icon
3. **Time Training**: 734 hours / "30+ days of your life" / Clock icon
4. **Bar Travel**: 29.4 miles / "5.3 Everest climbs" / Route icon
5. **Total Reps**: 59,036 / "9,620 total sets" / Repeat icon
6. **Powerlifting Total**: 1,276 lbs / "1200+ club member" / Trophy icon

**Design Notes**:
- Card dimensions: ~200x120px (desktop) → responsive stack
- Large bold number (2.5rem) with subtle gradient background
- Subtext in muted color (0.875rem)
- Icon (24px) in top-right with accent color
- Hover effect: subtle lift + shadow increase
- Grid: 3x2 (desktop) → 2x3 (tablet) → 1x6 (mobile)

---

### 2. VOLUME OVER TIME CHART ⭐ (MVP - Phase 1)

**Purpose**: Show 6+ years of training consistency and volume trends

**Data Source**: `volumeTimeSeries.monthly` (68 data points)

**Chart Type**: ECharts Area Chart with gradient fill

**Key Features**:
- X-axis: Months (Jan 2019 → Oct 2025)
- Y-axis: Volume (respects unit toggle: lbs/kg)
- Granularity toggle: Daily (964 pts) / Weekly (285 pts) / Monthly (68 pts)
- Gradient fill: from accent color (top) → transparent (bottom)
- Highlight best month: Apr 2021 (213,930 lbs)
- Annotations:
  - "COVID Gap" marker (Jun-Sep 2020)
  - "Best Month" badge
  - "Return to Training" markers after gaps
- Interactive: hover shows exact date + volume + workout count
- Optional: rolling 3-month average trendline (dashed line)

**Visual ASCII Approximation**:
```
   Volume (K lbs)
  250┤                    ╭╮
  200┤              ╭─────╯╰─╮
  150┤        ╭─────╯        ╰──╮
  100┤    ╭───╯                  ╰──╮___
   50┤╭───╯                             ╰───
     └────────────────────────────────────────
      2019  2020  2021  2022  2023  2024  2025
```

---

### 3. BIG THREE + OHP PROGRESSION ⭐ (MVP - Phase 1)

**Purpose**: Multi-lift strength progression over time (lifter's core metric)

**Data Source**: `bigThreeE1RM`
- Squat: 315 data points
- Bench: 403 data points
- Deadlift: 229 data points
- OHP: 301 data points

**Chart Type**: ECharts Multi-Line Chart

**Key Features**:
- 4 colored lines:
  - Squat: #EF4444 (red)
  - Bench: #3B82F6 (blue)
  - Deadlift: #10B981 (green)
  - OHP: #F59E0B (orange)
- Toggle buttons to show/hide individual lifts
- Star markers (⭐) at all-time PRs:
  - Squat: 442 lbs e1rm
  - Bench: 321 lbs e1rm
  - Deadlift: 513 lbs e1rm
  - OHP: 165 lbs e1rm
- Plate milestone horizontal lines (135/225/315/405)
- Hover tooltip shows: date, actual weight × reps, e1rm
- Zoom/pan enabled for detailed exploration

---

### 4. CALENDAR HEATMAP ⭐ (MVP - Phase 1)

**Purpose**: GitHub-style workout consistency visualization

**Data Source**: `workoutCalendar` (964 workout dates)

**Chart Type**: Calendar heatmap (can use ECharts or custom)

**Key Features**:
- Grid: 7 rows (Sun-Sat) × ~52 columns (weeks) per year
- Year selector tabs (2019-2025)
- Color scale based on volume:
  - 0 workouts: `#ebedf0` (very light gray)
  - 1-5K lbs: `#c6e48b` (light green)
  - 5-10K lbs: `#7bc96f` (medium green)
  - 10-15K lbs: `#239a3b` (dark green)
  - 15K+ lbs: `#196127` (very dark green)
- Hover shows: date, volume, workout count
- Visible patterns:
  - 2021: very dense (best year)
  - 2020 mid-year: noticeable gap
  - Strong Mon/Fri preference

---

### 5. DAY OF WEEK DISTRIBUTION (Phase 2)

**Purpose**: Show workout preferences and habits

**Data Source**: `workoutsByDayOfWeek`

**Chart Type**: Horizontal bar chart or radial bar chart

**Data**:
| Day | Workouts | Avg Volume |
|-----|----------|------------|
| Monday | 245 | 7,461 lbs |
| Friday | 226 | 7,600 lbs |
| Thursday | 179 | 6,476 lbs |
| Tuesday | 177 | 6,658 lbs |
| Wednesday | 141 | 6,717 lbs |
| Saturday | 1 | 3,300 lbs |
| Sunday | 0 | - |

**Insight Text**: "You're a Monday/Friday lifter! You've trained on Saturday exactly once and never on Sunday."

---

### 6. PERSONAL RECORDS TABLE (Phase 2)

**Purpose**: Show all-time PRs across rep ranges (critical for lifters)

**Data Source**: `allTimePRs`

**Layout**: Styled table with color coding

| Lift | 1RM | 3RM | 5RM | 8RM | 10RM | Best E1RM |
|------|-----|-----|-----|-----|------|-----------|
| **Squat** | 380 | 400 ⭐ | 360 | 310 | 255 | 442 |
| **Bench** | 250 | 240 | 220 | 200 | 185 | 321 |
| **Deadlift** | 440 | 405 | 385 | 340 | 315 | 513 ⭐ |
| **OHP** | 155 | 145 | 140 | 120 | 105 | 165 |

**Features**:
- Color code each row by lift (match line chart colors)
- E1RM formula shown on hover
- Days since PR badge (color: green < 90, yellow < 180, red > 180)
- Click cell to see date PR was set

---

### 7. PLATE MILESTONES TIMELINE (Phase 2)

**Purpose**: Visual journey of plate achievements (very satisfying)

**Data Source**: `plateMilestones`

**Visual Type**: Horizontal progress bars or timeline

**Milestones**:
- **1 Plate (135 lbs)**: Squat (Jan 2019), Bench (Feb 2019)
- **2 Plates (225 lbs)**: Squat (Mar 2019), Bench (Sep 2019), Deadlift (Mar 2019)
- **3 Plates (315 lbs)**: Squat (Jul 2019), Deadlift (Mar 2019)
- **4 Plates (405 lbs)**: Deadlift (Sep 2019)

**ASCII Visual**:
```
SQUAT    ●─────●─────●───────────────────
         135   225   315

BENCH    ──●─────────●─────●─────────────
           135       225   275(current)

DEADLIFT ────●─────●─────●─────────────●
             225   315   405           440

OHP      ───●───────────────────────────
            135                     165
```

---

### 8. POWERLIFTING TOTAL PROGRESS (Phase 2)

**Purpose**: Combined S+B+D total over time (competition standard)

**Data Source**: `powerliftingTotals`

**Chart Type**: Line chart with milestone badges

**Key Points**:
- Current total: **1,276 lbs**
- Peak total: **1,276 lbs** (Dec 9, 2022)
- Club milestones achieved:
  - 500 lb club: Feb 11, 2019
  - 750 lb club: Mar 15, 2019
  - 1000 lb club: May 17, 2019
  - 1100 lb club: Oct 4, 2019
  - 1200 lb club: Apr 30, 2021

**Visual**: Line chart with badge markers at each club milestone

---

### 9. BAR TRAVEL INFOGRAPHIC (Phase 3)

**Purpose**: Fun/impressive stat for non-lifters

**Data Source**: `barTravel`

**Stats**:
- **Total**: 29.35 miles / 47.23 km
- **By Lift**: Bench (9.4 mi), Squat (7.6 mi), OHP (6.9 mi), Deadlift (5.5 mi)

**Landmark Comparisons**:
- 🏔️ Mt. Everest: **5.34 climbs**
- 🏢 Empire State: **106.6 climbs**
- 🗼 Eiffel Tower: **143.1 climbs**
- 🗽 Statue of Liberty: **508 climbs**

**Visual**: Stacked bar or pictogram with landmark icons

---

### 10. BODY WEIGHT vs RELATIVE STRENGTH (Phase 3)

**Purpose**: Show strength-to-bodyweight ratio over time

**Data Source**: `relativeStrength`, `bodyWeight`

**Chart Type**: Dual-axis line chart

**Key Points**:
- **Best relative strength**: 2.22x BW squat @ 180 lbs (Nov 2022)
- **Current**: 1.37x BW squat @ 205 lbs
- Show monthly progression of BW multiple for squat

**Insight**: "You squatted 2.22x your body weight at your lightest!"

---

### 11. PROGRAM COMPARISON (Phase 3)

**Purpose**: Compare effectiveness of 17 training programs

**Data Source**: `programs`

**Chart Type**: Table or horizontal bar chart

**Metrics**:
- Program name
- Duration (start → end date)
- Total workouts
- Total volume
- PRs set

**Top 3 Programs**:
| Program | Workouts | Volume | PRs |
|---------|----------|--------|-----|
| nSuns LP | 92 | 1.1M lbs | 15 |
| GZCLP | 156 | 800K lbs | 8 |
| StrongLifts 5x5 | 36 | 352K lbs | 9 |

---

### 12. EXERCISE DISTRIBUTION (Phase 3)

**Purpose**: Show which exercises dominate training volume

**Data Source**: `exerciseProgress` (43 exercises)

**Chart Type**: Treemap or donut chart

**Top Exercises**:
1. Bench Press: 2.18M lbs (32%)
2. Squat: ~1.8M lbs (26%)
3. Deadlift: ~800K lbs (12%)
4. OHP: ~600K lbs (9%)
5. Others: ~1.4M lbs (21%)

**Grouping Option**: Toggle between exercise list vs muscle group aggregation

---

### 13. MILESTONES & NOTABLE WORKOUTS TIMELINE (Phase 3)

**Purpose**: Tell the story of the lifting journey

**Data Source**: `milestones` (16), `notableWorkouts` (15)

**Visual**: Vertical timeline with icons

**Event Types**:
- 📊 Volume milestones (100K, 250K, 500K, 1M, 2M, 3M, 4M, 5M, 6M lbs)
- 🏋️ Notable workouts (comebacks, high-volume days)
- 🏆 Major PRs
- 📝 Program changes

---

### 14. DAYS SINCE LAST PR CARDS (Phase 2)

**Purpose**: Motivation/awareness for current training

**Data Source**: `daysSinceLastPR`

**Visual**: Warning-style cards with color coding

| Lift | Days | Status |
|------|------|--------|
| Squat | 243 | 🔴 Overdue |
| OHP | 241 | 🔴 Overdue |
| Bench | 190 | 🟡 Aging |
| Deadlift | 130 | 🟢 Recent |

**Color Logic**:
- Green (< 90 days): Recent, on track
- Yellow (90-180 days): Aging, attention needed
- Red (> 180 days): Overdue, requires focus

---

### Dashboard Layout Structure

```
┌──────────────────────────────────────────────┐
│         HERO STATS (6 cards)                 │
│  [Workouts][Volume][Hours][Miles][Reps][Total]│
├──────────────────────────────────────────────┤
│                                              │
│        VOLUME OVER TIME (full width)         │
│                                              │
├────────────────────┬─────────────────────────┤
│                    │                         │
│  BIG THREE PROG.   │   CALENDAR HEATMAP      │
│   (multi-line)     │    (yearly grid)        │
│                    │                         │
├────────────────────┴─────────────────────────┤
│                                              │
│  [PR Table]  [Plate Milestones]  [Days PR]   │
│                                              │
├────────────────────┬─────────────────────────┤
│                    │                         │
│  DAY OF WEEK       │  POWERLIFTING TOTAL     │
│                    │                         │
├────────────────────┼─────────────────────────┤
│                    │                         │
│  BAR TRAVEL        │  RELATIVE STRENGTH      │
│                    │                         │
├────────────────────┴─────────────────────────┤
│                                              │
│          PROGRAMS COMPARISON                 │
│                                              │
├───────────────────┬──────────────────────────┤
│                   │                          │
│  EXERCISE DISTRIB │   MILESTONES TIMELINE    │
│                   │                          │
└───────────────────┴──────────────────────────┘
```

---

## Phase 1: Project Initialization
**Goal**: Set up SvelteKit project with proper tooling and structure

### 1.1 Initialize SvelteKit Project
- [ ] Run `pnpm create svelte@latest .` (choose TypeScript, ESLint, Prettier)
- [ ] Verify project structure created
- [ ] Test dev server starts successfully

### 1.2 Install Dependencies
**Charting Library Decision**: Use **ECharts** over D3.js
- Rationale: ECharts provides high-level chart components out of the box, reducing implementation complexity while still offering impressive visuals. D3.js requires more low-level implementation which increases development time.
- Installation: `pnpm add echarts echarts-for-svelte`

**Icon Library Decision**: Use **lucide-svelte**
- Rationale: Modern, clean icons with good tree-shaking support. Consistent stroke-based design.
- Installation: `pnpm add lucide-svelte`

**Date Library Decision**: Use **date-fns**
- Rationale: Modular, tree-shakeable, excellent TypeScript support, simple API
- Installation: `pnpm add date-fns`

**Additional Utilities**:
- `clsx` for conditional class names
- Installation: `pnpm add clsx`

### 1.3 Project Structure Setup
```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── charts/         # Chart components
│   │   ├── cards/          # Stat cards and containers
│   │   └── ui/             # Base UI components
│   ├── stores/             # Svelte stores for state
│   ├── utils/              # Utility functions
│   │   ├── units.ts        # Unit conversion (lbs/kg, mi/km)
│   │   ├── formatting.ts   # Date and number formatting
│   │   └── data.ts         # Data processing utilities
│   └── types/              # TypeScript type definitions
├── routes/                  # SvelteKit routes
│   └── +page.svelte        # Main dashboard page
└── app.css                 # Global styles
```

### 1.4 Data Strategy
**Decision**: Place training_data.json in `static/` directory
- Rationale: Large JSON file (800KB+) should be fetched async rather than bundled, keeping initial bundle size small
- Location: `static/data/training_data.json`
- Loading: Use fetch() in +page.ts load function
- Benefits: Smaller bundle, better caching control, easier to update data without rebuilding

**Implementation**:
- [ ] Create `static/data/` directory
- [ ] Copy training_data.json to `static/data/`
- [ ] Create TypeScript interfaces in `src/lib/types/training.ts`
- [ ] Create data loading function in `src/routes/+page.ts`

## Phase 2: Core Infrastructure
**Goal**: Build foundational components and utilities

### 2.1 Type Definitions
- [ ] Create interfaces for training_data.json structure
- [ ] Define component prop types
- [ ] Create unit system types (imperial/metric)

### 2.2 Unit System & Formatting
- [ ] Build unit conversion utilities (lbs↔kg, mi↔km)
- [ ] Create consistent date formatting functions
- [ ] Build number formatting (thousands separators, decimals)
- [ ] Create unit system store (allow user to toggle imperial/metric)

### 2.3 CSS Architecture
**Modern CSS Strategy**: Use CSS custom properties, modern layout (grid/flexbox), no preprocessor needed

**Theme Variables** (in app.css or theme.css):
- [ ] Color palette: primary, secondary, accent, neutral scales
- [ ] Surface colors: background, card, elevated
- [ ] Text colors: primary, secondary, muted
- [ ] State colors: success, warning, error, info
- [ ] Spacing scale: 4px base (0.25rem, 0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem)
- [ ] Border radius: sm, md, lg, xl
- [ ] Shadows: sm, md, lg for depth
- [ ] Typography: font families, size scale, weights, line heights
- [ ] Transitions: standard durations and easings

**Responsive Breakpoints**:
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

**Layout Utilities**:
- [ ] Container with max-width and padding
- [ ] Grid system for dashboard layout
- [ ] Flexbox utilities for component alignment
- [ ] Responsive utilities (hide/show at breakpoints)

### 2.4 Base UI Components
- [ ] Loading spinner/skeleton components
- [ ] Empty state component
- [ ] Error boundary component
- [ ] Card/container component
- [ ] Button component (if needed for unit toggle)

## Phase 3: Data Visualization Components
**Goal**: Build chart components for key metrics

**Implementation Priority**: Build most impactful visualizations first
1. Volume Over Time (shows overall progress) - HIGHEST PRIORITY
2. Exercise Progress (specific lift progression) - HIGH PRIORITY
3. Calendar Heatmap (consistency visualization) - MEDIUM PRIORITY
4. Body Part Distribution - MEDIUM PRIORITY

**Chart Component Pattern**: Each chart should follow consistent structure
```typescript
// Example: VolumeChart.svelte
<script lang="ts">
  export let data: VolumeTimeSeriesData;
  export let loading: boolean = false;
  export let error: string | null = null;
  // Chart implementation with ECharts
</script>
```

### 3.1 Volume Over Time Chart
- [ ] Line chart showing workout volume progression
- [ ] Support daily/weekly/monthly granularity
- [ ] Interactive tooltips with workout details
- [ ] Responsive design (mobile-friendly)
- [ ] Loading and empty states

### 3.2 Exercise Progress Charts
- [ ] Per-exercise progression line charts
- [ ] Show weight × reps progression over time
- [ ] Highlight personal records
- [ ] Filter by exercise type

### 3.3 Body Part Distribution
- [ ] Pie or bar chart showing muscle group training distribution
- [ ] Interactive labels/tooltips
- [ ] Visual hierarchy for primary vs accessory muscles

### 3.4 Calendar Heatmap
- [ ] GitHub-style contribution heatmap for workout consistency
- [ ] Color intensity based on volume or workout count
- [ ] Hover states showing date and stats

## Phase 4: Dashboard Layout & Stat Cards
**Goal**: Create engaging dashboard with key metrics

### 4.1 Summary Statistics Cards

**Component Structure**: Create reusable `StatCard.svelte` component
```typescript
<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let unit: string = '';
  export let subtitle: string = '';
  export let icon: typeof LucideIcon;
  export let trend: 'up' | 'down' | 'neutral' = 'neutral';
</script>
```

**Cards to Implement** (priority order):
1. [ ] **Total Workouts** - `summary.totalWorkouts` (e.g., "969 workouts")
2. [ ] **Total Volume** - `summary.totalVolumeLbs/Kg` with unit toggle (e.g., "6.8M lbs")
3. [ ] **Total Time** - `summary.totalHours` (e.g., "734 hours")
4. [ ] **Workout Frequency** - `summary.workoutsPerWeekAvg` (e.g., "2.7/week")
5. [ ] **Best Month Ever** - `summary.bestMonthEver` (e.g., "Apr 2021: 214K lbs")
6. [ ] **Best Year Ever** - `summary.bestYearEver` (e.g., "2021: 220 workouts")
7. [ ] **Average Duration** - `summary.avgWorkoutDuration` (e.g., "45.5 minutes")
8. [ ] **Training Span** - Calculate from `firstWorkout` to `lastWorkout` (e.g., "6.8 years")

**Visual Design Elements**:
- Large prominent number
- Icon representing the metric (from lucide-svelte)
- Subtle background gradient or color accent
- Optional trend indicator (up arrow for improvements)
- Card hover effect for interactivity

### 4.2 Personal Records Section
- [ ] PR cards for major lifts (squat, bench, deadlift, etc.)
- [ ] One-rep max calculations or actual PRs
- [ ] Date achieved
- [ ] Visual comparison to previous PRs

### 4.3 Recent Activity Section
- [ ] Last 5-10 workouts list
- [ ] Quick stats per workout
- [ ] Link to detailed workout view (if implemented)

### 4.4 Dashboard Layout
- [ ] Responsive grid layout
- [ ] Logical grouping of related metrics
- [ ] Visual hierarchy (important metrics prominent)
- [ ] Smooth scrolling experience
- [ ] Appropriate whitespace

## Phase 5: Advanced Features
**Goal**: Enhance dashboard with impressive visualizations

### 5.1 Workout Frequency Analysis
- [ ] Chart showing workouts per week over time
- [ ] Identify consistency patterns
- [ ] Highlight gaps/breaks

### 5.2 Exercise Correlations (Optional but Impressive)
- [ ] Show which exercises are typically done together
- [ ] Workout split visualization

### 5.3 Volume Distribution
- [ ] Breakdown by exercise type (compound vs isolation)
- [ ] Breakdown by muscle group
- [ ] Animated transitions

### 5.4 Milestone Achievements
- [ ] Timeline of major achievements
- [ ] 100k lbs total volume, 500 workouts, etc.
- [ ] Visual milestone markers

## Phase 6: Polish & Refinement
**Goal**: Ensure production-ready quality

### 6.1 Performance Optimization
- [ ] Lazy load charts as they enter viewport
- [ ] Optimize data processing (memoization)
- [ ] Code splitting for large dependencies
- [ ] Minimize bundle size

### 6.2 Responsive Design
- [ ] Test on mobile (320px+)
- [ ] Test on tablet (768px+)
- [ ] Test on desktop (1024px+)
- [ ] Test on large screens (1440px+)

### 6.3 Accessibility
- [ ] Semantic HTML structure
- [ ] Proper ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast ratios (WCAG AA)

### 6.4 Browser Testing
- [ ] Test on Chrome/Edge
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Fix any browser-specific issues

### 6.5 Final Polish
- [ ] Add smooth animations/transitions
- [ ] Ensure consistent spacing
- [ ] Review and refine color choices
- [ ] Add loading states where appropriate
- [ ] Handle edge cases (no data, missing fields)

## Phase 7: Deployment
**Goal**: Deploy dashboard to production

### 7.1 Build Configuration
- [ ] Configure SvelteKit adapter for static site generation
- [ ] Optimize build output
- [ ] Test production build locally

### 7.2 Deployment Options Analysis

**Option A: Subdirectory of Hugo site** (e.g., bradleycarey.com/dashboard)
- ✅ Pros: Single domain, easier setup, shared hosting
- ❌ Cons: Mixing Hugo and SvelteKit outputs, potential routing conflicts, harder to update dashboard independently
- **Configuration**: Build SvelteKit with `base: '/dashboard'` in config, copy build output to Hugo's static/dashboard

**Option B: Separate subdomain** (e.g., dashboard.bradleycarey.com) **← RECOMMENDED**
- ✅ Pros: Clean separation, independent deployments, easier routing, no path prefix needed
- ✅ Pros: Can use Netlify's continuous deployment independently
- ❌ Cons: Requires DNS configuration, separate Netlify site
- **Configuration**: Standard SvelteKit build, deploy to separate Netlify site, configure DNS CNAME

**Recommendation**: Use **Option B (subdomain)** for cleaner architecture and simpler maintenance.

**Implementation Steps for Option B**:
- [ ] Create new Netlify site for dashboard
- [ ] Configure build command: `pnpm build`
- [ ] Configure publish directory: `build`
- [ ] Add subdomain DNS record (CNAME: dashboard → [netlify-site].netlify.app)
- [ ] Test deployment
- [ ] Add link from main portfolio to dashboard subdomain

### 7.3 CI/CD Pipeline
- [ ] Set up automated builds on push
- [ ] Configure deployment automation
- [ ] Add build status badge (optional)

### 7.4 Post-Deployment
- [ ] Verify all functionality works in production
- [ ] Test on real devices
- [ ] Share with friends/community for feedback
- [ ] Monitor for any errors

## Nice-to-Have Features (Future Iterations)
- [ ] Dark/light theme toggle
- [ ] Locale-aware formatting
- [ ] Export functionality (PNG, PDF)
- [ ] Comparison between time periods
- [ ] Goal setting and tracking
- [ ] Exercise database with instructions
- [ ] Social sharing of achievements

## Testing & Validation Checkpoints

After each major phase, validate these criteria:

### After Phase 1 (Setup)
- [ ] Dev server runs without errors
- [ ] TypeScript compiles without errors
- [ ] Hot module reload works
- [ ] Data loads from static/data/training_data.json

### After Phase 2 (Infrastructure)
- [ ] Unit conversions work correctly (test lbs↔kg calculations)
- [ ] Date formatting displays consistently
- [ ] CSS variables apply correctly
- [ ] Base components render in isolation

### After Phase 3-4 (MVP)
- [ ] At least 3 stat cards display correct data
- [ ] Volume chart renders and shows progression
- [ ] Dashboard layout looks good on desktop (1440px+)
- [ ] No console errors
- [ ] Unit toggle switches data correctly

### After Phase 5 (Enhancement)
- [ ] All visualizations render correctly
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] Charts are interactive (hover states, tooltips)
- [ ] Loading states work during data fetch

### Pre-Deployment (Phase 6-7)
- [ ] Production build completes successfully
- [ ] Build output size is reasonable (<2MB total)
- [ ] Lighthouse score: Performance >90, Accessibility >90
- [ ] Test on Chrome, Firefox, Safari
- [ ] No console warnings in production
- [ ] All links work correctly

## Success Criteria (Final Validation)
- ✅ Dashboard loads quickly (<3s on 3G)
- ✅ Impresses non-lifters with visual appeal
- ✅ Provides actionable insights for experienced lifters
- ✅ Fully responsive on all screen sizes (320px - 2560px)
- ✅ No console errors or warnings
- ✅ Accessible (WCAG AA standard minimum)
- ✅ Clean, maintainable code with TypeScript types
- ✅ Successfully deployed and publicly accessible

## Next Steps to Begin Implementation

1. **Review this plan thoroughly** - Understand the architecture and decisions
2. **Run Quick Start commands** - Initialize SvelteKit project
3. **Follow Phase 1 sequentially** - Complete setup and configuration
4. **Build MVP first** (Phases 1-2-3 core features) - Get something working quickly
5. **Iterate and enhance** - Add remaining features progressively
6. **Test continuously** - Validate at each checkpoint
7. **Deploy** - Make it live and gather feedback

**Remember**: Build vertically (complete features end-to-end) rather than horizontally (partial implementations). Ship early, iterate often.

---

## 🔧 Potential Issues & Solutions

### Issue: ECharts not rendering in Svelte
**Solution**: Ensure ECharts is initialized in `onMount()` lifecycle, use `bind:this` for chart container reference

### Issue: Large JSON file causes slow page load
**Solution**: Already addressed - JSON is in static/ folder, loaded async, consider compression or pagination if needed

### Issue: Date formatting inconsistencies
**Solution**: Use date-fns consistently everywhere, create utility wrapper functions for common formats

### Issue: Unit conversion rounding errors
**Solution**: Use consistent rounding function (e.g., round to 1 decimal for display), store precision in utilities

### Issue: Charts not responsive on mobile
**Solution**: ECharts supports responsive sizing - use `window.addEventListener('resize')` to trigger chart.resize()

### Issue: TypeScript errors with ECharts types
**Solution**: Install `@types/echarts` if needed, or use `any` type temporarily and refine later

### Issue: Build fails with adapter-static
**Solution**: Ensure `prerender = true` is set in `+page.ts`, check that all routes are prerenderable

### Issue: CSS custom properties not working in some browsers
**Solution**: They work in all modern browsers (2020+), add fallback values if IE11 support needed (not recommended)

---

## 📝 Development Best Practices

1. **Commit frequently** - After each working feature or phase
2. **Test in browser** - Don't assume code works, verify visually
3. **Use TypeScript** - But don't over-type, use `any` when appropriate to move fast
4. **Mobile-first** - Design for mobile, enhance for desktop
5. **Performance conscious** - Use Chrome DevTools to check bundle size and render performance
6. **Semantic HTML** - Use proper elements (section, article, aside, etc.)
7. **Document decisions** - Comment "why" not "what" in code

---

**Plan Status**: ✅ COMPREHENSIVE - Ready for implementation

This plan is detailed, actionable, and includes:
- ✅ Clear technical decisions with rationale
- ✅ Phased implementation approach
- ✅ Specific component examples and structure
- ✅ Testing checkpoints at each phase
- ✅ Deployment strategy and recommendation
- ✅ Troubleshooting guidance
- ✅ Success criteria definition
- ✅ MVP prioritization for quick wins

**Next action**: Begin Phase 1.1 - Initialize SvelteKit project
