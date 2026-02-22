

# Omdoeb "DiSC Profilering" til "DISC Profil" + tilfoej navigation-dropdown

## 1. Omdoebning i hele projektet

Alle forekomster af "DiSC Profilering" erstattes med "DISC Profil":

| Fil | Hvad aendres |
|-----|-------------|
| `index.html` | Title og og:title tags |
| `src/pages/Login.tsx` | CardTitle |
| `src/pages/EmployeeDashboard.tsx` | Header-tekst (3 steder: test-view, result-view, welcome-view) |
| `src/pages/LeaderDashboard.tsx` | Header-tekst ("DiSC Profilering -- Leder" bliver "DISC Profil -- Leder") |
| `src/components/DiscReportTemplate.tsx` | Footer-tekst i rapporten |

## 2. Navigation-dropdown i headeren

En lille dropdown tilfojes i headeren pa baade EmployeeDashboard og LeaderDashboard, sa brugeren kan skifte mellem `/employee` og `/leader`.

### Implementering
- Brug den eksisterende `DropdownMenu` komponent fra `@radix-ui/react-dropdown-menu`
- Placeres ved siden af "DISC Profil" teksten i headeren
- Dropdown-indhold:
  - **Medarbejder** (linker til `/employee`)
  - **Leder** (linker til `/leader`)
- Den aktive side markeres visuelt (f.eks. med et check-ikon)
- Bruger et lille `ChevronDown`-ikon som trigger

### Teknisk detalje
- Begge dashboards importerer `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` fra UI-komponenterne
- `useNavigate` bruges til at navigere ved klik
- Dropdown-triggeren er header-teksten "DISC Profil" med et chevron-ikon
- Fjerner den automatiske redirect baseret pa rolle i `useEffect`, sa brugeren faktisk kan tilga begge sider

### Filer der aendres
- `src/pages/EmployeeDashboard.tsx`
- `src/pages/LeaderDashboard.tsx`
- `src/pages/Login.tsx`
- `src/components/DiscReportTemplate.tsx`
- `index.html`

