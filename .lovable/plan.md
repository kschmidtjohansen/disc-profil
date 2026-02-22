

# Fix Authentication, Routing & Database Security

## Overview
Address security loopholes, routing gaps, and database integrity issues found in the audit. The name-based auth is inherently client-side, but we can tighten route guards and fix database issues.

## Changes

### 1. Add `status` check to all leader pages
LeaderDashboard, TeamOverview, and TeamAnalyzer currently only check `user.role === "leader"` but not `user.status === "approved"`. Add status check to all three.

**Files:** `src/pages/LeaderDashboard.tsx`, `src/pages/TeamOverview.tsx`, `src/pages/TeamAnalyzer.tsx`

```typescript
// Change from:
if (user.role !== "leader") { ... }

// To:
if (user.status !== "approved" || user.role !== "leader") { ... }
```

### 2. Add CASCADE delete for disc_results
Currently deleting a profile fails if the user has disc_results (foreign key constraint). Add `ON DELETE CASCADE` to the `disc_results_user_id_fkey` foreign key.

**Database migration:**
```sql
ALTER TABLE public.disc_results
  DROP CONSTRAINT disc_results_user_id_fkey,
  ADD CONSTRAINT disc_results_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

Also add CASCADE to user_roles:
```sql
ALTER TABLE public.user_roles
  DROP CONSTRAINT user_roles_user_id_fkey,
  ADD CONSTRAINT user_roles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

With CASCADE in place, the leader's reject/delete handler only needs to delete the profile -- roles and results are cleaned up automatically. Simplify `handleReject` and `handleDeleteMember` accordingly.

### 3. Allow disc_results UPDATE (for test retake)
Add an RLS policy so employees can retake the test (upsert instead of duplicate insert).

**Database migration:**
```sql
CREATE POLICY "Anyone can update disc results"
ON public.disc_results FOR UPDATE
USING (true)
WITH CHECK (true);
```

### 4. Fix EmployeeDashboard to upsert on retake
Change `handleSubmit` from INSERT to UPSERT so retaking the test updates the existing row.

**File:** `src/pages/EmployeeDashboard.tsx`

```typescript
// Change from:
await supabase.from("disc_results").insert({...});

// To:
await supabase.from("disc_results").upsert({
  user_id: user.id,
  answers: answers,
  primary_style: primaryStyle,
  completed_at: new Date().toISOString(),
}, { onConflict: "user_id" });
```

### 5. Fix PendingApproval navigation logic
Move the redirect logic into `useEffect` instead of running it during render to avoid React warnings.

**File:** `src/pages/PendingApproval.tsx`

## Files to modify

| File | Change |
|------|--------|
| Database migration | CASCADE on foreign keys, UPDATE policy on disc_results |
| `src/pages/LeaderDashboard.tsx` | Add status check, simplify delete to profile-only |
| `src/pages/TeamOverview.tsx` | Add status check to guard |
| `src/pages/TeamAnalyzer.tsx` | Add status check to guard |
| `src/pages/EmployeeDashboard.tsx` | Change insert to upsert for retake |
| `src/pages/PendingApproval.tsx` | Move redirects into useEffect |

## Technical Details

### Simplified delete handler (after CASCADE)
```typescript
const handleReject = async (userId: string, name: string) => {
  // CASCADE handles user_roles and disc_results automatically
  await supabase.from("profiles").delete().eq("id", userId);
  toast({ title: t.approval.rejected, description: t.approval.rejectedMessage.replace("{name}", name) });
  fetchPending();
  fetchTeam();
};
```

### PendingApproval useEffect fix
```typescript
useEffect(() => {
  if (!user) { navigate("/"); return; }
  if (user.status === "approved") {
    navigate(user.role === "leader" ? "/dashboard" : "/disc-test");
  }
}, [user, navigate]);
```

### Security note
The name-based auth stores user identity in localStorage, which is inherently manipulable. This is acceptable per the project requirements (internal tool for 16 known employees, no passwords). True server-side protection would require Supabase Auth sessions, which is out of scope for this project.
