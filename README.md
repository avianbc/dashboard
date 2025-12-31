# Strength Training Dashboard

A data-driven visualization of your strength training journey, inspired by [nodaysoff.run](https://nodaysoff.run/).

## Overview

This dashboard transforms your MyApp.db strength training data into a comprehensive, interactive visualization featuring:

- **Summary Statistics**: Total workouts, volume lifted, training hours, and streaks
- **Volume Trends**: Annual, monthly, and daily volume analysis
- **Workout Calendar**: GitHub-style heatmap showing workout frequency and volume
- **Big 3 Progress**: Dedicated tracking for Squat, Bench Press, and Deadlift PRs
- **Exercise Analysis**: Volume breakdown across all 43+ exercises
- **Workout Patterns**: Analysis by day of week
- **Program History**: Timeline of training programs with statistics
- **Notable Workouts**: Highest volume sessions and PR days
- **Milestones**: Volume and workout count achievements

## Features

- **Unit Toggle**: Switch between lbs and kg with one click (preference saved)
- **Dark Theme**: Minimal, clean aesthetic inspired by nodaysoff.run
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Static Files**: No backend required, works offline
- **SVG Visualizations**: Custom-built charts without heavy libraries

## Files

- `MyApp.db` - Your SQLite database (read-only)
- `extract_data.py` - Python script to extract and process data
- `serve.py` - Simple web server to view the dashboard
- `training_data.json` - Generated JSON data file
- `dashboard.html` - Interactive dashboard
- `README.md` - This file
- `PLAN.md` - Implementation plan and design decisions

## Usage

### Step 1: Extract Data

Run the Python script to generate the JSON data file:

```bash
python extract_data.py
```

This will:
- Connect to `MyApp.db`
- Calculate all statistics
- Generate `training_data.json`
- Display a summary of your data

**Output Example:**
```
Successfully generated training_data.json

Summary:
  - Total Workouts: 969
  - Total Volume: 6,833,549 lbs / 3,094,003 kg
  - Date Range: 2019-01-23 to 2025-10-24
  - Unique Exercises: 43
```

### Step 2: Start Server & View Dashboard

Start a local web server and open the dashboard:

**Option A (Windows):** Double-click `start_dashboard.bat`

**Option B (Any OS):**
```bash
python serve.py
```

This will:
- Start a web server on http://localhost:8000
- Automatically open dashboard.html in your browser
- Press Ctrl+C to stop the server when done

### Step 3: Update Data (Optional)

Whenever you add new workouts to MyApp.db:

1. Run `python extract_data.py` again
2. Refresh the dashboard in your browser

## Dashboard Sections

### Summary Stats
Large number cards showing:
- Total workouts completed
- Total volume lifted (with unit toggle)
- Hours spent training
- Years of training
- Longest workout streak

### Volume Over Time
Line chart showing annual volume trends from 2019 to present.

### Workout Calendar
GitHub-style contribution heatmap where:
- Each cell = one day
- Color intensity = volume lifted that day
- Hover for details (date, workouts, volume)

### The Big Three
Progress charts for Squat, Bench Press, and Deadlift showing PRs over time for different rep ranges.

### Exercises by Volume
Horizontal bar chart of top 15 exercises ranked by total volume.

### Workout Patterns
Bar chart showing average volume by day of week (Monday-Sunday).

### Training Programs
Timeline of all programs you've run with:
- Date ranges
- Workout count
- Total volume

### Notable Workouts
Top 10 highest volume workouts with dates and details.

### Milestones
Chronological list of achievements:
- Volume landmarks (100K, 250K, 500K, 1M+ lbs)
- Workout count milestones (100, 250, 500+ workouts)

## Technical Details

### Data Extraction Logic

**Warmup Sets**: Filtered out (identified by `reps = -1` or `set_number < 0`)

**Volume Calculation**: `weight × reps` for all working sets (reps > 0)

**PRs**: Tracked as max weight for each rep range (1, 3, 5, 8, 10, etc.)

**Streaks**: Consecutive days with at least one workout

**Date Handling**: Timestamps stored as milliseconds, converted to YYYY-MM-DD

**Units**: Both kg and lb values stored in database and JSON, user chooses display preference

### Database Schema

Key tables used:
- `history` - Workout sessions
- `history_exercises` - Individual sets
- `exercises` - Exercise catalog
- `programs` - Training programs
- `body_weight` - Body weight tracking (minimal use)

### JSON Structure

```json
{
  "summary": { ... },
  "volumeTimeSeries": {
    "daily": [...],
    "weekly": [...],
    "monthly": [...],
    "yearly": [...]
  },
  "workoutCalendar": { ... },
  "exerciseProgress": { ... },
  "bigThree": { ... },
  "programs": [...],
  "workoutsByDayOfWeek": { ... },
  "notableWorkouts": [...],
  "milestones": [...]
}
```

## Requirements

- **Python 3.6+** (for data extraction)
- **Modern web browser** (Chrome, Firefox, Edge, Safari)
- No additional dependencies (uses built-in `sqlite3` module)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any browser with ES6 and SVG support

## Performance

- Data extraction: ~2-5 seconds for 969 workouts
- Dashboard load: <1 second
- JSON file size: ~500KB-2MB depending on data
- Smooth rendering for 5+ years of data

## Customization

### Modify Color Scheme

Edit the CSS in `dashboard.html`:
- Background: `#0a0a0a`
- Text: `#e0e0e0`
- Accent: `#4a9eff`
- Heatmap colors: `colors` array in `renderWorkoutHeatmap()`

### Add New Visualizations

1. Add a new section in the HTML
2. Create a render function in the `<script>` section
3. Call it from `renderDashboard()`
4. Ensure unit toggle is respected if displaying volume/weight

### Adjust Data Extraction

Modify `extract_data.py`:
- Add new SQL queries
- Calculate additional statistics
- Update JSON structure
- Update dashboard to display new data

## Troubleshooting

### CORS Error / "Failed to fetch"
This happens when opening `dashboard.html` directly from the filesystem (file:// protocol).

**Solution:** Use the local web server
```bash
python serve.py
```

### Dashboard shows "Error loading data"
- Ensure `training_data.json` is in the same directory
- Check browser console for specific errors
- Verify JSON file is valid (not corrupted)

### Unit toggle not working
- Clear browser cache and localStorage
- Check browser console for JavaScript errors

### Missing exercises in Big 3
- Verify exercise names in database match: "Squat", "Bench Press", "Deadlift"
- Check `get_big_three()` function for name variations

### Incorrect volume calculations
- Verify warmup sets are properly filtered (reps = -1)
- Check for NULL values in weight columns
- Ensure both kg and lb columns have data

## Future Enhancements

Potential additions:
- Time of day analysis
- Rest time statistics
- RPE (Rate of Perceived Exertion) tracking
- Exercise category grouping (push/pull/legs)
- Training frequency analysis
- Plateau detection
- Export to PDF/image

## Credits

Inspired by [nodaysoff.run](https://nodaysoff.run/) by [the creator's running dashboard]

Built with:
- Python 3 (data extraction)
- Chart.js (interactive charts for Big 3 and volume trends)
- Vanilla JavaScript + SVG (heatmap and other visualizations)
- HTML5/CSS3 (layout and styling)

## License

This is a personal project for visualizing your own training data. Feel free to adapt and modify for your own use.
