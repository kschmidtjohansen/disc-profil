

# Fix: Tildel rolle til eksisterende brugere uden rolle

## Problem
Kasper Schmidt Johansen er oprettet i `profiles`, men har ingen post i `user_roles`. Login-koden opretter kun en rolle naar en **ny** profil oprettes. Naar en eksisterende bruger logger ind uden rolle, fejler opslaget og brugeren faar en fejlmeddelelse.

## Loesning

### 1. Indsaet manglende rolle for Kasper (databasefix)
Kasper er den foerste bruger, saa han faar rollen "leader":

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('9c8e48b3-35a9-4736-aedb-41c27a95d7fc', 'leader');
```

### 2. Opdater login-flowet i `src/pages/Login.tsx`
Aendr logikken saa den ogsa haandterer eksisterende profiler **uden** rolle:

- Naar en eksisterende profil findes (linje 32-51), tjek om der allerede er en rolle
- Hvis **ingen rolle** findes, opret en med default "employee" (eller "leader" hvis det er den foerste bruger)
- Brug `.maybeSingle()` i stedet for `.single()` paa rolle-opslaget for at undgaa 406-fejlen

Konkret aendring i `handleLogin`:

```
// Efter at have fundet eksisterende profil:
if (existing) {
  profileId = existing.id;

  // Tjek om rolle mangler, og opret den hvis nødvendig
  const { data: existingRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", profileId)
    .maybeSingle();

  if (!existingRole) {
    const { data: countData } = await supabase.rpc("get_user_count");
    const isFirst = (countData ?? 0) === 1; // kun denne bruger
    await supabase.from("user_roles").insert({
      user_id: profileId,
      role: isFirst ? "leader" : "employee",
    });
  }
}
```

Og aendr det afsluttende rolle-opslag (linje 53-57) til at bruge `.maybeSingle()` i stedet for `.single()`.

### Filer der aendres
- **`src/pages/Login.tsx`** -- Opdater login-logik til at haandtere manglende roller
- **Database** -- Indsaet rolle for Kasper

