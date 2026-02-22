

# Opdatering af Design, Branding og PDF-beskrivelser

## Overblik
Appen opdateres til at matche Polygon-branding fra pdk12-ugeplan projektet, og PDF-rapporten udvides med detaljerede profilbeskrivelser.

---

## 1. Logo
- Polygon-logoet hentes fra `https://www.polygongroup.com/UI/build/svg/polygon-logo.svg`
- Logoet tilfojes i navigationsbjælken pa alle sider (Login, Employee, Leader)
- Pa login-siden erstatter logoet det nuvarende "D"-ikon

## 2. Farver (fra pdk12 CSS-variabler)
Alle CSS-variabler i `src/index.css` opdateres til Polygon-farverne:

| Variabel | Nuvarende | Ny vardi |
|----------|-----------|----------|
| --primary | 215 70% 22% (morkebla) | 197 100% 47% (Polygon-bla #00aeef) |
| --primary-foreground | 210 40% 98% | 0 0% 98% |
| --background | 210 30% 98% | 0 0% 100% (ren hvid) |
| --foreground | 215 50% 12% | 215 25% 27% |
| --border | 214 25% 88% | 220 13% 91% |
| --ring | 215 70% 22% | 197 100% 47% |
| --radius | 0.5rem | 0.75rem |
| --accent | 210 60% 40% | 210 40% 96% |
| (+ tilsvarende for card, muted, secondary, sidebar osv.) |

## 3. Typografi
- Fjern Playfair Display og brug kun **Inter** som i pdk12-projektet
- Tilfoej `font-sans` og `antialiased` til body
- Overskrifter (h1-h3) bruger Inter med `font-semibold tracking-tight` i stedet for serif

## 4. Komponent-stil
- Border-radius opdateres til 0.75rem (fra 0.5rem)
- Knapper far rundede hjorner med `rounded-xl`
- Cards far `shadow-lg rounded-xl` og en lettere kant
- Input-felter far `rounded-xl border-2` stil

## 5. Udvidede PDF-beskrivelser
`discDescriptions` i `src/lib/disc-data.ts` udvides med nye felter til den detaljerede rapport:

- **D**: Generel profil, styrker, udviklingsomrade, rolle i teamet (som angivet)
- **I**: Generel profil, styrker, udviklingsomrade, rolle i teamet
- **S**: Generel profil, styrker, udviklingsomrade, rolle i teamet
- **C**: Generel profil, styrker, udviklingsomrade, rolle i teamet (bemerk: C omdoebes til "Samvittighedsfuldhed" i rapporten)

Download-funktionen i `LeaderDashboard.tsx` opdateres til at inkludere de nye felter i HTML-rapporten med sektioner for Generel Profil, Styrker, Udviklingsomrade og I Teamet.

---

## Tekniske detaljer

### Filer der andres:

1. **`src/index.css`** -- Alle CSS-variabler erstattes med pdk12-vardier, typografi opdateres til Inter-only
2. **`src/lib/disc-data.ts`** -- `discDescriptions` udvides med `generalProfile`, `strengths`, `developmentArea`, `teamRole` felter
3. **`src/pages/Login.tsx`** -- Polygon-logo erstatter D-ikonet, opdaterede komponent-stile
4. **`src/pages/EmployeeDashboard.tsx`** -- Logo i header, fjern Playfair Display inline-stil
5. **`src/pages/LeaderDashboard.tsx`** -- Logo i header, fjern Playfair Display, udvid HTML-rapport med nye beskrivelser
6. **`index.html`** -- Opdater font-link til kun Inter (fjern Playfair Display), opdater titel
7. **`tailwind.config.ts`** -- Tilfoej `fontFamily: { sans: ['Inter', ...] }` til theme

