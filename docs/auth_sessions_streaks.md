# Auth, Sessions, and Streaks (Implementation Notes)

## Auth Flow (Next.js + Supabase)
1. User clicks "Sign in with Google".
2. Supabase OAuth completes, user is redirected back to app.
3. On first login, a `profiles` row is created by the `handle_new_user` trigger.
4. App fetches `profiles` for current user to determine language and admin status.

## Session Completion Flow
On routine completion:
1. Compute user's local date: `completedLocalDate` (YYYY-MM-DD).
2. Insert a `sessions` row:
   - `user_id`
   - `routine_id`
   - `completed_local_date` (local date)
   - `duration_minutes`
3. Call `update_streak(user_id, completedLocalDate)` RPC.
4. Update UI with new `streaks` row returned from RPC.

## Streak Logic (Local Date)
- If `last_completed_date` == `completedLocalDate`: no change.
- If `last_completed_date` == yesterday: increment.
- Else: reset to 1.

## Calendar Data Model
- Query `sessions` for the current month by `completed_local_date`.
- Group days with at least one session.
- UI highlights completed days; optional popover shows routine name and duration.

## Suggested Queries
- Month view sessions:
  - `select completed_local_date, routine_id, duration_minutes from sessions where user_id = :uid and completed_local_date between :start and :end;`
- Streaks:
  - `select current_streak, longest_streak, last_completed_date from streaks where user_id = :uid;`

## Admin
- Set admin by updating `profiles.is_admin = true` in Supabase.
