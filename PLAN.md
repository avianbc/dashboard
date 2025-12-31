# Strength Training Dashboard Plan

## Overview
Create a static strength training dashboard inspired by nodaysoff.run, using data from MyApp.db SQLite database. The system will have a Python script to extract and compute statistics, outputting JSON, which is then consumed by a self-contained HTML/CSS/SVG dashboard.

## Database Context
- **969 workouts** from Jan 2019 to Aug 2024 (5+ years of data)
- **47 unique exercises** including Squat, Bench Press, Deadlift, Overhead Press, etc.
- Key tables: `history`, `history_exercises`, `exercises`, `programs`, `body_weight`
- Data includes: weight (kg/lb), reps, sets, RPE, duration, programs
- **Both kg and lb values stored** - dashboard will default to lbs with toggle to kg

**Key Computations**:
- **Total Statistics**:
  - Total workouts (969)
  - Total sets performed
  - Total volume in BOTH lbs and kg (sum of weight × reps for all working sets)
  - Total time spent training (sum of durations)
  - Date range (first/last workout)
  - Current streak / longest streak of consecutive workout days

- **Volume Calculations**:
  - Daily volume aggregations (lbs & kg)
  - Weekly volume aggregations (lbs & kg)
  - Monthly volume aggregations (lbs & kg)
  - Annual volume aggregations (lbs & kg)
  - Volume by exercise (lbs & kg)
  - Volume by program (lbs & kg)

- **Exercise-Specific Progress**:
  - Big 3 lifts (Squat, Bench, Deadlift): track max weight per rep range in both units (1RM, 3RM, 5RM, 10RM)
  - All exercises: first time performed, last time performed, total volume (both units)
  - PR timeline for each exercise (both units)

- **Workout Patterns**:
  - Workout frequency calendar (date → workout count/volume for heatmap)
  - Workouts by day of week (Mon-Sun averages)
  - Workouts by time of day (if duration/timestamp available)
  - Average workout duration

- **Program Analysis**:
  - List of all programs run with date ranges
  - Volume/workout count per program
  - Program comparison metrics

- **Notable Workouts**:
  - Highest volume single workouts
  - PR days (days where any PR was set)
  - Longest duration workouts
  - First/last workout on each program

- **Milestones**:
  - Volume landmarks (100K lbs, 500K lbs, 1M lbs, etc.)
  - Workout count milestones (100, 250, 500, 969)
  - Exercise-specific milestones (first time hitting 225lb bench, 315lb squat, etc.)

**Implementation Details**:
- Use `sqlite3` module (built-in Python)
- Filter out warmup sets (reps = -1 or set_number < 0 based on sample data)
- Handle NULL values gracefully
- Use timestamps (milliseconds) to convert to readable dates
- Export BOTH kg and lb values in JSON (database has both columns)
- Output to `training_data.json`

**SQL Query Strategy**:
```python
# Example queries needed:
# - Total volume: SELECT SUM(weightlb * reps) FROM history_exercises WHERE reps > 0
#   (also calculate kg version: SUM(weightkg * reps))
# - Daily aggregates: GROUP BY date(date/1000, 'unixepoch')
# - Exercise PRs: MAX(weightlb) and MAX(weightkg) GROUP BY exercise_id, reps
# - Workout frequency: COUNT(*) GROUP BY date
# Note: Filter out warmup sets where reps = -1
```

### 2. `training_data.json` - Generated Data File

