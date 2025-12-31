# Fitness Training Dashboard

An interactive web-based dashboard for visualizing your workout data from MyApp.db. The dashboard provides comprehensive insights into your training progression, consistency, program effectiveness, and exercise patterns.

## 🎯 Features

- **Strength Progression Tracking**: Visualize weight, volume, and estimated 1RM for main lifts (Squat, Bench Press, Deadlift, Overhead Press)
- **Personal Records**: Track your PRs for each exercise
- **Training Consistency**: Monthly workout counts and weekly training patterns
- **Program Analysis**: Compare different training programs by volume, efficiency, and duration
- **Exercise Insights**: See your most trained exercises and volume distribution
- **Interactive Charts**: Filter by date range, toggle between different views, and explore your data

## 📋 Requirements

- **Python 3.7+** (for data extraction)
- **Web Browser** (Chrome, Firefox, Edge, Safari - for viewing dashboard)
- **MyApp.db** (your fitness tracking database)

## 🚀 Quick Start

### 1. Generate Dashboard Data

After installing Python, restart your terminal, then run:

```bash
python generate_dashboard.py
```

This will:
- Read data from `MyApp.db`
- Extract and process workout statistics
- Generate `workout_data.json` file

**Output:**
```
Connecting to database: MyApp.db
Extracting data...
Writing data to workout_data.json...

Success! Dashboard data generated.
  Total workouts: 969
  Total sets: 21,246
  Date range: 2019-01-24 to 2025-10-25
  Total volume: 2,477,000 kg

Now open dashboard.html in your browser to view visualizations.
```

### 2. Open Dashboard

Simply double-click `dashboard.html` or open it in your browser:

```bash
# Windows
start dashboard.html

# Or just drag and drop dashboard.html into your browser
```

That's it! The dashboard will load and display all your visualizations.

## 🔄 Updating with New Data

When you have an updated database:

1. **Replace the database file:**
   ```bash
   # Copy your new database to this directory
   copy C:\path\to\new\MyApp.db C:\source\sqlite\MyApp.db
   ```

2. **Regenerate the data:**
   ```bash
   python generate_dashboard.py
   ```

3. **Refresh the dashboard:**
   - Reload `dashboard.html` in your browser (F5 or Ctrl+R)
   - The dashboard automatically loads the new data

## 📁 File Structure

```
c:\source\sqlite\
├── MyApp.db                    # Your workout database
├── generate_dashboard.py       # Data extraction script
├── dashboard.html              # Interactive dashboard
├── workout_data.json           # Generated data (created by script)
├── README.md                   # This file
└── PLAN.md                     # Implementation details
```

## 🎨 Dashboard Sections

### 1. Overview Stats
- Total workouts, volume, hours trained
- Unique exercises performed
- Date range covered

### 2. Strength Progression
- Line charts for Squat, Bench Press, Deadlift, Overhead Press
- Toggle between Weight, Volume, or Estimated 1RM view
- Personal records displayed
- Switch between exercises using dropdown

### 3. Training Consistency
- **Monthly Workouts**: Bar chart showing workouts per month
- **Weekly Distribution**: Which days you train most frequently

### 4. Program Analysis
- **Program Timeline**: Horizontal bar chart showing when you used each program
- **Comparison Table**: Compare programs by volume, efficiency, and duration
- Click column headers to sort

### 5. Exercise Insights
- **Top 15 Exercises**: By total volume lifted
- **Exercise Frequency**: Pie chart showing set distribution

## 🛠️ Advanced Usage

### Custom Database Path

```bash
python generate_dashboard.py --db "C:\path\to\your\database.db"
```

### Custom Output File

```bash
python generate_dashboard.py --output "my_data.json"
```

Note: If you change the output filename, you'll need to update the fetch URL in `dashboard.html` (line ~342).

### Running from Different Directory

```bash
cd C:\source\sqlite
python generate_dashboard.py --db "D:\Backups\MyApp.db"
```

## 🔧 Troubleshooting

### Python Not Found

After installing Python with winget, you need to **restart your terminal**:

```bash
# Close and reopen your terminal, then verify:
python --version
```

Should show: `Python 3.14.x` or similar.

### Dashboard Shows "Loading workout data..."

This means `workout_data.json` wasn't found. Make sure you:
1. Ran `python generate_dashboard.py` successfully
2. The JSON file is in the same directory as `dashboard.html`

### Charts Not Displaying

- Ensure you have internet connection (Chart.js loads from CDN)
- Try opening dashboard in a different browser
- Check browser console (F12) for errors

### No Data for Exercise

If an exercise shows no data:
- Check that the exercise name in the database matches exactly (case-sensitive)
- The exercise must have recorded sets with weight > 0 and reps > 0

## 📊 Data Source

The dashboard extracts data from your MyApp.db SQLite database, which contains:

- **programs**: Workout programs (StrongLifts, nSuns, etc.)
- **exercises**: Exercise definitions
- **history**: Completed workout sessions
- **history_exercises**: Individual sets performed
- **body_weight**: Body weight measurements

## 🎓 Understanding the Metrics

### Estimated 1RM
Calculated using the Epley formula:
```
1RM = weight × (1 + reps/30)
```

### Volume
Total weight × reps for all sets:
```
Volume = Σ(weight × reps)
```

### Volume per Workout
Average volume per workout for a program:
```
Volume/Workout = Total Volume / Number of Workouts
```

## 🚀 Performance

- **Data Extraction**: 2-5 seconds (depending on database size)
- **Dashboard Loading**: Instant (after JSON is generated)
- **Chart Rendering**: <1 second
- **File Size**: ~500KB-2MB for workout_data.json (depends on history)

## 🔐 Privacy

All data processing happens **locally on your computer**:
- No data is sent to external servers
- Dashboard works completely offline (after Chart.js CDN loads)
- Your workout data never leaves your machine

## 💡 Tips

1. **Bookmark the dashboard**: Add `dashboard.html` to your browser bookmarks for easy access
2. **Regular updates**: Set a reminder to regenerate data weekly/monthly
3. **Backup your data**: Keep backups of `MyApp.db` before regenerating
4. **Compare programs**: Use the Program Analysis section to identify your most effective training programs
5. **Track trends**: Use the progression charts to identify plateaus and plan deloads

## 🐛 Known Issues

- RPE data is mostly unused in the database (shows 0.0 values)
- onerepmax table is empty (we calculate estimated 1RM instead)
- Some older workouts may have missing duration data

## 📈 Future Enhancements

Potential additions (not yet implemented):
- Calendar heatmap visualization
- Muscle group balance radar chart
- Training streak calculations
- Volume landmarks and milestones
- Export charts as images
- Workout predictions based on trends

## 📝 License

This dashboard is provided as-is for personal use with your fitness tracking data.

## 🙋 Questions?

Refer to `PLAN.md` for detailed implementation information and data structure documentation.

---

**Last Updated**: December 2024
**Compatible with**: MyApp.db (Android fitness tracking app)
