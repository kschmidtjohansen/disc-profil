

# Test Freshness Tracking System

## Overview
The `disc_results` table already has a `completed_at` timestamp column (defaulting to `now()`). No database changes are needed -- we can use this existing column directly.

## Changes

### 1. Employee Dashboard - "Time for a refresh?" banner
In `src/pages/EmployeeDashboard.tsx`:
- Fetch `completed_at` alongside `primary_style` from the `disc_results` table
- Compare `completed_at` to 6 months ago using `date-fns`
- If older than 6 months, show a friendly alert/banner above the result card with text like "Tid til en opdatering?" and a short explanation

### 2. Leader Dashboard - Status column
In `src/pages/LeaderDashboard.tsx`:
- Fetch `completed_at` from `disc_results` alongside existing data
- Add a new "Status" column to the employee table
- Show "Opdateret" (green badge) if completed within 6 months, "Traenger til opfoelgning" (amber/warning badge) if older, or nothing if test not completed

### 3. Translation updates
Add new keys to all 9 translation files:

| Key | Danish | English |
|-----|--------|---------|
| `test.refreshBanner` | "Tid til en opdatering?" | "Time for a refresh?" |
| `test.refreshDescription` | "Din DISC-profil er over 6 maaneder gammel..." | "Your DISC profile is over 6 months old..." |
| `leader.status` | "Status" | "Status" |
| `leader.statusCurrent` | "Opdateret" | "Up to date" |
| `leader.statusStale` | "Traenger til opfoelgning" | "Needs follow-up" |

## Files to modify

| File | Change |
|------|--------|
| `src/pages/EmployeeDashboard.tsx` | Fetch `completed_at`, show refresh banner |
| `src/pages/LeaderDashboard.tsx` | Fetch `completed_at`, add Status column |
| `src/lib/translations/da.ts` | Add freshness keys |
| `src/lib/translations/en.ts` | Add freshness keys |
| `src/lib/translations/de.ts` | Add freshness keys |
| `src/lib/translations/es.ts` | Add freshness keys |
| `src/lib/translations/fr.ts` | Add freshness keys |
| `src/lib/translations/nl.ts` | Add freshness keys |
| `src/lib/translations/sv.ts` | Add freshness keys |
| `src/lib/translations/no.ts` | Add freshness keys |
| `src/lib/translations/fi.ts` | Add freshness keys |

## Technical Details

### Staleness check (using date-fns, already installed)
```typescript
import { differenceInMonths } from "date-fns";
const isStale = differenceInMonths(new Date(), new Date(completedAt)) >= 6;
```

### Employee banner (shown in result view when stale)
An `Alert` component (already available) with a friendly message and warm styling, placed above the result card.

### Leader table status column
A new `TableHead`/`TableCell` between "DISC Profil" and "Actions" showing a colored `Badge`:
- Green `Badge` with "Opdateret" for fresh profiles
- Amber/yellow `Badge` with "Traenger til opfoelgning" for stale profiles
- Empty cell if no test completed

No database migration is needed since `completed_at` already exists.