**Structure**:
```json
{
  "summary": {
    "totalWorkouts": 969,
    "totalSets": 15234,
    "totalVolumeLbs": 2456789,
    "totalVolumeKg": 1114567,
    "totalHours": 312,
    "firstWorkout": "2019-01-24",
    "lastWorkout": "2024-08-23",
    "currentStreak": 0,
    "longestStreak": 45
  },
  "volumeTimeSeries": {
    "daily": [{"date": "2019-01-24", "volumeLbs": 12345, "volumeKg": 5600, "workouts": 1}, ...],
    "weekly": [{"week": "2019-W04", "volumeLbs": 45678, "volumeKg": 20718, "workouts": 3}, ...],
    "monthly": [{"month": "2019-01", "volumeLbs": 123456, "volumeKg": 55991, "workouts": 12}, ...],
    "yearly": [{"year": 2019, "volumeLbs": 456789, "volumeKg": 207181, "workouts": 156}, ...]
  },
  "workoutCalendar": {
    "2019-01-24": {"count": 1, "volumeLbs": 12345, "volumeKg": 5600},
    ...
  },
  "exerciseProgress": {
    "Squat": {
      "totalVolumeLbs": 456789,
      "totalVolumeKg": 207181,
      "firstPerformed": "2019-01-24",
      "lastPerformed": "2024-08-20",
      "prs": [
        {"date": "2019-02-15", "weightLbs": 225, "weightKg": 102, "reps": 5},
        {"date": "2019-05-10", "weightLbs": 315, "weightKg": 143, "reps": 3}
      ]
    },
    ...
  },
  "bigThree": {
    "squat": {...},
    "bench": {...},
    "deadlift": {...}
  },
  "programs": [
    {
      "name": "GreySkull LP - Phraks variant",
      "startDate": "2019-01-24",
      "endDate": "2019-06-15",
      "workouts": 72,
      "totalVolumeLbs": 234567,
      "totalVolumeKg": 106413
    },
    ...
  ],
  "workoutsByDayOfWeek": {
    "Monday": {"count": 142, "avgVolumeLbs": 15234, "avgVolumeKg": 6910},
    ...
  },
  "notableWorkouts": [
    {
      "date": "2020-03-15",
      "reason": "Highest volume",
      "volumeLbs": 32456,
      "volumeKg": 14725,
      "details": "..."
    },
    ...
  ],
  "milestones": [
    {"date": "2019-04-20", "milestone": "100K lbs total volume"},
    {"date": "2020-08-15", "milestone": "500 workouts completed"},
    ...
  ]
}
```

### 3. `dashboard.html` - Main Dashboard Page

**Layout** (inspired by nodaysoff.run screenshot):
1. **Header**: Title "NO DAYS OFF" style with tagline + **Unit Toggle (lbs/kg)** in top-right corner
2. **Foreword/Story Section**: Brief narrative about the training journey
3. **Summary Stats**: Large numbers in grid layout
   - Total Workouts | Total Volume (lbs/kg) | Total Hours | Years Training
4. **Volume Over Time**: Line chart showing annual volume trends
5. **Workout Calendar Heatmap**: GitHub-style contribution grid (5+ years)
6. **Big 3 Progress**: Dedicated section with line charts for Squat/Bench/Deadlift PRs
7. **Exercise Breakdown**: Bar charts or lists of exercises by volume
8. **Program History**: Timeline or comparison of different programs
9. **Workout Patterns**:
   - Day of week bar chart (average volume by Mon-Sun)
   - Time of day distribution
10. **Notable Workouts**: List of PRs and high-volume days
11. **Milestones**: Timeline of achievements

**Technical Implementation**:
- Load `training_data.json` via fetch API
- Use vanilla JavaScript to render all visualizations
- All SVG charts generated dynamically from data
- **Unit toggle**: Switch between lbs and kg views using JavaScript
  - Toggle button in header
  - Store preference in localStorage
  - Default to lbs
  - Re-render all numbers and charts when toggled
- Responsive layout (single column on mobile)
- Dark theme matching nodaysoff.run aesthetic

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Strength Training Dashboard</title>
    <style>
        /* Inline CSS - dark theme, minimal aesthetic */
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>NO DAYS OFF</h1>
            <button id="unitToggle">lbs / kg</button>
        </header>
        <section id="summary">...</section>
        <section id="volume-chart">...</section>
        <section id="calendar-heatmap">...</section>
        <!-- More sections -->
    </div>
    <script>
        // Global state for unit preference
        let currentUnit = localStorage.getItem('weightUnit') || 'lbs';

        // Load JSON and render visualizations
        // Re-render on unit toggle
    </script>
