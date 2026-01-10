# Copilot Instructions for Strength Training Dashboard

## Repository Overview

This is a **personal strength training dashboard** that visualizes workout data from a SQLite database (`MyApp.db`). The project extracts data using Python and displays it in an interactive HTML dashboard with JavaScript visualizations.

**Key Statistics:**

- 969+ workouts spanning 5+ years (2019-2025)
- 6.8M lbs total volume across 43 exercises
- Single-page application, no backend required

## Project Type and Technology Stack

- **Type:** Static data visualization dashboard (no backend/API)
- **Size:** Small (10 files, ~5,600 lines of code total)
- **Languages:** Python 3.12+, JavaScript (vanilla), HTML5/CSS3
- **Dependencies:**
  - Python: Uses ONLY standard library (`sqlite3`, `json`, `argparse`, `datetime`)
  - Node.js: `http-server` (v14.1.1), `prettier` (v3.7.4)
- **External Libraries:** Chart.js v4.4.0 (CDN), chartjs adapters (CDN)
- **Database:** SQLite 3 (MyApp.db)
- **Runtimes Tested:** Python 3.12.3, Node v20.19.6, npm 10.8.2

## Build and Validation Commands

**IMPORTANT:** Always run commands in this exact order to avoid issues.

### First-Time Setup

```bash
# 1. Install Node dependencies (required before any npm commands)
npm install
```

Expected output: ~49 packages installed, takes ~1-2 seconds. One deprecation warning for `whatwg-encoding@2.0.0` is normal and can be ignored.

### Data Extraction (ALWAYS run before viewing dashboard)

```bash
# Basic extraction (uses MyApp.db by default)
python extract_data.py

# OR with custom paths
python extract_data.py -d path/to/MyApp.db -o path/to/output.json

# OR with verbose output
python extract_data.py --verbose
```

**Expected output:**

- Processing messages for each section (summary, volume, calendar, etc.)
- Summary statistics with workout count, volume, date range
- Takes ~1-2 seconds
- Generates/updates `training_data.json` (749KB)

**Common Issues:**

- If `MyApp.db` doesn't exist: Script will fail with "Error connecting to database"
- The script is idempotent - safe to run multiple times

### Code Formatting

```bash
# Format all files with Prettier
npm run format
```

Expected output: Lists all formatted files (.html, .json, .md files). Takes ~1 second.

### Start Local Server (for viewing dashboard)

```bash
# Start server and auto-open dashboard in browser
npm start

# OR build + start in one command
npm run build
```

Expected behavior: Opens `http://localhost:8000/index.html` in default browser. Press Ctrl+C to stop server.

