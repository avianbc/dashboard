# Copilot Instructions: Strength Training Dashboard

## Project Overview

A static data visualization dashboard that extracts strength training data from a SQLite database (`MyApp.db`) and renders an interactive single-page HTML dashboard. Architecture: **Python data extraction → JSON → Static HTML/CSS/JS visualization**.

**Core Components:**
- [extract_data.py](../extract_data.py) - SQLite data processor, generates JSON
- [dashboard.html](../dashboard.html) - Self-contained SPA with Chart.js and custom SVG visualizations
- `training_data.json` - Generated data file (lbs & kg dual-unit)
- [serve.py](../serve.py) - Simple HTTP server for local viewing

## Database Schema & Data Processing

**Source:** `MyApp.db` contains 969+ workouts from 2019-present
- `history` - Workout sessions (id, date as milliseconds, duration, program_id)
- `history_exercises` - Sets (history_id, exercise_id, weightlb, weightkg, reps, set_number)
- `exercises` - Exercise definitions
- **Critical:** Warmup sets marked by `reps = -1` or negative set_number - ALWAYS filter these out for volume calculations

**Volume Calculation Pattern:**
```python
# Always filter warmups and handle dual units
SELECT SUM(weightlb * reps) as volume_lbs, SUM(weightkg * reps) as volume_kg
FROM history_exercises
WHERE reps > 0  -- Exclude warmups
```

**Date Conversion:** Timestamps are milliseconds → use `date(date/1000, 'unixepoch')` in SQLite

## Data Pipeline Workflow

1. **Extract:** `python extract_data.py` queries MyApp.db
2. **Transform:** Computes all statistics (summary, timeseries, PRs, streaks)
3. **Output:** Writes dual-unit JSON (both lbs and kg for all volume metrics)
4. **Serve:** `python serve.py` or `start_dashboard.bat` (Windows) launches local server
5. **View:** Dashboard fetches JSON and renders visualizations

**Regenerate data after DB updates:** Re-run `extract_data.py`, then refresh browser

## Dashboard Architecture

**Single HTML file pattern** - No build step, runs offline. All dependencies via CDN:
- Chart.js 4.4.0 - Line charts (annual volume, Big 3 progress)
- Custom SVG generators - Heatmap calendar, bar charts
- Vanilla JS - No React/Vue/framework

**Dual-Unit System:**
- User toggles between lbs/kg (preference stored in `localStorage`)
- All data contains both `volumeLbs` and `volumeKg` properties
- `getVolume(volumeLbs, volumeKg)` helper selects based on `currentUnit` state
- Charts/stats re-render on toggle - see `renderDashboard()` function

**Key Visualization Sections:**
1. Summary stats cards - Total workouts, volume, hours, streaks
2. Annual volume chart - Chart.js line graph
3. GitHub-style heatmap - Custom SVG, 7×260 grid (5+ years)
4. Big 3 progress - Separate Chart.js charts per lift (squat/bench/deadlift)
5. Exercise volume bars - Custom SVG horizontal bars

## Code Conventions

**Python (extract_data.py):**
- Use `sqlite3.Row` for dict-like row access
- Round volume to 2 decimals: `round(volume, 2)`
- Date strings in ISO format: `YYYY-MM-DD`
- Streak logic: consecutive calendar days (see `get_summary_stats`)

**JavaScript (dashboard.html):**
- Global state: `currentUnit`, `trainingData`
- All render functions named `render[Section]()` (e.g., `renderSummaryStats`)
- Chart instances stored globally for cleanup: `annualVolumeChartInstance`, `bigThreeChartInstances`
- **Always destroy Chart.js instances before re-rendering:** `chart.destroy()`
- Unit-aware helpers: `getVolume()`, `formatVolume()`

**Styling:**
- Dark theme: `#0a0a0a` background, `#e0e0e0` text
- Monospace for numbers: `'Courier New', monospace`
- Chart accent: `#4a9eff` (blue)
- Grid template for stat cards: `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`

## Common Tasks

**Add new statistic:**
1. Query in `extract_data.py`, include both lbs/kg if volume-related
2. Add to JSON output structure
3. Render in `dashboard.html` using `getVolume()` if numeric

**Add new chart:**
1. Create `render[Name]Chart()` function
2. Call from `renderDashboard()`
3. If using Chart.js, store instance globally and destroy before re-render
4. Ensure unit toggle updates the chart

**Debug data issues:**
- Check `training_data.json` for expected structure
- Verify warmup filtering: `WHERE reps > 0`
- Confirm date conversion: `ms_to_date(timestamp)` in Python
- Check browser console for fetch errors (use `serve.py`, not `file://`)

## Project-Specific Gotchas

1. **Heatmap calculations:** Uses percentile-based color scaling, not absolute thresholds - see `getColorLevel()` in dashboard.html
2. **PR tracking:** Grouped by rep count - a 5RM PR is separate from 1RM PR
3. **Streak logic:** Counts consecutive calendar days, not workout sessions (multiple workouts/day = 1 streak day)
4. **Chart.js memory leaks:** Always destroy instances before re-creating on unit toggle
5. **File:// protocol fails:** Dashboard requires HTTP server for fetch() to work - use `serve.py`

## Reference Files

- [PLAN.md](../PLAN.md) - Original design decisions and database schema analysis
- [README.md](../README.md) - User-facing documentation with usage examples
