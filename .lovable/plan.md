

# DiSC Profilerings-app – Implementeringsplan

## Overblik
En intern webapp til DiSC-profilering af et team på 16 medarbejdere. Appen er fuldt på dansk med et professionelt, corporate design i dybe blå- og hvidetoner.

---

## 1. Backend (Supabase Cloud)
- **Tabel: `profiles`** – id, user_id, full_name, created_at
- **Tabel: `user_roles`** – user_id, role (enum: 'employee', 'leader'). Første bruger får automatisk 'leader'-rollen
- **Tabel: `disc_results`** – user_id, answers (JSON), primary_style (D/I/S/C), completed_at
- **RLS-politikker**: Medarbejdere kan kun se egne resultater. Ledere kan se alle
- **Simpel login**: Brugere logger ind med fuldt navn (ingen adgangskode) – opslag i profiles-tabellen, eller oprettelse hvis ny

## 2. Login-side
- Simpelt, rent input-felt: "Indtast dit fulde navn"
- Ved login: Tjek om navnet findes → log ind. Ellers → opret ny bruger med 'employee'-rolle (eller 'leader' hvis første bruger)
- Redirect baseret på rolle: Employee → medarbejder-dashboard, Leader → leder-dashboard

## 3. Medarbejder-visning
- **Velkomstside** med brugerens navn og status (test taget/ej taget)
- **"Start DiSC Profil"-knap** hvis testen ikke er taget
- **Spørgeskema**: 5 spørgsmål med 4 svarmuligheder hver (D, I, S, C)
- **Resultatberegning**: Tæl svar og find den primære DiSC-stil
- **Færdigskærm**: Viser brugerens DiSC-type med kort beskrivelse. Ingen adgang til andres resultater
- **Log ud-knap**

## 4. Leder-dashboard
- **Svarprocent**: Kort/progress bar der viser "X/16 har gennemført" med procenttal
- **Teamoversigt**: Datatabel med alle registrerede brugere – navn, rolle, DiSC-resultat (eller "Afventer")
- **Rollestyring**: Knap i tabellen til at opgradere en medarbejder til leder
- **Download rapport**: Knap per færdiggjort medarbejder – genererer en printbar/PDF-visning med navn og DiSC-profilbeskrivelse
- **Log ud-knap**

## 5. Design & UI
- Dybt blåt og hvidt corporate farveskema
- Alle tekster på dansk
- Responsiv datatabel med shadcn/ui-komponenter
- Rent, professionelt layout med god whitespace

