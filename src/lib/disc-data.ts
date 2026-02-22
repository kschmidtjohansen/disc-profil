export const discQuestions = [
  {
    id: 1,
    question: "Hvordan griber du oftest en ny opgave an?",
    options: [
      { label: "Jeg kaster mig ud i det og vil gerne se hurtige resultater.", style: "D" as const },
      { label: "Jeg samler teamet for at brainstorme og skabe begejstring om idéen.", style: "I" as const },
      { label: "Jeg foretrækker at få en klar plan og vide, hvad der forventes af mig, før jeg starter.", style: "S" as const },
      { label: "Jeg undersøger alle detaljer og data grundigt, så jeg er sikker på, det bliver gjort korrekt.", style: "C" as const },
    ],
  },
  {
    id: 2,
    question: "Hvordan kommunikerer du bedst?",
    options: [
      { label: "Direkte og til sagen – jeg kan godt lide korte beskeder uden omsvøb.", style: "D" as const },
      { label: "Åbent og snakkende – jeg foretrækker en uformel samtale med plads til humor.", style: "I" as const },
      { label: "Roligt og lyttende – jeg vil gerne sikre, at alle i teamet bliver hørt.", style: "S" as const },
      { label: "Skriftligt og præcist – jeg kan lide at have fakta og detaljer på skrift.", style: "C" as const },
    ],
  },
  {
    id: 3,
    question: "Hvordan reagerer du under pres eller stress?",
    options: [
      { label: "Jeg bliver utålmodig og forsøger at tage styringen for at tvinge en løsning igennem.", style: "D" as const },
      { label: "Jeg kan blive følelsesladet eller uorganiseret, men prøver at tale mig ud af det.", style: "I" as const },
      { label: "Jeg trækker mig lidt tilbage og forsøger at undgå åben konflikt for at bevare husfreden.", style: "S" as const },
      { label: "Jeg bliver ekstra kritisk over for detaljer og kan overanalysere tingene.", style: "C" as const },
    ],
  },
  {
    id: 4,
    question: "Hvad motiverer dig mest i dit arbejde?",
    options: [
      { label: "At nå ambitiøse mål, vinde og få ansvar.", style: "D" as const },
      { label: "Social anerkendelse, sjov på arbejdspladsen og teamwork.", style: "I" as const },
      { label: "Tryghed, faste rammer og at kunne hjælpe mine kolleger.", style: "S" as const },
      { label: "At levere arbejde af højeste kvalitet og have tid til at fordybe mig.", style: "C" as const },
    ],
  },
  {
    id: 5,
    question: "Hvilken rolle påtager du dig typisk i et møde?",
    options: [
      { label: "Den, der skærer igennem og presser på for at træffe en beslutning.", style: "D" as const },
      { label: "Den, der holder stemningen oppe og kommer med kreative idéer.", style: "I" as const },
      { label: "Den, der mægler mellem folk og sørger for, vi er enige, før vi går videre.", style: "S" as const },
      { label: "Den, der stiller de kritiske spørgsmål og peger på de ting, vi mangler at undersøge.", style: "C" as const },
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
    traits: ["Tålmodig", "Pålidelig", "Empatisk", "Stabil", "Loyal"],
  },
  C: {
    title: "Kompetence (C)",
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
  const maxCount = Math.max(...Object.values(counts));
  const topStyles = Object.entries(counts)
    .filter(([, count]) => count === maxCount)
    .map(([style]) => style);
  return topStyles.join("/");
}
