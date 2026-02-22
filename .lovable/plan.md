

# Professionel DiSC-rapport med PDF-download

## Overblik
Den nuvaerende "Rapport"-knap genererer en simpel HTML-fil. Den erstattes med en professionel, flersiders PDF-rapport genereret direkte i browseren ved hjaelp af **jspdf** og **html2canvas**. Rapporten inkluderer et visuelt soejlediagram (recharts), detaljerede profilbeskrivelser og en lederguide.

---

## Hvad rapporten indeholder

### Side 1 -- Forside og oversigt
- **Header**: Polygon-logo, medarbejderens navn og dato
- **Visuelt diagram**: 4 soejler (BarChart fra recharts) der viser point-fordelingen pa tvaers af D, I, S og C -- beregnet ud fra medarbejderens svar (gemt i `disc_results.answers`)
- **"Din Primaere Profil"**: Profilnavn (f.eks. "Dominans (D)") med den generelle beskrivelse

### Side 2 -- Adfaerdsindsigter
- **Motivation**: Hvad driver denne person? (baseret pa svar fra sporgsmal 4)
- **Under pres**: Hvordan reagerer de pa stress? (baseret pa sporgsmal 3)
- **Kommunikation**: Bedste made at tale med dem pa (baseret pa sporgsmal 2)
- **Styrker** og **Udviklingsomrade**: Fra de eksisterende `discDescriptions`

### Side 3 -- Lederguide
- **"Gode rad til lederen"**: 3-4 konkrete bullet points tilpasset hver DiSC-profil
- **I Teamet**: Rollen i teamet fra `discDescriptions.teamRole`
- **Noegleegenskaber**: Badges med traits

---

## Tekniske detaljer

### Nye afhangigheder
- **jspdf** -- PDF-generering i browseren
- **html2canvas** -- Konverterer HTML/React-komponenter til billeder til PDF

### Nye filer

1. **`src/lib/disc-report-data.ts`** -- Ny fil med udvidede profiltekster:
   - `motivation` tekster per DiSC-type (fra sporgsmal 4-kontekst)
   - `underPressure` tekster per DiSC-type (fra sporgsmal 3-kontekst)
   - `communication` tekster per DiSC-type (fra sporgsmal 2-kontekst)
   - `leaderTips` -- 3-4 bullet points per DiSC-type med rad til lederen

2. **`src/components/DiscReportTemplate.tsx`** -- Skjult React-komponent der renderer hele rapporten som HTML:
   - Bruger Tailwind-klasser og Polygon-farver
   - Indeholder et `<BarChart>` fra recharts med D/I/S/C-point
   - Formateret som A4 (794x1123 px) med print-venligt layout
   - Sektioner: Header, Diagram, Profil, Motivation, Under pres, Kommunikation, Styrker, Udviklingsomrade, Lederguide, Noegleegenskaber

### AEndrede filer

3. **`src/pages/LeaderDashboard.tsx`**:
   - `fetchTeam()` udvides til ogsa at hente `answers` fra `disc_results`
   - `TeamMember` interface far et nyt `answers` felt
   - `downloadReport()` erstattes med ny funktion der:
     1. Beregner D/I/S/C point-fordeling fra `answers`
     2. Renderer `DiscReportTemplate` i et skjult DOM-element
     3. Bruger `html2canvas` til at fange indholdet
     4. Opretter PDF med `jspdf` og downloader den
   - Rapport-knappens tekst aendres til "Fuld Rapport"

4. **`src/lib/disc-data.ts`** -- Uaendret (eksisterende beskrivelser genbruges)

### Point-beregning til diagram
Medarbejderens `answers` (array af ["D","I","S","C",...]) taelles op:
```
{ D: 2, I: 1, S: 1, C: 1 }
```
Disse vaerdier vises som 4 soejler i rapporten (maks 5 point).

### PDF-generering (flow)
1. Leder klikker "Fuld Rapport"
2. `DiscReportTemplate` renderes i en skjult `<div>` med fixed A4-dimensioner
3. `html2canvas` tager et screenshot af komponenten
4. `jspdf` opretter en A4 PDF og indsaetter billedet
5. PDF downloades som `DiSC-rapport-[navn].pdf`
6. Den skjulte `<div>` fjernes