**IMPORTANT:** The dashboard MUST be served via http-server due to CORS restrictions when loading JSON files. Opening `index.html` directly from filesystem (file://) will fail with CORS errors.

### Validation (No Tests)

**There are no automated tests in this repository.** To validate changes:

1. Run `python extract_data.py` - should complete without errors
2. Run `npm start` - dashboard should load without console errors
3. Check browser console (F12) for JavaScript errors
4. Verify JSON structure is valid: `python -m json.tool training_data.json > /dev/null`
5. Python syntax check: `python -m py_compile extract_data.py fix_stronglifts_dates.py`

### Complete Build/Validate Workflow

```bash
# Clean environment test (from scratch)
rm -rf node_modules
npm install                    # ~1-2 seconds
python extract_data.py         # ~1-2 seconds
npm run format                 # ~1 second
npm start                      # Opens browser
```

## Project Layout and Architecture

### Root Directory Files

```
/
├── .git/                      # Git repository
├── .github/                   # GitHub configuration (created by this task)
│   └── copilot-instructions.md
├── .gitignore                 # Ignores node_modules, package-lock.json, __pycache__
├── MyApp.db                   # SQLite database (1.4MB, read-only)
├── README.md                  # Comprehensive documentation (304 lines)
├── index.html             # Main visualization (3,484 lines, 114KB)
├── extract_data.py            # Data extraction script (1,534 lines, 56KB)
├── fix_stronglifts_dates.py   # Utility script for date fixes (126 lines)
├── myapp-db-sqlite-schema.json # DB schema reference (7KB)
├── package.json               # Node dependencies and npm scripts
└── training_data.json         # Generated JSON data (749KB, git-tracked)
```

### Key Source Files

**`extract_data.py`** (Main data processing script):

- Entry point: `main()` function at line 1534
- Uses argparse for CLI: `--db`, `--out`, `--verbose` flags
- Processes 15+ data categories: summary stats, volume time series, workout calendar, Big 3 progression, program history, milestones, etc.
- Filters warmup sets: `reps = -1` or `set_number < 0`
- Calculates volume: `weight × reps` for working sets only
- Outputs comprehensive JSON with nested structure (see README lines 194-219)
- No external dependencies - uses only Python standard library

**`index.html`** (Single-page application):

- Self-contained: HTML, CSS (lines 10-1200), JavaScript (lines 1201-3484)
- Uses Chart.js from CDN for Big 3 progress charts and volume trends
- Custom SVG rendering for workout heatmap
- Dark theme with CSS variables (lines 11-55)
- Unit toggle feature (lbs ↔ kg) with localStorage persistence
- Fetches `training_data.json` on load via fetch API
- Responsive design with mobile breakpoints

**`fix_stronglifts_dates.py`** (Utility script):

- One-time fix for timezone import issues
- Creates backup before modifying database
- Not part of regular workflow

### Database Schema (MyApp.db)

Key tables used by extract_data.py:

- `history` - Workout sessions (date, program_id, duration, note)
- `history_exercises` - Individual sets (weight_kg, weight_lb, reps, set_number)
- `exercises` - Exercise catalog (id, name)
- `programs` - Training programs (id, routine name)
- `body_weight` - Body weight tracking (date, weight)

**Important:** Warmup sets have `reps = -1` and should be filtered out for volume calculations.

### Configuration Files

- **package.json**: Defines 4 npm scripts (start, extract, build, format)
- **.gitignore**: Excludes node_modules/, package-lock.json, **pycache**/, \*.pyc
- **No linting configs**: No .eslintrc, .prettierrc, or Python linting files
- **Prettier settings**: Single quotes (via CLI flag in package.json)

### GitHub Workflows

There is 1 active workflow:

- **Copilot coding agent** (dynamic workflow, not in repository)
- No CI/CD pipelines, no automated tests, no pre-commit hooks

## Common Patterns and Conventions

### Code Style

**Python:**

- PEP 8 style (4-space indentation)
- Comprehensive docstrings for functions
- Type hints not used
- Error handling with try/except and sys.exit(1)

**JavaScript:**

- Vanilla JS, no frameworks
- Functional style with helper functions
- ES6 features (const/let, arrow functions, template literals)
- Single quotes (enforced by Prettier)

**HTML/CSS:**

- CSS variables for theming (lines 11-55 of index.html)
- BEM-like naming for specific components (e.g., `lift-card-squat`)
- Mobile-first responsive design

### Data Flow

1. `MyApp.db` (source) → 2. `extract_data.py` (processing) → 3. `training_data.json` (intermediate) → 4. `index.html` (visualization)

**Critical:** If you modify the data structure in extract_data.py, you MUST update the JavaScript in index.html to match the new JSON structure.

## Important Notes and Gotchas

### File Modifications

- **Generated files:** `training_data.json` is git-tracked (intentionally) to allow viewing dashboard without Python
- **Database:** `MyApp.db` is git-tracked and should be treated as read-only
- **Safe to edit:** `extract_data.py`, `index.html`, `README.md`, `package.json`

### Dependencies

- **Python has NO pip requirements** - uses only standard library
- **Do NOT create** requirements.txt or add Python dependencies
- Chart.js is loaded from CDN - no npm install for it

### Common Mistakes to Avoid

1. **DO NOT** open index.html directly (file://). Must use `npm start` for http:// protocol
2. **DO NOT** run `npm start` before `npm install` - will fail with "command not found"
3. **DO NOT** modify database files without backing up first
4. **DO NOT** add test frameworks unless explicitly requested (none exist currently)
5. **DO NOT** remove or modify git-tracked generated files (training_data.json) without good reason

### Error Messages and Fixes

**"Error connecting to database"**: MyApp.db doesn't exist or path is wrong

- Fix: Verify file exists, use `-d` flag with correct path

**"Failed to fetch training_data.json"** in browser console: CORS error

- Fix: Use `npm start` instead of opening file directly

**npm command not found**: Dependencies not installed

- Fix: Run `npm install` first

**Dashboard shows "Error loading data"**: JSON file missing or invalid

- Fix: Run `python extract_data.py` to regenerate

### Performance Expectations

All commands complete quickly:

- `npm install`: 1-2 seconds (clean install)
- `python extract_data.py`: 1-2 seconds
- `npm run format`: ~1 second
- Data processing: Handles 969 workouts in <2 seconds

## Working with This Repository

### Making Code Changes

1. **Python changes** (extract_data.py):
   - Test with: `python extract_data.py --verbose`
   - Verify JSON output: `python -m json.tool training_data.json > /dev/null`
   - Check syntax: `python -m py_compile extract_data.py`

2. **Dashboard changes** (index.html):
   - Run: `npm start` to view in browser
   - Check browser console (F12) for errors
   - Test unit toggle functionality
   - Verify on different screen sizes (responsive design)

3. **Documentation changes** (README.md):
   - Run: `npm run format` to format
   - No other validation needed

### Typical Workflow for Agent

1. Understand the task requirements
2. Read relevant code sections (use view tool on specific line ranges)
3. Make minimal surgical changes to required files
4. Regenerate data: `python extract_data.py`
5. Test in browser: `npm start` (verify in console, no errors)
6. Format code: `npm run format`
7. Commit changes

### Trust These Instructions

These instructions were created by thoroughly exploring and testing the repository. Follow them precisely to avoid common pitfalls. Only search for additional information if:

- These instructions are incomplete for your specific task
- You discover the instructions are outdated or incorrect
- You need to understand implementation details not covered here

## Exercise Name Variations (for Big 3 tracking)

The code recognizes these variations (see extract_data.py lines 17-20):

- **Squat:** 'Squat', 'Back Squat', 'Front Squat', 'Squats'
- **Bench Press:** 'Bench Press', 'Bench', 'Flat Bench Press'
- **Deadlift:** 'Deadlift', 'Conventional Deadlift', 'Deadlifts'
- **Overhead Press:** 'Overhead Press', 'OHP', 'Military Press', 'Standing Press', 'Shoulder Press', 'Barbell Overhead Press'

When making changes related to exercise tracking, ensure these variations are preserved.
