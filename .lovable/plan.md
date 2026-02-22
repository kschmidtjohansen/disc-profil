
# Plan: Dashboard UI-forbedringer

## 1. Gør "Prae-godkend medarbejdere" sektionen minimerbar
- Wrap kortet i en Collapsible-komponent (allerede tilgaengelig via shadcn/ui)
- Tilfoej en ChevronDown/ChevronUp-ikon i kortets header som toggle
- Sektionen starter minimeret (collapsed) som standard

## 2. DiSC Profil badges med farver
- Give badge'et farver baseret paa DiSC-profilen:
  - D (rod): `bg-red-50 text-red-700 border-red-400`
  - I (gul): `bg-yellow-50 text-yellow-700 border-yellow-400`
  - S (groen): `bg-green-50 text-green-700 border-green-400`
  - C (blaa): `bg-blue-50 text-blue-700 border-blue-400`

## 3. Erstat knaptekst med ikoner + tooltip
- "Fuld Rapport" (Download): Vis kun `Download`-ikonet, tooltip viser teksten
- "Goer til leder/medarbejder" (ShieldCheck): Vis kun `ShieldCheck`-ikonet, tooltip viser teksten
- "Slet" (Trash2): Vis kun `Trash2`-ikonet, tooltip viser teksten
- Brug `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` fra shadcn/ui

## Tekniske detaljer

### Fil: `src/pages/LeaderDashboard.tsx`

**Imports tilfoej:**
- `Collapsible, CollapsibleTrigger, CollapsibleContent` fra `@/components/ui/collapsible`
- `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` fra `@/components/ui/tooltip`
- `ChevronRight` ikon fra lucide-react

**Prae-godkend sektion (linje 322-347):**
- Tilfoej state: `const [preApproveOpen, setPreApproveOpen] = useState(false)`
- Wrap Card-indholdet i Collapsible med open/onOpenChange
- Header bliver CollapsibleTrigger med roterende chevron-ikon
- CardContent bliver CollapsibleContent

**DiSC Profil badge (linje 391-398):**
- Tilfoej en farve-map baseret paa `style` variablen (allerede beregnet paa linje 380)
- Anvend den korrekte farveklasse paa Badge

**Action-knapper (linje 417-443):**
- Wrap hele TableCell i `TooltipProvider`
- Hver knap: fjern `<span>` teksten, wrap i Tooltip med TooltipContent der viser teksten
- Fjern `mr-1` fra ikoner da der ikke laengere er tekst ved siden af
