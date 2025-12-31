# Fitness Data Visualization Dashboard - Implementation Plan

## Overview
Create an interactive web-based dashboard to visualize workout data from MyApp.db SQLite database. The solution will be designed for easy regeneration when the database is updated.

## Database Summary
- **Type:** Fitness/Workout tracking app (Android)
- **Date Range:** January 2019 - October 2025 (~6.8 years)
- **Data Volume:** 969 workouts, 21,246 sets, 979 body weight measurements
- **Top Exercises:** Bench Press (4,376 sets), Squat (3,264), Overhead Press (2,870)
- **Most Used Program:** nSuns 531 LP 5-day (275 workouts, 844,325 kg volume)

## Architecture: Automated Regeneration System

### Design Philosophy
The system will separate data extraction from visualization, allowing easy updates:
1. **Python script** extracts data from SQLite → generates JSON
2. **Static HTML dashboard** reads JSON and renders charts
3. **Update process:** Simply rerun Python script with updated database

### File Structure
```
c:\source\sqlite\
├── MyApp.db                    (your database - can be updated)
├── generate_dashboard.py       (data extraction script)
├── dashboard.html              (visualization dashboard)
├── workout_data.json           (generated data file)
├── README.md                   (usage instructions)
└── PLAN.md                     (this file)
```

## Implementation Details

### 1. Data Extraction Script (generate_dashboard.py)

**Purpose:** Extract all necessary data from SQLite and export to JSON

**Key Features:**
- Takes database path as parameter (default: MyApp.db)
- Connects to SQLite database
- Executes ~15 SQL queries to extract:
  - Exercise progression data (weight over time per exercise)
  - Workout history with dates
  - Program usage timeline
  - Volume statistics
  - Body weight trends
  - Training frequency patterns
- Calculates derived metrics:
  - Estimated 1RM (Epley formula)
  - Personal records
  - Training streaks
  - Volume per exercise/program
- Outputs single JSON file: `workout_data.json`

**Data Structure:**
```json
{
  "metadata": {
    "generated": "2025-10-XX",
    "dateRange": ["2019-01-24", "2025-10-25"],
    "totalWorkouts": 969,
    "totalSets": 21246
  },
  "progressionData": {
    "Squat": [{"date": "2019-01-24", "weight": 60, "reps": 5, "estimated1RM": 69.6}, ...],
    "Bench Press": [...],
    "Deadlift": [...],
    "Overhead Press": [...]
  },
  "workoutCalendar": [
    {"date": "2019-01-24", "workoutCount": 1, "duration": 60},
    ...
  ],
  "programTimeline": [
    {
      "name": "StrongLifts 5x5",
      "start": "2019-01-24",
      "end": "2019-04-17",
      "workouts": 36,
      "avgDuration": 60,
      "volume": 159212
    },
    ...
  ],
  "exerciseStats": [
    {"exercise": "Bench Press", "totalSets": 4376, "totalVolume": 988680, "maxWeight": 125},
    ...
  ],
  "bodyWeight": [
    {"date": "2019-01-24", "weightKg": 82.5},
    ...
  ],
  "programComparison": [...],
  "dailyFrequency": {
    "Monday": 233,
    "Tuesday": 189,
    ...
  }
}
```

**Dependencies:**
- Python 3.x (built-in sqlite3 module)
- No external packages required

**Usage:**
```bash
python generate_dashboard.py
# or with custom database:
python generate_dashboard.py --db path/to/database.db
```

### 2. Interactive Dashboard (dashboard.html)

**Purpose:** Self-contained HTML file that visualizes the workout data

**Technology Stack:**
- **HTML5** - Structure
- **CSS3** - Modern styling, responsive design
- **Vanilla JavaScript** - Interactivity and data processing
- **Chart.js** (v4.x from CDN) - Chart rendering

**Dashboard Sections:**

#### Header: Overview Stats
- Total workouts, hours trained, total volume
- Date range, current streak
- Last updated timestamp

#### Section 1: Strength Progression (PRIMARY FOCUS)
- **4 Line Charts** for main lifts (Squat, Bench, Deadlift, OHP)
- Each chart shows:
  - Weight over time
  - Estimated 1RM trend line
  - Personal records marked with stars
  - Smooth moving average overlay
- **Interactive Controls:**
  - Exercise selector dropdown
  - Date range slider
  - Toggle between max/average/volume view
  - Toggle kg/lb units

#### Section 2: Training Consistency
- **Calendar Heatmap** (GitHub-style)
  - Each day colored by training intensity
  - 6+ years visible
  - Hover shows workout details
- **Monthly Workout Count** (Bar chart)
  - Shows training frequency over time
  - Identify gaps and active periods
- **Day of Week Distribution** (Horizontal bar)
  - Identify preferred training days

#### Section 3: Program Analysis
- **Program Timeline** (Gantt chart)
  - Horizontal bars showing when each program was used
  - Color-coded by program type
  - Shows overlapping programs
- **Program Comparison Table**
  - Sortable columns: workouts, volume, duration, efficiency
  - Click row to filter other charts
- **Per-Program Volume Breakdown** (Stacked bar)
  - Exercise distribution within each program

#### Section 4: Exercise Insights
- **Top 15 Exercises** (Horizontal bar)
  - Total volume per exercise
  - Color-coded by muscle group
- **Exercise Frequency** (Pie chart)
  - Set count distribution

#### Section 5: Body Weight Correlation (if data available)
- **Body Weight Trend** (Line chart)
  - Weight over time with smoothing
  - Overlay with training volume

