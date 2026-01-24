# Dashboard Visual Analysis

> Analysis completed via Chrome DevTools MCP on http://localhost:5174/dashboard/

---

## 1. HeroSection
**File:** `src/components/HeroSection.jsx`

**Visual Layout:** 5 stat cards in a responsive grid (3 top, 2 bottom)

**Stats Cards:**
| # | Value | Label | Context |
|---|-------|-------|---------|
| 1 | **3,417 tons** | TOTAL VOLUME LIFTED | "2,000+ Honda Civics" |
| 2 | **969** | WORKOUTS COMPLETED | "6 years of consistency" |
| 3 | **734 hours** | TIME IN THE GYM | "30+ days straight" |
| 4 | **29.4 mi** | BAR TRAVEL DISTANCE | "Climbed Everest 5.3x" |
| 5 | **7 years** | TRAINING SINCE | "Jan 2019" |

**Visual Style:** White card backgrounds with subtle shadows, large bold numbers, uppercase labels in muted color, italic context text

**Interactivity:** None (display only with scroll-triggered count-up animation)

---

## 2. WorkoutCalendar
**File:** `src/components/WorkoutCalendar.jsx`

**Visual Layout:**
- Title: "Workout Consistency" (h2)
- Subtitle: "Daily training volume heatmap"
- Stacked year cards (2025 -> 2019), each in white rounded container
- GitHub-style heatmap: Days as cells, Mon-Sat rows, Jan-Dec columns
- Color scale: Light gray (rest) -> Light green -> Medium green -> Dark green (high volume)

**Years Visible:** 2025, 2024, 2023, 2022, 2021, 2020, 2019

**Visual Observations:**
- Gap visible in 2024 (Jan-Jul empty), training resumed Jul-Dec
- 2020 shows COVID gap (Jul-Sep empty)
- Most consistent years: 2021, 2023 (dense green coverage)

**Interactivity:**
- **Year Selector Dropdown** (mobile only) - select which year to display
- **Tooltip on hover** - shows date, volume in lbs, workout count

---

## 3. StrengthProgressionCharts
**File:** `src/components/StrengthProgressionCharts.jsx`

**Visual Layout:**
- Title: "Strength Progression" (h2) with toggle buttons in header row
- 2x2 grid of lift charts + full-width total chart below

