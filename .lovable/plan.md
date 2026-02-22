

# Opdatering af DiSC-spørgsmål og beregningslogik

## Hvad ændres

### 1. Nye spørgsmål og svarmuligheder
De nuværende 5 dummy-spørgsmål i `src/lib/disc-data.ts` erstattes med de 5 klassiske DiSC-spørgsmål du har angivet, med de korrekte danske tekster og DiSC-type-mapping (D, I, S, C).

### 2. Forbedret beregningslogik
Den nuværende logik vælger blot den type med flest point. Den opdateres til også at håndtere pointlighed -- ved uafgjort vises begge typer med skråstreg (f.eks. "D/I").

### 3. Opdaterede profilbeskrivelser
Beskrivelserne for hver DiSC-type opdateres, så de matcher de nye spørgsmåls kontekst (f.eks. "Kompetence" i stedet for "Samvittighedsfuldhed" for C-typen).

---

## Tekniske detaljer

Kun filen `src/lib/disc-data.ts` skal ændres:

- **discQuestions**: Alle 5 spørgsmål og deres 4 svarmuligheder udskiftes med de nye tekster.
- **calculatePrimaryStyle**: Funktionen opdateres til at returnere f.eks. "D/I" ved pointlighed i stedet for bare det første bogstav.
- **discDescriptions**: C-typens titel ændres til "Kompetence (C)" og beskrivelserne finpudses.

Ingen ændringer til database, routing eller andre komponenter -- EmployeeDashboard bruger allerede disse data korrekt.