**Interactive Features:**
- **Global Date Filter:** Affects all charts
- **Program Filter:** Show only selected programs
- **Exercise Filter:** Focus on specific exercises
- **Unit Toggle:** Switch between kg/lb globally
- **Responsive:** Works on desktop, tablet, mobile
- **Tooltips:** Detailed info on hover
- **Collapsible Sections:** Hide/show sections

**Technical Implementation:**
- Loads `workout_data.json` via fetch API
- Processes data in JavaScript
- Renders charts using Chart.js
- No server required - works offline

### 3. README.md

**Contents:**
- Quick start guide
- How to update with new data
- System requirements
- File descriptions
- Customization options
- Troubleshooting

## Update Workflow

When you have an updated database:

1. **Replace database file**
   ```bash
   cp /path/to/new/MyApp.db c:\source\sqlite\MyApp.db
   ```

2. **Regenerate data**
   ```bash
   python generate_dashboard.py
   ```
   Output: `workout_data.json` updated

3. **View dashboard**
   - Open `dashboard.html` in browser
   - Dashboard automatically loads new data
   - No rebuild/recompile needed

## Implementation Steps

### Phase 1: Data Extraction (Python Script)
1. Set up SQLite connection with parameterized db path
2. Write SQL queries for each data category:
   - Progression queries (per exercise, with dates)
   - Workout calendar (all workout dates)
   - Program timeline (start/end dates, stats)
   - Exercise statistics (volume, sets, max weights)
   - Body weight history
   - Frequency aggregations
3. Calculate derived metrics (1RM, streaks, PRs)
4. Structure data into JSON
5. Write JSON file with proper formatting

### Phase 2: Dashboard HTML
1. Create HTML structure with sections
2. Add Chart.js from CDN
3. Implement data loading (fetch JSON)
4. Create chart configurations for each visualization
5. Implement interactivity:
   - Date range filtering
   - Exercise selection
   - Program filtering
   - Unit conversion
6. Style with modern CSS
7. Make responsive

### Phase 3: Testing & Documentation
1. Test with actual database
2. Verify all charts render correctly
3. Test interactivity
4. Write README with clear instructions
5. Test regeneration workflow

## Key SQL Queries (Examples)

### Progression Data
```sql
SELECT
  h.date,
  e.exercise_name,
  he.weightkg,
  he.reps,
  he.set_number,
  he.weightkg * (1 + he.reps/30.0) as estimated_1rm
FROM history_exercises he
JOIN exercises e ON he.exercise_id = e.id
JOIN history h ON he.history_id = h.id
WHERE e.exercise_name IN ('Squat', 'Bench Press', 'Deadlift', 'Overhead Press')
  AND he.weightkg > 0
ORDER BY h.date, e.exercise_name, he.set_number;
```

### Program Timeline
```sql
SELECT
  p.routine,
  MIN(h.date) as first_workout,
  MAX(h.date) as last_workout,
  COUNT(h.id) as total_workouts,
  ROUND(AVG(h.duration)) as avg_duration,
  SUM(he_agg.volume) as total_volume
FROM history h
JOIN programs p ON h.program_id = p.id
LEFT JOIN (
  SELECT history_id, SUM(weightkg * reps) as volume
  FROM history_exercises
  WHERE weightkg > 0 AND reps > 0
  GROUP BY history_id
) he_agg ON h.id = he_agg.history_id
GROUP BY h.program_id
ORDER BY MIN(h.date);
```

### Workout Calendar
```sql
SELECT
  date,
  COUNT(*) as workout_count,
  SUM(duration) as total_duration
FROM history
GROUP BY date
ORDER BY date;
```

## Visualization Details

### Strength Progression Charts
- **Chart Type:** Line chart with multiple datasets
- **X-Axis:** Date (time scale)
- **Y-Axis:** Weight (kg or lb)
- **Datasets:**
  - Max weight per workout (line + points)
  - 4-week moving average (smooth line)
  - Personal records (star markers)
  - Estimated 1RM (dashed line)
- **Colors:** Squat (blue), Bench (red), Deadlift (green), OHP (orange)

### Calendar Heatmap
- **Implementation:** Custom HTML grid or cal-heatmap.js
- **Color Scale:** White (0 workouts) → Dark green (2+ workouts)
- **Granularity:** Daily for 6+ years
- **Interaction:** Hover shows date, workout count, duration

### Program Timeline (Gantt)
- **Chart Type:** Horizontal stacked bar or custom SVG
- **X-Axis:** Date range
- **Y-Axis:** Program names
- **Features:**
  - Bars span program duration
  - Color-coded by program category
  - Show gaps between programs

## Benefits of This Approach

✅ **Easy Updates:** Just rerun Python script with new database
✅ **No Installation:** Dashboard runs in any browser, no server needed
✅ **Portable:** Copy files anywhere, works offline
✅ **Fast:** JSON loads instantly, charts render in milliseconds
✅ **Maintainable:** Clear separation between data and visualization
✅ **Flexible:** Easy to add new visualizations to dashboard
✅ **Self-Documenting:** README provides clear update instructions

## Future Enhancements (Optional)

- Add batch script (Windows .bat) or shell script (Linux/Mac) to automate update
- Add error handling in Python script for missing tables
- Add data validation checks
- Export individual charts as images
- Add more advanced analytics (velocity, fatigue indices)
- Add workout predictions based on historical trends

## Files Locations

All files will be created in:
```
c:\source\sqlite\
```

This keeps everything together and makes updates simple.
