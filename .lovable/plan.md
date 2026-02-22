

# User Approval Workflow

## Overview
Add an approval system so new users must be approved by a leader before accessing the DISC test. The first user (who becomes leader) is auto-approved. All subsequent users start as `pending_approval`.

## 1. Database Changes

### Add `status` column to `profiles` table
A new column `status` of type `text` with default `'pending_approval'`. Possible values: `pending_approval`, `approved`.

```sql
ALTER TABLE public.profiles ADD COLUMN status text NOT NULL DEFAULT 'pending_approval';
-- Set all existing profiles to approved (they already have access)
UPDATE public.profiles SET status = 'approved';
```

### Add RLS policy for profile updates (leaders can approve)
```sql
CREATE POLICY "Anyone can update profiles"
ON public.profiles FOR UPDATE
USING (true)
WITH CHECK (true);
```

### Add RLS policy for deleting profiles (leaders can reject)
```sql
CREATE POLICY "Anyone can delete profiles"
ON public.profiles FOR DELETE
USING (true);
```

Also need delete policies on `user_roles` and `disc_results` for cascade cleanup when rejecting a user:
```sql
CREATE POLICY "Anyone can delete user_roles"
ON public.user_roles FOR DELETE
USING (true);
```

## 2. Auth Context Update (`src/lib/auth-context.tsx`)

Add `status` field to User interface:
```typescript
interface User {
  id: string;
  full_name: string;
  role: "employee" | "leader";
  status: "pending_approval" | "approved";
}
```

## 3. Login Flow Changes (`src/pages/Login.tsx`)

**New user registration:**
- First user: status = `approved` (auto-approved, becomes leader)
- All other new users: status = `pending_approval`
- After creating profile, if status is `pending_approval`, show a waiting screen instead of navigating to the test

**Existing user login:**
- Fetch `status` from `profiles` table
- If `pending_approval`, show the waiting message
- If `approved`, proceed as normal

**Waiting screen:**
- Show a friendly card with: "Tak for din tilmelding, [Navn]. En leder skal godkende din adgang, for du kan tage DISC-testen."
- Include a "Check status" / refresh button and a logout button

## 4. Employee Dashboard Guard (`src/pages/EmployeeDashboard.tsx`)

- Add status check: if `user.status !== 'approved'`, redirect to `/pending` (or show inline waiting view)
- This prevents direct URL access to the test

## 5. New Pending Page (`src/pages/PendingApproval.tsx`)

A simple page showing the waiting message with:
- Polygon logo and branding
- Friendly message explaining approval is needed
- "Check again" button that re-fetches status from the database
- Logout button
- If status changes to `approved`, auto-redirect to `/disc-test`

## 6. Leader Dashboard Changes (`src/pages/LeaderDashboard.tsx`)

Add a new "Afventende godkendelser" section at the top of `<main>`, before the response rate card:

- Fetch profiles where `status = 'pending_approval'`
- Display as a Card with an alert/notification style
- Each pending user shown as a row with name + two buttons:
  - "Godkend" -- updates `profiles.status` to `approved`
  - "Afvis" -- deletes the profile row + associated `user_roles` row
- Section only shows when there are pending users
- After action, refresh the list

## 7. Route Update (`src/App.tsx`)

Add `/pending` route pointing to `PendingApproval` page.

## 8. Translation Updates (all 9 files)

New keys:
```typescript
approval: {
  pendingTitle: "Afventer godkendelse",
  pendingMessage: "Tak for din tilmelding, {name}. En leder skal godkende din adgang, før du kan tage DISC-testen. Du modtager besked her på siden, når du er godkendt.",
  checkStatus: "Tjek status",
  pendingApprovals: "Afventende godkendelser",
  approve: "Godkend",
  reject: "Afvis",
  approved: "Godkendt",
  rejected: "Afvist",
  approvedMessage: "{name} er nu godkendt.",
  rejectedMessage: "{name} er blevet afvist.",
  noPending: "Ingen afventende godkendelser.",
}
```

## Files

| File | Change |
|------|--------|
| **Database migration** | Add `status` column to `profiles`, update existing rows, add UPDATE/DELETE policies |
| `src/lib/auth-context.tsx` | Add `status` to User interface |
| `src/pages/PendingApproval.tsx` | **New file** -- waiting screen |
| `src/pages/Login.tsx` | Set status on registration, check status on login, redirect pending users |
| `src/pages/EmployeeDashboard.tsx` | Guard against unapproved users |
| `src/pages/LeaderDashboard.tsx` | Add pending approvals section |
| `src/App.tsx` | Add `/pending` route |
| `src/lib/translations/da.ts` | Add `approval` keys |
| `src/lib/translations/en.ts` | Add `approval` keys |
| `src/lib/translations/de.ts` | Add `approval` keys |
| `src/lib/translations/es.ts` | Add `approval` keys |
| `src/lib/translations/fr.ts` | Add `approval` keys |
| `src/lib/translations/nl.ts` | Add `approval` keys |
| `src/lib/translations/sv.ts` | Add `approval` keys |
| `src/lib/translations/no.ts` | Add `approval` keys |
| `src/lib/translations/fi.ts` | Add `approval` keys |

## Technical Details

### Login logic change
```typescript
// New user
const status = isFirst ? "approved" : "pending_approval";
const profile = await supabase.from("profiles").insert({ full_name, status }).select("id").single();

// Set user in context with status
setUser({ id, full_name, role, status });

// Navigation
if (status === "pending_approval") navigate("/pending");
else navigate(role === "leader" ? "/dashboard" : "/disc-test");
```

### Leader approve/reject
```typescript
// Approve
await supabase.from("profiles").update({ status: "approved" }).eq("id", userId);

// Reject
await supabase.from("user_roles").delete().eq("user_id", userId);
await supabase.from("profiles").delete().eq("id", userId);
```

### Pending page auto-check
The pending page will have a "Check status" button that re-queries the profile status. If approved, it updates the auth context and redirects.

