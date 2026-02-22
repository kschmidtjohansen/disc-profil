

# Team Analysator -- Ny side til ledere

## Overblik
En ny side paa `/team-analyzer` hvor ledere kan vaelge 2-5 medarbejdere, klikke "Analyser", og faa en visuel opsummering af gruppens DISC-balance, styrker, huller og anbefalinger.

## Ny fil: `src/pages/TeamAnalyzer.tsx`

### Layout
- Samme header med NavDropdown, LanguageDropdown og logo som de andre leader-sider
- Adgangskontrol: kun ledere (redirect til `/disc-test` ellers)

### Funktionalitet

**1. Multi-select af medarbejdere**
- Hent alle medarbejdere med gennemfoert DISC-test fra `profiles` + `disc_results`
- Vis en liste med checkboxes (brug eksisterende `Checkbox` komponent)
- Minimum 2, maksimum 5 valgte -- "Analyser"-knappen er disabled uden for dette interval
- Vis en taeller: "2 af 5 valgt"

**2. Analyse-visning (vises efter klik paa "Analyser")**

Beregn DISC-fordelingen for de valgte medarbejdere:
- Taeller antal D, I, S og C typer i gruppen
- Viser et simpelt visuelt overblik med farvede badges/bars

**3. Styrker og huller**
Genereret med simpel regelbaseret logik direkte i koden:

| Condition | Styrke-tekst | Hul-tekst |
|-----------|-------------|-----------|
| Mange D'er | "Teamet er handlingsorienteret og resultatstyret" | - |
| Ingen D | - | "I mangler en D-type til at drive beslutninger" |
| Mange I'er | "Teamet har staerk kommunikation og kreativitet" | - |
| Ingen I | - | "I mangler en I-type til at skabe engagement" |
| Mange S'er | "Teamet er stabilt og paaalideligt" | - |
| Ingen S | - | "I mangler en S-type til at sikre harmoni" |
| Mange C'er | "Teamet har hoej kvalitet og praecision" | - |
| Ingen C | - | "I mangler en C-type til at tjekke detaljer" |

**4. Anbefalinger**
Regelbaseret anbefaling baseret paa profilerne:
- "Kommunikation": Foerst I-type, ellers D-type
- "Planlaegging": Foerst C-type, ellers S-type

Vises som kort med navn + begrundelse.

## Navigations-opdatering

Tilfoejer "Team Analysator" til `NavDropdown` i alle 4 sider:
- `EmployeeDashboard.tsx`
- `LeaderDashboard.tsx`
- `TeamOverview.tsx`
- `TeamAnalyzer.tsx` (ny)

Ny route `/team-analyzer` i `App.tsx`.

## Oversaettelser

Nye noeger tilfojes til alle 9 oversaettelsesfiler:

```typescript
teamAnalyzer: {
  title: "Team Analysator",
  subtitle: "Analyser DISC-balancen i en udvalgt gruppe",
  selectEmployees: "Vælg medarbejdere (2-5)",
  selected: "{count} af 5 valgt",
  analyze: "Analyser",
  strengths: "Styrker",
  gaps: "Potentielle huller",
  recommendations: "Anbefalinger",
  communicationLead: "Bør lede kommunikationen",
  planningLead: "Bør håndtere planlægningen",
  noCompleted: "Ingen medarbejdere har gennemført testen endnu.",
  minSelect: "Vælg mindst 2 medarbejdere",
  balance: "DISC-fordeling",
  strongD: "Teamet er handlingsorienteret og resultatstyret.",
  strongI: "Teamet har stærk kommunikation og kreativitet.",
  strongS: "Teamet er stabilt og pålideligt.",
  strongC: "Teamet har høj kvalitet og præcision.",
  gapD: "I mangler en D-type til at drive beslutninger.",
  gapI: "I mangler en I-type til at skabe engagement.",
  gapS: "I mangler en S-type til at sikre harmoni og stabilitet.",
  gapC: "I mangler en C-type til at tjekke detaljer og kvalitet.",
  becauseCommunication: "har den bedste profil til at kommunikere og engagere gruppen.",
  becausePlanning: "har den bedste profil til at strukturere og planlægge opgaver.",
}
```

## Filer der aendres

| Fil | Aendring |
|-----|--------|
| `src/pages/TeamAnalyzer.tsx` | **Ny fil** -- hele Team Analysator-siden |
| `src/App.tsx` | Tilfoej `/team-analyzer` route |
| `src/pages/EmployeeDashboard.tsx` | Tilfoej nav-link til Team Analysator |
| `src/pages/LeaderDashboard.tsx` | Tilfoej nav-link til Team Analysator |
| `src/pages/TeamOverview.tsx` | Tilfoej nav-link til Team Analysator |
| `src/lib/translations/da.ts` | Tilfoej `teamAnalyzer` noeger |
| `src/lib/translations/en.ts` | Tilfoej `teamAnalyzer` noeger (engelsk) |
| `src/lib/translations/de.ts` | Tilfoej `teamAnalyzer` noeger (tysk) |
| `src/lib/translations/es.ts` | Tilfoej `teamAnalyzer` noeger (spansk) |
| `src/lib/translations/fr.ts` | Tilfoej `teamAnalyzer` noeger (fransk) |
| `src/lib/translations/nl.ts` | Tilfoej `teamAnalyzer` noeger (hollandsk) |
| `src/lib/translations/sv.ts` | Tilfoej `teamAnalyzer` noeger (svensk) |
| `src/lib/translations/no.ts` | Tilfoej `teamAnalyzer` noeger (norsk) |
| `src/lib/translations/fi.ts` | Tilfoej `teamAnalyzer` noeger (finsk) |

## Tekniske detaljer

### Analyse-logik (ren frontend, ingen AI)
```typescript
// Taeller typer
const counts = { D: 0, I: 0, S: 0, C: 0 };
selected.forEach(m => {
  const style = m.primary_style.split("/")[0];
  counts[style]++;
});

// Styrker: typer med >= 2 medlemmer
// Huller: typer med 0 medlemmer
// Kommunikation: foerste I-type, fallback D-type
// Planlaegging: foerste C-type, fallback S-type
```

### UI-komponenter
- `Checkbox` til multi-select
- `Card` til resultatkort (balance, styrker, huller, anbefalinger)
- `Badge` til DISC-type labels
- `Progress`-lignende farvede bars til at vise DISC-fordelingen visuelt
- `Button` til "Analyser"

Ingen database-aendringer er noedvendige -- alt data hentes fra eksisterende tabeller.

