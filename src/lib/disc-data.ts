export const discQuestions = [
  {
    id: 1,
    question: "Når du står over for en udfordring, hvad gør du typisk?",
    options: [
      { label: "Tager styringen og handler hurtigt", style: "D" as const },
      { label: "Involverer andre og skaber entusiasme", style: "I" as const },
      { label: "Analyserer situationen roligt og grundigt", style: "S" as const },
      { label: "Laver en detaljeret plan før handling", style: "C" as const },
    ],
  },
  {
    id: 2,
    question: "Hvad motiverer dig mest i dit arbejde?",
    options: [
      { label: "At opnå resultater og nå mål", style: "D" as const },
      { label: "At samarbejde og inspirere kolleger", style: "I" as const },
      { label: "At skabe stabilitet og harmoni i teamet", style: "S" as const },
      { label: "At sikre kvalitet og præcision", style: "C" as const },
    ],
  },
  {
    id: 3,
    question: "Hvordan kommunikerer du bedst?",
    options: [
      { label: "Direkte og konkret", style: "D" as const },
      { label: "Engagerende og optimistisk", style: "I" as const },
      { label: "Lyttende og tålmodig", style: "S" as const },
      { label: "Præcis og faktabaseret", style: "C" as const },
    ],
  },
  {
    id: 4,
    question: "Hvad er din største styrke i et team?",
    options: [
      { label: "At drive projekter fremad", style: "D" as const },
      { label: "At motivere og engagere teamet", style: "I" as const },
      { label: "At være en pålidelig og stabil støtte", style: "S" as const },
      { label: "At sikre høj kvalitet og nøjagtighed", style: "C" as const },
    ],
  },
  {
    id: 5,
    question: "Hvordan håndterer du konflikter?",
    options: [
      { label: "Tager fat om problemet med det samme", style: "D" as const },
      { label: "Forsøger at finde en løsning alle er glade for", style: "I" as const },
      { label: "Lytter til alle parter og søger kompromis", style: "S" as const },
      { label: "Analyserer fakta og finder den logiske løsning", style: "C" as const },
    ],
  },
];

export const discDescriptions: Record<string, { title: string; description: string; traits: string[] }> = {
  D: {
    title: "Dominans (D)",
    description:
      "Du er resultatorienteret, beslutsom og elsker udfordringer. Du trives med at tage styringen og drive projekter fremad. Du er direkte i din kommunikation og fokuserer på bundlinjen.",
    traits: ["Beslutsom", "Resultatorienteret", "Direkte", "Konkurrenceminded", "Handlekraftig"],
  },
  I: {
    title: "Indflydelse (I)",
    description:
      "Du er entusiastisk, optimistisk og elsker at samarbejde med andre. Du motiverer teamet og skaber en positiv atmosfære. Du er god til at kommunikere og inspirere.",
    traits: ["Entusiastisk", "Optimistisk", "Samarbejdende", "Kreativ", "Inspirerende"],
  },
  S: {
    title: "Stabilitet (S)",
    description:
      "Du er tålmodig, pålidelig og værdsætter harmoni. Du er en stabil støtte for dit team og trives med forudsigelighed og klare rammer. Du lytter godt og er empatisk.",
    traits: ["Tålmodig", "Pålidelig", "Empatisk", "Stabil", "Loyalt"],
  },
  C: {
    title: "Samvittighedsfuldhed (C)",
    description:
      "Du er analytisk, præcis og kvalitetsbevidst. Du sætter høje standarder og er grundig i dit arbejde. Du foretrækker fakta og logik i din beslutningstagning.",
    traits: ["Analytisk", "Præcis", "Kvalitetsbevidst", "Systematisk", "Grundig"],
  },
};

export function calculatePrimaryStyle(answers: string[]): string {
  const counts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };
  answers.forEach((a) => {
    if (counts[a] !== undefined) counts[a]++;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
