# Strength Training Dashboard

## Tech stack:

- Frontend framework: Svelte(Kit), use TypeScript where it adds value. Use PNPM
- Charting library: D3.js (or ECharts if D3.js is too complex)
- Icons: Ignore the fact that `extract_data.py` mentions FontAwsome. Independently we will identify an appropriate icon set to use

## Requirements **IMPORTANT**

- Visualize strength training progress over time
- Analyze workout data for insights
- Present data in an engaging dashboard format
- **IMPORTANT**: Dashboard should be both impressive even to non-lifters and insightful for experienced lifters
- UX should be consistent, modern, and impressive
- Support BOTH metric and imperial units (lbs<>kg, miles<>km)
- Date formatting should be consistent
- CSS should utilize modern practices (flexbox, grid, variables, etc.)
- Components should be modular and reusable
- Components should support loading states, empty states, and error states where appropriate
- Code should be well-documented and maintainable

**Nice to haves**:

- Support multiple data sources/formats in the future
- Light and dark mode theme support
- Locale aware date and number formatting
- a11y and i18n considerations

## Data Pre-processing

### Files

- MyApp.db: SQLite database file containing the raw workout data.
- myapp-db-sqlite-schema.json: JSON file defining the SQLite database schema for storing workout data.
- extract_data.py: Script to extract and preprocess raw workout data from various sources.
- fix_stronglifts_dates.py: Script to correct date formats in MyApp.db for imported StrongLifts data.
- training_data.json: JSON file containing preprocessed training data for analysis and visualization. See `data/training_data.md` for structure.

### Instructions

1. I will provide a MyApp.db SQLite database file sourced via the `com.maxworkoutcoach.workouttrainer.workouttrainer` android app. File is sourced via "export database" feature in the app settings.
   - **Optionally**: Pre-correct stronglifts dates via running `fix_stronglifts_dates.py` first, which outputs a corrected `MyApp.db` file.
2. Run `extract_data.py` to generate `training_data.json` from `MyApp.db`.
3. The `training_data.json` file will be used for further analysis and visualization in the dashboard.

For now I will manually generate the `training_data.json` file. The de-coupling theoretically allows us to optimize the json data structure as well as opens the possibility of using different data sources in the future.

## Hosting and Deployment

- The dashboard can be hosted on any static site hosting service (e.g., GitHub Pages, Netlify, Vercel).
- Deployment can be automated using CI/CD pipelines to ensure the latest version is always live.
- We will NOT have a backend server; all data processing should be done client-side or during the build process.

### Existing Portfolio/Blog

There is an [existing Portfolio/Blog](https://bradleycarey.com/) which uses [Hugo Static Site Generator](https://gohugo.io/) with the [Hugo Coder theme](https://github.com/luizdepra/hugo-coder). Source code is available at <https://github.com/avianbc/blog> and CI/CD pipeline and hosting provided by [Netlify](https://app.netlify.com/sites/bradleycarey/deploys).

Would like to consider linking to the dashboard from the existing blog/portfolio site once it is complete. May be able to deploy it in the static folder of the existing Hugo site, or may be better to keep it separate. Also consider using a subdomain like `dashboard.bradleycarey.com`.