**4 Individual Lift Charts:**
| Lift | Color | Peak E1RM | Current |
|------|-------|-----------|---------|
| Squat | Blue (#2563eb) | ~430 lbs | ~430 lbs |
| Bench Press | Red (#dc2626) | ~310 lbs | ~310 lbs |
| Deadlift | Green (#16a34a) | ~530 lbs | ~530 lbs |
| Overhead Press | Purple (#9333ea) | ~190 lbs | ~190 lbs |

**Powerlifting Total Chart:**
- Orange/yellow area chart with gradient fill
- **Peak: 1276** marker shown
- Milestone dashed lines on right: 500 lb, 750 lb, 1000 lb, 1100 lb, 1200 lb clubs
- Timeline: 2019 -> 2025

**Interactivity:**
- **Toggle Buttons:** "Running PR" (active/selected) | "Raw E1RM"
  - Running PR mode: Step-chart showing monotonic PR progression
  - Raw E1RM mode: Scatter plot + 30-day rolling average line
- **Tooltip on hover** - shows date and E1RM values

---

## 4. PlateMilestones
**File:** `src/components/PlateMilestones.jsx`

**Visual Layout:**
- Title: "Plate Milestones" (centered h2)
- Subtitle: "Strength achievements in plates per side (45 lb / 20 kg plates)"
- 5-column grid with colored row labels on left

**Column Headers:** 1 Plate (135 lbs) | 2 Plates (225 lbs) | 3 Plates (315 lbs) | 4 Plates (405 lbs) | 5 Plates (495 lbs)

**Achievement Grid:**
| Lift | 1 Plate | 2 Plates | 3 Plates | 4 Plates | 5 Plates |
|------|---------|----------|----------|----------|----------|
| **Squat** (blue) | 135 lbs 1/29/19 | 225 lbs 3/17/19 | 320 lbs 7/7/19 | Locked | Locked |
| **Bench** (red) | 135 lbs 2/14/19 | 225 lbs 4/15/21 | Locked | Locked | Locked |
| **Deadlift** (green) | 135 lbs 1/29/19 | 225 lbs 2/21/19 | 315 lbs 4/4/19 | 405 lbs 10/28/19 | Locked |
| **OHP** (purple) | 135 lbs 11/17/19 | Locked | Locked | Locked | Locked |

**Visual Style:**
- Achieved cells: Colored gradient background (lift color), green checkmark, weight + date
- Locked cells: Gray background with lock emoji
- Legend at bottom: "Achieved" (green box) | "Locked" (gray box)

**Interactivity:** Hover shows full date tooltip

---

## 5. RelativeStrength
**File:** `src/components/RelativeStrength/RelativeStrength.jsx`

**Visual Layout:**
- Title: "Relative Strength & Benchmarks" (h2)
- Subtitle: "Strength relative to bodyweight compared to established standards"
- Two subsections: Bodyweight Multiples + Wilks Score

**Subsection A - Bodyweight Multiples:**
| Lift | Best | Level | Current | Level |
|------|------|-------|---------|-------|
| Squat | 2.22x | Advanced | 1.37x | Novice |
| Bench Press | 1.52x | Advanced | 0.98x | Novice |
| Deadlift | 2.58x | Advanced | 1.34x | Novice |
| Overhead Press | 1.00x | Advanced | 0.61x | Novice |

**Bullet Chart Visual:**
- Horizontal bar showing current value (lift-colored fill)
- Dashed vertical line for best value
- Background bands: Untrained (darkest) -> Novice -> Intermediate -> Advanced -> Elite (lightest)
- Scale labels below: UNTRAINED | NOVICE | INTERMEDIATE | ADVANCED | ELITE

**Subsection B - Wilks Score:**
- Best: **348.5** | Current: **325.1**
- Horizontal bar with labeled zones: BEGINNER | INTERMEDIATE | ADVANCED | ELITE | WORLD CLASS
- Two markers: "Best: 348.5" and "Current: 325.1" positioned on bar
- Scale: 0 -> 200 -> 300 -> 400 -> 500

**Interactivity:** None (display only)

---

## 6. VolumeAnalytics
**File:** `src/components/VolumeAnalytics.jsx`

**Visual Layout:**
- Title: "Volume Analytics" (h2)
- Two white card containers stacked vertically

**Card A - Monthly Volume Trend:**
- Header: "Monthly Volume Trend" + orange "Show All Time" button
- Subtitle: "Total volume lifted per month with 3-month rolling average"
- Area chart:
  - Blue area fill with gradient (solid -> transparent)
  - Orange dashed line for 3-month rolling average
  - Orange dot marker on peak month (~180,000 lbs)
  - X-axis: Monthly dates (currently showing last 2 years: 2023-02 -> 2025-10)
  - Y-axis: Volume in lbs (0 -> 180,000)

**Card B - Workouts by Day of Week:**
- Header: "Workouts by Day of Week"
- Subtitle: "Most active: **Monday** (245 workouts)" (Monday in orange)
- Horizontal bar chart (sorted by count, highest at bottom):
  - Saturday: 1 workouts
  - Wednesday: 141 workouts
  - Tuesday: 177 workouts
  - Thursday: 179 workouts
  - Friday: 226 workouts
  - Monday: 245 workouts (longest bar)

**Interactivity:**
- **Toggle Button:** "Show All Time" (orange pill button) - toggles between last 2 years and all time
- **Tooltip on hover** - shows month, volume, workout count, 3-mo avg

---

## 7. TrainingPrograms
**File:** `src/components/TrainingPrograms.jsx`

**Visual Layout:**
- Title: "Training Programs" (h2)
- Subtitle: "17 programs over 7 years"
- Vertical timeline with year markers and program cards

**Timeline Structure:**
- Orange year markers (2019, 2020, 2021, 2022, 2024, 2025) with horizontal line
- Timeline dots (hollow circles) connecting to cards
- Yellow/green left border on each card

**Sample Program Cards:**
| Program | Duration | Date Range | Workouts | PRs | Volume |
|---------|----------|------------|----------|-----|--------|
| StrongLifts 5x5 | 3 months | Jan-Apr 2019 | 36 | 9 | 351,659 lbs |
| nSuns 531 LP 5 day | 31 months | Apr 2021-Nov 2023 | 275 | 39 | 1,866,695 lbs |
| GreySkull LP with Arms | 12 months | Jul 2024-Jul 2025 | 81 | 5 | 627,405 lbs |
| GZCLP | 3 months | Jul-Oct 2025 | 24 | 3 | 274,285 lbs |

**Card Layout:**
- Program name (bold heading) + duration badge (orange outline pill)
- Date range (gray text)
- Stats row: WORKOUTS | PRS SET | TOTAL VOLUME (with values below)

**Interactivity:** None (display only, scrollable timeline)

---

## 8. PersonalRecords
**File:** `src/components/PersonalRecords.jsx`

**Visual Layout:**
- Title: "Personal Records" (h2)
- Subtitle: "All-time PRs by rep range"
- Two sections: PR indicators row + PR grid table

**Section A - Days Since Last PR Indicators:**
4 colored cards in a row:
| Lift | Color | Days | Message |
|------|-------|------|---------|
| Squat | Blue | 243 days since last PR | "Time to chase a new one?" |
| Bench Press | Red | 190 days since last PR | "Time to chase a new one?" |
| Deadlift | Green | 130 days since last PR | "Time to chase a new one?" |
| Overhead Press | Purple | 241 days since last PR | "Time to chase a new one?" |

Each card has: clock icon + lift name + days count + motivational text (in lift color)

**Section B - PR Grid Table:**
| LIFT | 1 REP | 2 REPS | 3 REPS | 4 REPS | 5 REPS | 6 REPS | 7 REPS | 8 REPS | 9 REPS | 10 REPS |
|------|-------|--------|--------|--------|--------|--------|--------|--------|--------|---------|
| **Squat** | 380 | 225 | 400 | 390 | 360 | 350 | 330 | 310 | 315 | 255 |
| **Bench** | 215 | 275 | 275 | 270 | 275 | 250 | 250 | 240 | 240 | 198 |
| **Deadlift** | 465 | 465 | 460 | 420 | 440 | 425 | 360 | 375 | 295 | 300 |
| **OHP** | 180 | 165 | 170 | 170 | 165 | 150 | 135 | 145 | 135 | 110 |

**Visual Style:**
- Colored left border on each row (blue/red/green/purple)
- White cells with weight values
- Horizontally scrollable on mobile
- Note at bottom: "Click on any cell to see detailed E1RM information"

**Interactivity:**
- **Clickable cells** - clicking a PR cell toggles a popup showing:
  - Weight (same as cell)
  - E1RM (estimated 1-rep max calculated from weight x reps)
- Click again or click elsewhere to close popup

---

## Summary of Interactive Elements

| Section | Interactive Element | Type |
|---------|---------------------|------|
| WorkoutCalendar | Year selector | Dropdown (mobile only) |
| StrengthProgressionCharts | Running PR / Raw E1RM | Toggle buttons |
| VolumeAnalytics | Show Last 2 Years / Show All Time | Toggle button |
| PersonalRecords | PR cell details | Click to expand popup |

## Global Settings (Header)
Located in sticky header, affects multiple sections:
- **Unit toggle** (lbs/kg button) - switches between imperial/metric throughout
- **Theme toggle** (Auto button) - light/dark/auto theme selection

---

## Critique & Observations

### Strengths

**Visual Design:**
- Clean, modern card-based layout with consistent spacing
- Excellent use of a unified color system (blue=squat, red=bench, green=deadlift, purple=OHP) across all sections
- Progressive disclosure through toggles and hover states keeps the UI uncluttered
- Hero section stats are impactful with fun contextual comparisons ("2,000+ Honda Civics")

**Data Visualization:**
- Multiple perspectives on the same data (Running PR vs Raw E1RM toggle is clever)
- GitHub-style heatmap for workout consistency is immediately familiar and readable
- Powerlifting total chart with milestone markers provides good goal visualization
- Bullet charts for relative strength effectively show current vs best vs benchmarks

**Information Architecture:**
- Logical flow from high-level summary (Hero) -> consistency (Calendar) -> progress (Charts) -> achievements (Milestones) -> benchmarks (Relative Strength) -> volume (Analytics) -> history (Programs) -> records (PRs)
- Each section tells a different part of the training story

### Potential Data Issues

1. **PersonalRecords - Squat 2-rep PR (225 lbs)**: This appears anomalously low compared to the 1-rep (380 lbs) and 3-rep (400 lbs) PRs. A 2-rep max should logically fall between 1-rep and 3-rep values. This may be a data entry error or missing data.

2. **PlateMilestones - Squat 3-plate shows 320 lbs**: The milestone definition says 3 plates = 315 lbs, but the achievement shows 320 lbs. While technically correct (320 > 315), it creates slight visual inconsistency.

3. **VolumeAnalytics - Saturday has only 1 workout**: This seems unusually low compared to other days. Worth investigating if this is accurate or a data issue.

4. **HeroSection - "7 years" training duration**: If training started Jan 2019, this would be approximately 6 years as of late 2025, not 7. May need to verify the calculation logic.

### UX Improvement Suggestions

**Navigation & Discoverability:**
- Consider adding a sticky "back to top" button - the page is quite long
- Add section anchor links or a mini table of contents for quick navigation
- The year selector in WorkoutCalendar is mobile-only; desktop users might also appreciate a condensed view option

**Context & Storytelling:**
- RelativeStrength section shows a significant gap between "Best" (Advanced) and "Current" (Novice) levels for all lifts - adding context about training breaks or injury recovery could help explain this
- Training Programs timeline shows overlapping programs (e.g., "The Triumvirate" 41 months overlaps with others) - this might be intentional but could confuse users

**Interactivity Opportunities:**
- PlateMilestones: Make locked cells interactive - show "X lbs to unlock" or projected date based on progression rate
- WorkoutCalendar: Clicking a year could expand/collapse that year's heatmap
- TrainingPrograms: Could link to more details about each program or show a comparison view
- Add filtering/search to PersonalRecords for quickly finding specific rep ranges

**Accessibility:**
- Ensure color-coded elements have sufficient contrast and don't rely solely on color
- Add ARIA labels to interactive charts
- Consider reduced motion preferences for the hero stat count-up animation

**Mobile Experience:**
- Verify horizontal scroll on PR grid table is discoverable (shadow hints or scroll indicator)
- Test touch targets on chart tooltips
- Ensure toggle buttons are sized appropriately for touch

### Minor Polish Items

1. **Consistency in chart libraries**: All charts appear to use ECharts which is good for consistency
2. **Loading states**: Would benefit from skeleton loaders while data fetches
3. **Empty states**: Consider what happens if certain data is missing (no PRs for a rep range, no workouts for a year)
4. **Error boundaries**: Chart components should gracefully handle malformed data
5. **Tooltip positioning**: Ensure tooltips don't overflow viewport on mobile
6. **Print styles**: If users want to print their stats, a print stylesheet would be valuable

### Overall Assessment

This is a well-designed, data-rich dashboard that effectively visualizes a comprehensive training history. The consistent visual language and thoughtful data presentation make it easy to understand progress at a glance. The main areas for improvement are around data validation (some PR values seem inconsistent), adding more context to help users understand their journey, and expanding interactivity to make the dashboard more engaging.
