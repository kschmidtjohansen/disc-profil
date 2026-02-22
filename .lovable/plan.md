

# Opdatering af rapport-tekster fra tabel

## Hvad aendres

Filen `src/lib/disc-report-data.ts` opdateres med de nye, kortere tekster fra din tabel for tre felter: **motivation**, **communication** og **leaderTips**. Feltet **underPressure** beholdes som det er, da det ikke er med i tabellen.

## De nye tekster

| Profil | Motivation | Kommunikation | Ledelsesrad |
|--------|-----------|---------------|-------------|
| D | Udfordringer, magt til at beslutte og hurtige resultater. | Vaer direkte, hold dig til fakta, og undga for meget "smalltalk". | Giv dem ansvar, saet klare mal, og lad dem finde vejen dertil selv. |
| I | Social anerkendelse, begejstring og frihed fra rutiner. | Vaer entusiastisk, giv plads til humor og fokuser pa det positive. | Anerkend deres indsats offentligt, og hjaelp dem med at holde strukturen. |
| S | Tryghed, faste rammer og tid til at hjaelpe andre. | Vaer talmodig, tal roligt, og giv dem tid til at taenke sig om. | Giv dem tryghed i forandringer, og vaer tydelig omkring forventningerne. |
| C | Kvalitet, praecision og logisk argumentation. | Vaer detaljeret, brug data, og undga at vaere for personlig/folelsesladet. | Giv dem tid til fordybelse, og respekter deres behov for ordentlighed. |

## Tekniske detaljer

### Fil der aendres: `src/lib/disc-report-data.ts`

- **motivation**: Erstattes med de nye korte tekster for D, I, S, C
- **communication**: Erstattes med de nye korte tekster for D, I, S, C
- **leaderTips**: Hvert array reduceres til en enkelt rad (fra 4 til 1), da tabellen kun har et ledelsesrad per profil
- **underPressure**: Beholdes uaendret (ikke inkluderet i tabellen)

Ingen andre filer aendres -- `DiscReportTemplate.tsx` og `LeaderDashboard.tsx` bruger allerede disse felter korrekt.

