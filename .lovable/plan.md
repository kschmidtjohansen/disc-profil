

# Tre rettelser: Mobil navbar, logo-navigation og flere DISC-spoergsmaal

## 1. Fix mobil navbar paa /dashboard

Headeren paa LeaderDashboard og EmployeeDashboard bruger `flex justify-between` med mange elementer (logo, NavDropdown, sprogvaelger, brugernavn, logout-knap) paa en enkelt linje. Paa smaa skaerme overlapper disse.

### Loesning
- Giv headeren `flex-wrap` og juster layout til mobil med responsive klasser
- Paa mobil: logo + nav-dropdown paa foerste linje, sprogvaelger + brugernavn + logout paa anden linje
- Skjul brugernavnet paa meget smaa skaerme (`hidden sm:inline`)
- Reducer spacing og font-stoerrelse paa mobil
- Anvend samme fix i baade `EmployeeDashboard.tsx` og `LeaderDashboard.tsx`

### Konkret aendring
Header-elementet aendres fra:
```
px-6 py-4 flex justify-between items-center
```
til:
```
px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-between items-center gap-2
```

Hoejre side wraps bedre med `flex-wrap` og `gap-2`. Brugernavn faar `hidden sm:inline`. Sprogvaelger-knappen forkortes paa mobil (kun flag-ikon, uden tekst).

## 2. Logo klikbart - navigerer til forsiden

Logoet i headeren (`<img src={polygonLogo}>`) skal vaere klikbart og navigere til `/disc-test` (forsiden for medarbejdere) eller `/` (login, hvis ikke logget ind).

### Loesning
- Wrap logo-billedet i en `<button>` eller `<a>`-lignende element med `onClick={() => navigate("/disc-test")}`
- Anvend `cursor-pointer` styling
- Implementeres i baade `EmployeeDashboard.tsx` og `LeaderDashboard.tsx`

## 3. Udvid DISC-testen fra 5 til 24 spoergsmaal

Den nuvaerende test har kun 5 spoergsmaal, hvilket er alt for faa til en paalidelig DISC-profil. En typisk DISC-test har 24-28 scenariebaserede spoergsmaal.

### Nye spoergsmaal (24 i alt)
Baseret paa autentiske DISC-testformater udvides med spoergsmaal der daekker:

1. Hvordan griber du en ny opgave an?
2. Hvordan kommunikerer du bedst?
3. Hvordan reagerer du under pres?
4. Hvad motiverer dig mest?
5. Hvilken rolle tager du i et moede?
6. Hvordan haandterer du deadlines?
7. Hvad er din ledelsesstil?
8. Hvordan reagerer du naar et projekt er bagud?
9. Hvordan loeser du problemer?
10. Hvordan haandterer du kritik?
11. Hvordan traffer du beslutninger?
12. Hvordan reagerer du paa tilbageslag?
13. Hvordan arbejder du i et team?
14. Hvordan haandterer du stress?
15. Hvad er din tilgang til forandring?
16. Hvordan starter du en ny opgave?
17. Hvordan reagerer du paa konflikter?
18. Hvad driver dig til succes?
19. Hvordan haandterer du feedback?
20. Hvad er din tilgang til planlægning?
21. Hvordan prioriterer du opgaver?
22. Hvad beskriver din arbejdsmoral?
23. Hvordan laerer du nye faerdigheder?
24. Hvordan reagerer du paa pludselige aendringer?

### Filer der aendres

| Fil | Aendring |
|-----|---------|
| `src/lib/translations/da.ts` | Udvid `disc.questions` fra 5 til 24 spoergsmaal (dansk) |
| `src/lib/translations/en.ts` | Udvid til 24 spoergsmaal (engelsk) |
| `src/lib/translations/de.ts` | Udvid til 24 spoergsmaal (tysk) |
| `src/lib/translations/es.ts` | Udvid til 24 spoergsmaal (spansk) |
| `src/lib/translations/fr.ts` | Udvid til 24 spoergsmaal (fransk) |
| `src/lib/translations/nl.ts` | Udvid til 24 spoergsmaal (hollandsk) |
| `src/lib/translations/sv.ts` | Udvid til 24 spoergsmaal (svensk) |
| `src/lib/translations/no.ts` | Udvid til 24 spoergsmaal (norsk) |
| `src/lib/translations/fi.ts` | Udvid til 24 spoergsmaal (finsk) |
| `src/lib/disc-data.ts` | Opdater `discQuestions` til 24 spoergsmaal |
| `src/pages/EmployeeDashboard.tsx` | Mobil navbar fix + klikbart logo |
| `src/pages/LeaderDashboard.tsx` | Mobil navbar fix + klikbart logo |

### Scoring
Med 24 spoergsmaal faar hvert DISC-bogstav en score fra 0-24 (i stedet for 0-5), hvilket giver en langt mere nuanceret profil. `calculatePrimaryStyle()` i `disc-data.ts` virker allerede korrekt med variabelt antal spoergsmaal.

