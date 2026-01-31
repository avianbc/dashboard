# Training Dashboard

A Svelte-based dashboard for visualizing strength training data from the StrongLifts/MyRoutine app.

## Project Structure

```
dashboard/
├── scripts/                          # Data processing scripts
│   ├── extract_data.py              # Main data extraction from database
│   └── fix_stronglifts_dates.py    # Date fixing utility
├── data/                             # Source database files
│   ├── MyApp.db                     # Your workout database (gitignored)
│   └── myapp-db-sqlite-schema.json  # Schema reference
├── static/
│   └── data/                         # Generated JSON outputs (committed)
│       ├── training_core.json       # Core data (~53KB) - loaded immediately
│       ├── training_deferred.json   # Deferred data (~718KB) - lazy loaded
│       └── training_data.json       # Full dataset (782KB) - backward compat
├── src/                              # Svelte source code
│   ├── lib/
│   │   ├── components/              # UI components
│   │   ├── config/                  # Shared configuration (lift colors, etc.)
│   │   ├── stores/                  # Svelte stores
│   │   ├── types/                   # TypeScript type definitions
│   │   └── utils/                   # Utility functions
│   └── routes/                       # SvelteKit routes
└── package.json                      # Dependencies and scripts
```

## Workflow

### Regenerating Data (When You Get a New Database)

1. **Drop your new database into the `data/` folder**

   ```bash
   cp /path/to/new/MyApp.db data/MyApp.db
   ```

2. **Run the extraction script**

   ```bash
   npm run extract
   ```

   This generates three files in `static/data/`:
   - `training_core.json` - Core metrics, PRs, summary stats
   - `training_deferred.json` - Charts, calendar, detailed analytics
   - `training_data.json` - Complete dataset (for backward compatibility)

3. **Build the dashboard**
   ```bash
   npm run build
   ```
   Outputs to `../static/dashboard/` with precompressed `.gz` and `.br` files

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run check

# Lint and format
npm run lint
npm run format
```

## Performance Optimizations

The dashboard implements several optimizations:

1. **Data Splitting**: Core data (53KB) loads immediately, deferred data (718KB) loads after initial render
2. **CSS Consolidation**: Shared styles in `app.css` reduce duplication
3. **Shared Configuration**: Lift colors/config in `src/lib/config/lifts.ts`
4. **Precompression**: Build generates `.gz` and `.br` files (~13KB initial transfer with gzip)

**Result**: ~30x smaller initial payload (782KB → 53KB → ~13KB with compression)

## Why Manual Data Generation?

The data extraction is **intentionally not integrated into the build process** because:

- The source database (`MyApp.db`) is updated infrequently (when you export from your phone)
- No need to run expensive data extraction on every build
- Gives you control over when data is regenerated
- Generated JSON files are committed to the repo for fast deployments

## Tech Stack

- **SvelteKit** - Framework
- **TypeScript** - Type safety
- **ECharts** - Charts and visualizations
- **Vite** - Build tool
- **Python** - Data extraction from SQLite

## Data Flow

```
MyApp.db (SQLite)
    ↓
extract_data.py (Python)
    ↓
training_*.json (Generated)
    ↓
SvelteKit (Prerendered)
    ↓
Static HTML + JSON (Deployed)
```