</body>
</html>
```

### 4. CSS Styling (inline in HTML)

**Design Principles** (from nodaysoff.run):
- Dark background (#0a0a0a or similar)
- Light gray text (#e0e0e0)
- Accent color for charts (cyan/blue or muted colors)
- Large typography for numbers (48px+ for stats)
- Generous whitespace
- Monospace font for numbers
- Sans-serif for body text

**Key Elements**:
- Container max-width (~1200px, centered)
- Section spacing (3-4rem between sections)
- Card-like sections with subtle borders
- Hover states for interactive elements
- Unit toggle button styling (pill-shaped, top-right)

### 5. SVG Visualization Components (JavaScript)

**Calendar Heatmap**:
- Grid of squares (7 rows × ~260 columns for 5 years)
- Color intensity based on volume (5-level scale: none, low, medium, high, very high)
- Tooltip on hover showing date and stats in current unit
- Similar to GitHub contributions graph

**Line Charts**:
- Volume over time (annual/monthly views) - respects current unit
- Big 3 exercise progress over time - respects current unit
- SVG path generation from data points
- Axes with labels, grid lines
- Y-axis updates with unit label (lbs/kg)

**Bar Charts**:
- Exercises by total volume (horizontal bars) - respects current unit
- Workouts by day of week
- Program comparison

**Implementation Pattern**:
```javascript
function createLineChart(data, containerId, config) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // Use currentUnit to select volumeLbs or volumeKg
    // Generate path, axes, labels
    // Return SVG element
}

function toggleUnit() {
    currentUnit = currentUnit === 'lbs' ? 'kg' : 'lbs';
    localStorage.setItem('weightUnit', currentUnit);
    // Re-render all visualizations
    renderDashboard();
}
```

## Execution Steps

1. **Create `extract_data.py`**:
   - Import sqlite3
   - Define queries for each statistic category
   - Compute volume in both lbs and kg (handle NULL, negative reps)
   - Identify warmup sets vs working sets (reps = -1)
   - Format dates consistently
   - Write JSON output with dual units

2. **Test data extraction**:
   - Run `python extract_data.py`
   - Verify `training_data.json` is created
   - Validate JSON structure and sample values
   - Check both lbs and kg values present

3. **Create `dashboard.html`**:
   - Set up HTML structure with all sections
   - Add inline CSS for dark theme
   - Add JavaScript to load JSON
   - Implement unit toggle button and localStorage

4. **Implement visualization functions**:
   - Calendar heatmap generator
   - Line chart generator (unit-aware)
   - Bar chart generator (unit-aware)
   - Stat card renderer (unit-aware)

5. **Populate all sections**:
   - Render summary stats with unit toggle
   - Generate all charts from data
   - Add notable workouts list
   - Add milestones timeline

6. **Polish and refine**:
   - Adjust colors and spacing
   - Add tooltips/interactions
   - Test unit toggle functionality
   - Ensure responsive design

## Key Decisions

- **Warmup Sets**: Set numbers < 0 or reps = -1 appear to be warmup indicators (need to verify)
- **Volume Definition**: Weight × Reps (excluding failed reps, warmups)
- **PR Definition**: Highest weight for specific rep ranges (1, 3, 5, 8, 10 reps)
- **Notable Workouts**: Top 10 by volume, all PR days
- **Calendar Color Scale**: 5 levels based on percentile distribution of daily volumes
- **Date Handling**: Timestamps are in milliseconds, convert using `date/1000` in SQLite
- **Units**: Database stores both kg and lb. Dashboard will default to lbs with toggle to switch to kg

## Files Summary
- `extract_data.py` - Python script (new)
- `training_data.json` - Generated JSON (new)
- `dashboard.html` - Single-page dashboard (new)
- `MyApp.db` - Existing database (read-only)
