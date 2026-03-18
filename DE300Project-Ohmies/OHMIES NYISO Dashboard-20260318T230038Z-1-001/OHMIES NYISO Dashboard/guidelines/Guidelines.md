# OHMIES Energy Dashboard - Development Guidelines

## NYISO Zone Naming Conventions

The dashboard uses the following NYISO utility zone codes:

### Official Zone Codes
- **CAPITL** - Capital
- **HUD VL** - Hudson Valley
- **MILLWD** - Millwood
- **CENTRL** - Central
- **WEST** - West
- **MHK VL** - Mohawk Valley
- **NORTH** - North
- **GENESE** - Genesee
- **N.Y.C.** - New York City
- **DUNWOOD** - Dunwoodie
- **LONGIL** - Long Island

### Supported Zone Aliases
The system automatically normalizes the following alternate zone codes:

- `DUNWOD` → `DUNWOOD`
- `HUD` → `HUD VL`
- `HUDVL` → `HUD VL`
- `MHK` → `MHK VL`
- `MHKVL` → `MHK VL`
- `NYC` → `N.Y.C.`

### File Naming Convention
CSV files should follow the format: `{ZONE}_{YYYY-MM-DD}.csv`

Examples:
- `CAPITL_2025-07-15.csv`
- `HUD VL_2025-07-15.csv` (or `HUD_2025-07-15.csv`)
- `N.Y.C._2025-07-15.csv` (or `NYC_2025-07-15.csv`)
- `DUNWOOD_2025-07-15.csv` (or `DUNWOD_2025-07-15.csv`)

The date represents the first day of the week being analyzed.

## CSV Data Format

Each CSV file should contain the following columns:
- `Hour Start` - Timestamp for the hourly reading
- `actual_load` - Actual load in MW
- `predicted_load` - Predicted load in MW
- `error` - Prediction error (actual - predicted)
- `abs_error` - Absolute prediction error
- `percent_error` - Percentage error

## Architecture Notes

- Zone information and aliases are defined in `/src/app/utils/nyiso-locations.ts`
- File parsing and normalization happens in `/src/app/components/upload-page.tsx`
- The `getUtilityInfo()` function automatically handles zone alias resolution


 Some of the base components you are using may have styling(eg. gap/typography) baked in as defaults.
So make sure you explicitly set any styling information from the guidelines in the generated react to override the defaults.
