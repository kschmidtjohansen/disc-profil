

# Pre-approve Employees (Whitelist)

## Overview
Add a whitelist feature so leaders can pre-register employee names. These names get created in the database as `approved` profiles with `employee` role, so when they log in by name they get immediate access without waiting for approval.

## Changes

### 1. Leader Dashboard -- "Praegodkend medarbejdere" section
In `src/pages/LeaderDashboard.tsx`, add a new Card after the pending approvals section:

- A `Textarea` input where the leader can enter one or more full names (one per line)
- A "Tilfoej" button that processes the names:
  - For each name, check if a profile with that `full_name` already exists
  - If not, create a new profile with `status: 'approved'` and a `user_roles` entry with `role: 'employee'`
  - If already exists, skip with a toast notification
- Show a success toast with how many names were added
- Refresh the team list after adding

### 2. Login flow -- already works correctly
The current Login.tsx already handles this scenario perfectly:
- When a user enters a name that exists with `status: 'approved'`, they get logged in and sent to `/disc-test`
- When a name doesn't exist, they get `pending_approval` status
- No changes needed to login logic

### 3. Leader Dashboard team table -- delete pre-approved users
Add a delete/trash button for team members who have NOT completed the test (no `primary_style`). This lets leaders remove incorrectly typed pre-approved names. The button deletes the profile and user_roles entries.

### 4. Team table -- show "Praegodkendt" status
In the Status column of the Leader Dashboard team table:
- If `primary_style` exists and fresh: show green "Opdateret" badge (already works)
- If `primary_style` exists and stale: show amber "Traenger til opfoelgning" badge (already works)
- If NO `primary_style` (pre-approved but hasn't taken test): show a blue "Praegodkendt" badge

### 5. Translation updates
Add new keys to all 9 translation files:

| Key | Danish | English |
|-----|--------|---------|
| `leader.preApprove` | "Praegodkend medarbejdere" | "Pre-approve employees" |
| `leader.preApproveDesc` | "Indtast fulde navne (et pr. linje)" | "Enter full names (one per line)" |
| `leader.preApproveAdd` | "Tilfoej" | "Add" |
| `leader.preApproveAdded` | "{count} medarbejder(e) tilfojet" | "{count} employee(s) added" |
| `leader.preApproveExists` | "{name} findes allerede" | "{name} already exists" |
| `leader.statusPreApproved` | "Praegodkendt" | "Pre-approved" |
| `leader.deleteConfirm` | "Slet {name}?" | "Delete {name}?" |
| `leader.deleted` | "{name} er slettet" | "{name} has been deleted" |

## Files to modify

| File | Change |
|------|--------|
| `src/pages/LeaderDashboard.tsx` | Add pre-approve section, delete button, pre-approved badge |
| `src/lib/translations/da.ts` | Add whitelist keys |
| `src/lib/translations/en.ts` | Add whitelist keys |
| `src/lib/translations/de.ts` | Add whitelist keys |
| `src/lib/translations/es.ts` | Add whitelist keys |
| `src/lib/translations/fr.ts` | Add whitelist keys |
| `src/lib/translations/nl.ts` | Add whitelist keys |
| `src/lib/translations/sv.ts` | Add whitelist keys |
| `src/lib/translations/no.ts` | Add whitelist keys |
| `src/lib/translations/fi.ts` | Add whitelist keys |

No database changes needed -- existing `profiles` and `user_roles` tables support this already.

## Technical Details

### Pre-approve logic
```typescript
const handlePreApprove = async (names: string[]) => {
  let added = 0;
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    
    // Check if already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("full_name", trimmed)
      .maybeSingle();
    
    if (existing) {
      toast({ description: t.leader.preApproveExists.replace("{name}", trimmed) });
      continue;
    }
    
    // Create approved profile + employee role
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({ full_name: trimmed, status: "approved" } as any)
      .select("id")
      .single();
    
    if (newProfile) {
      await supabase.from("user_roles").insert({
        user_id: newProfile.id,
        role: "employee",
      });
      added++;
    }
  }
  // Show success toast with count, refresh team list
};
```

### Delete pre-approved user
```typescript
const handleDeleteMember = async (member: TeamMember) => {
  await supabase.from("user_roles").delete().eq("user_id", member.id);
  await supabase.from("profiles").delete().eq("id", member.id);
  toast({ title: t.leader.deleted.replace("{name}", member.full_name) });
  fetchTeam();
};
```

### Status badge in team table
```typescript
// In the Status column cell:
{member.primary_style ? (
  isStale ? (
    <Badge>/* amber stale badge */</Badge>
  ) : (
    <Badge>/* green current badge */</Badge>
  )
) : (
  <Badge className="border-blue-400 bg-blue-50 text-blue-700">
    {t.leader.statusPreApproved}
  </Badge>
)}
```

