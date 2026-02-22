# Tre aendringer: URL-omdoebning, flersproget support og rollebaseret adgang

## 1. URL-aendringer

Ruterne aendres i `src/App.tsx`:

- `/employee` bliver til `/disc-test` (DISC-testen)
- `/leader` forbliver `/dashboard` (dashboard)

Alle `navigate()`-kald og dropdown-links opdateres i:

- `src/App.tsx` (Routes)
- `src/pages/Login.tsx` (redirect efter login)
- `src/pages/EmployeeDashboard.tsx` (NavDropdown + navigate)
- `src/pages/LeaderDashboard.tsx` (NavDropdown + navigate + role toggle redirect)

## 2. Flersproget support (i18n)

### Understottede sprog

Dansk (da), Tysk (de), Engelsk (en), Spansk (es), Fransk (fr), Hollandsk (nl), Svensk (sv), Norsk (no), Finsk (fi)

### Arkitektur

- Ny fil `src/lib/i18n.ts` med en React context der holder det valgte sprog
- Ny fil `src/lib/translations/` mappe med en fil per sprog (da.ts, en.ts, de.ts osv.)
- Hvert sprogobjekt indeholder alle UI-tekster: login, navigation, spoergsmaal, resultater, rapport-labels osv.
- En `useTranslation()` hook returnerer det aktive sprogs tekster
- Standardsprog: Dansk

### Sprogvaelger

- En lille dropdown (flag/sprogkode) i headeren pa alle sider
- Gemmes i localStorage sa valget huskes
- Placeres ved siden af brugerens navn i headeren

### Filer der oprettes


| Fil                          | Indhold                                               |
| ---------------------------- | ----------------------------------------------------- |
| `src/lib/i18n.tsx`           | I18nProvider context, useTranslation hook, sprogtypes |
| `src/lib/translations/da.ts` | Dansk (nuvaerende tekster)                            |
| `src/lib/translations/en.ts` | Engelsk                                               |
| `src/lib/translations/de.ts` | Tysk                                                  |
| `src/lib/translations/es.ts` | Spansk                                                |
| `src/lib/translations/fr.ts` | Fransk                                                |
| `src/lib/translations/nl.ts` | Hollandsk                                             |
| `src/lib/translations/sv.ts` | Svensk                                                |
| `src/lib/translations/no.ts` | Norsk                                                 |
| `src/lib/translations/fi.ts` | Finsk                                                 |


### Filer der aendres

- `src/App.tsx` -- wrap med I18nProvider
- `src/pages/Login.tsx` -- brug t() for tekster + sprogvaelger
- `src/pages/EmployeeDashboard.tsx` -- brug t() for alle tekster inkl. spoergsmaal
- `src/pages/LeaderDashboard.tsx` -- brug t() for alle tekster
- `src/components/DiscReportTemplate.tsx` -- brug t() for rapport-labels
- `src/lib/disc-data.ts` -- spoergsmaal og beskrivelser flyttes ind i oversaettelsesfilerne
- `src/lib/disc-report-data.ts` -- rapport-tekster flyttes ind i oversaettelsesfilerne

### Oversaettelsesstruktur (eksempel)

```typescript
{
  common: {
    login: "Log ind",
    logout: "Log ud",
    loading: "Indlaeser...",
    employee: "Medarbejder",
    leader: "Leder",
    discProfile: "DISC Profil",
    // ...
  },
  login: {
    title: "DISC Profil",
    subtitle: "Indtast dit fulde navn...",
    placeholder: "Indtast dit fulde navn",
    button: "Log ind",
    buttonLoading: "Logger ind...",
    // ...
  },
  test: {
    questionOf: "Spoergsmaal {current} af {total}",
    chooseAnswer: "Vaelg det svar, der passer dig bedst",
    back: "Tilbage",
    next: "Naeste",
    submit: "Indsend svar",
    // ...
  },
  disc: {
    questions: [...], // Alle 5 spoergsmaal med options
    descriptions: { D: {...}, I: {...}, S: {...}, C: {...} },
    reportData: { D: {...}, I: {...}, S: {...}, C: {...} },
  },
  // ...
}
```

## 3. Rollebaseret adgang til /leader

### Implementering

- I `LeaderDashboard.tsx`: tjek `user.role` i useEffect
- Hvis brugeren ikke er "leader", redirect til `/disc-test` med en toast-besked
- NavDropdown i `EmployeeDashboard` viser kun "Leder"-linket hvis brugeren har rollen "leader"

### Tekniske detaljer

I `LeaderDashboard.tsx`:

```typescript
useEffect(() => {
  if (!user) { navigate("/"); return; }
  if (user.role !== "leader") {
    toast({ title: t('common.accessDenied'), description: t('common.leaderOnly') });
    navigate("/employees");
    return;
  }
  fetchTeam();
}, [user, navigate]);
```

I `EmployeeDashboard.tsx` NavDropdown:

```typescript
// Vis kun Leder-linket hvis brugeren er leder
{user?.role === "leader" && (
  <DropdownMenuItem onClick={() => navigate("/leader")}>
    ...Leder
  </DropdownMenuItem>
)}
```

## Samlet aendringsoversigt


| Fil                                     | Type         | Aendring                                     |
| --------------------------------------- | ------------ | -------------------------------------------- |
| `src/lib/i18n.tsx`                      | Ny           | Context + hook for i18n                      |
| `src/lib/translations/*.ts`             | Ny (9 filer) | Oversaettelser for hvert sprog               |
| `src/App.tsx`                           | AEndret      | Nye URL'er + I18nProvider                    |
| `src/pages/Login.tsx`                   | AEndret      | i18n + sprogvaelger + ny URL                 |
| `src/pages/EmployeeDashboard.tsx`       | AEndret      | i18n + ny URL + rolletjek i dropdown         |
| `src/pages/LeaderDashboard.tsx`         | AEndret      | i18n + ny URL + adgangskontrol               |
| `src/components/DiscReportTemplate.tsx` | AEndret      | i18n for rapport-labels                      |
| `src/lib/disc-data.ts`                  | AEndret      | Forenklet (tekster flyttes til translations) |
| `src/lib/disc-report-data.ts`           | AEndret      | Forenklet (tekster flyttes til translations) |
