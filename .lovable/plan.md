
# New "Team Overblik" Page with DISC Quadrant Grid

## Overview
Create a new leader-only page at `/team-overview` that displays a visual 2x2 DISC quadrant grid. Employees who have completed the test are plotted as dots/avatars in their corresponding quadrant. Clicking a dot shows a popup with the employee's top 3 traits.

## 1. New Route

Add `/team-overview` route in `src/App.tsx` pointing to a new `TeamOverview` page component.

## 2. New Page: `src/pages/TeamOverview.tsx`

- **Access control**: Same pattern as `LeaderDashboard` -- redirect non-leaders to `/disc-test`
- **Header**: Reuses the same header pattern (logo, NavDropdown, LanguageDropdown, logout) from LeaderDashboard
- **Data fetching**: Fetch from `profiles`, `user_roles`, and `disc_results` tables to get all employees with completed tests, their `primary_style`, and their traits from translation data

### DISC Quadrant Grid
A 2x2 CSS grid built with Tailwind:

```
+--------------------+--------------------+
|    D (Dominans)    |   I (Indflydelse)  |
|    Red bg          |   Yellow bg        |
|                    |                    |
|   [dot] [dot]      |   [dot]            |
+--------------------+--------------------+
|   S (Stabilitet)   | C (Samvittighed)   |
|    Green bg        |   Blue bg          |
|                    |                    |
|   [dot] [dot]      |   [dot] [dot]      |
+--------------------+--------------------+
```

- Each quadrant has a distinct pastel background color (D=red-toned, I=yellow-toned, S=green-toned, C=blue-toned)
- Quadrant label in the corner with the DISC letter and full name
- Employees shown as small circular dots with initials inside
- Dots are arranged using flex-wrap within each quadrant

### Click Popup (Popover)
- Uses the existing `Popover` component from shadcn/ui
- Shows employee name, their DISC type title, and top 3 traits (from `t.disc.descriptions[style].traits`)
- Clean, card-like popup styling

## 3. Navigation Updates

Update the `NavDropdown` in `LeaderDashboard`, `EmployeeDashboard`, and `TeamOverview` to include a "Team Overblik" link (only for leaders).

## 4. Translation Updates

Add new keys to all 9 translation files:

```typescript
teamOverview: {
  title: "Team Overblik",
  subtitle: "DISC-fordeling i dit team",
  noResults: "Ingen medarbejdere har gennemført testen endnu.",
  topTraits: "Top egenskaber",
}
```

## Files to Create
| File | Purpose |
|------|---------|
| `src/pages/TeamOverview.tsx` | New page with quadrant grid |

## Files to Modify
| File | Change |
|------|--------|
| `src/App.tsx` | Add `/team-overview` route |
| `src/pages/EmployeeDashboard.tsx` | Add "Team Overblik" link in NavDropdown (leader only) |
| `src/pages/LeaderDashboard.tsx` | Add "Team Overblik" link in NavDropdown |
| `src/lib/translations/da.ts` | Add `teamOverview` keys |
| `src/lib/translations/en.ts` | Add `teamOverview` keys |
| `src/lib/translations/de.ts` | Add `teamOverview` keys |
| `src/lib/translations/es.ts` | Add `teamOverview` keys |
| `src/lib/translations/fr.ts` | Add `teamOverview` keys |
| `src/lib/translations/nl.ts` | Add `teamOverview` keys |
| `src/lib/translations/sv.ts` | Add `teamOverview` keys |
| `src/lib/translations/no.ts` | Add `teamOverview` keys |
| `src/lib/translations/fi.ts` | Add `teamOverview` keys |

## Technical Details

### Quadrant Colors (Tailwind classes)
- D (top-left): `bg-red-50 border-red-200` with red accent
- I (top-right): `bg-yellow-50 border-yellow-200` with yellow accent
- S (bottom-left): `bg-green-50 border-green-200` with green accent
- C (bottom-right): `bg-blue-50 border-blue-200` with blue accent

### Employee Dots
- `w-10 h-10 rounded-full` with style-matching border color
- Initials extracted from `full_name`
- `cursor-pointer` with hover scale effect
- Wrapped in a `Popover` trigger

### Data Flow
1. Fetch all profiles + disc_results (same as LeaderDashboard)
2. Filter to only those with a `primary_style`
3. Group by primary style (D, I, S, C) -- handle combined styles like "D/I" by using the first letter
4. Render each group in its quadrant
5. On click, look up traits from `t.disc.descriptions[style].traits` and show top 3

### Responsive Design
- On desktop: 2x2 grid with equal quadrants (`grid-cols-2`)
- On mobile: Stack to single column (`grid-cols-1`) so each quadrant is full-width
- Quadrant minimum height: `min-h-[200px]` on desktop, auto on mobile
