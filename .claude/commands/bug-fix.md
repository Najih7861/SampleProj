---
description: Fix a bug with the least risky, minimal change (branch- and history-aware; prefer new code over fragile edits)
argument-hint: <bug description or failing behavior>
---

You are fixing a bug: **$ARGUMENTS**

Follow the repo's "isolation by design" rules in `CLAUDE.md`. The objective is to get the build/app **green with the minimal, lowest-risk change** — never a fix that trades one breakage for another.

## Step 1 — Reproduce & locate
- Reproduce the failure (run the relevant build/app path) and capture the exact error.
- Find the root cause, not just the symptom.

## Step 2 — Review branches and history BEFORE editing
- `git branch -a` then `git fetch --all`.
- For each other branch: `git --no-pager diff --stat main...<branch>` and `git --no-pager log --oneline main..<branch>` — identify any branch that touches the suspect code. Treat those files/symbols as a **hot set** (avoid modifying them).
- `git --no-pager log --oneline -n 20 -- <suspect files>` and `git --no-pager blame` the suspect lines — understand *why* the code is the way it is before changing it. The current behavior may be load-bearing for something else.

## Step 3 — Choose the safest fix
- Make the **minimal** change required to make the code green.
- **Critical rule:** if editing the existing code in place would crash another part of the application, or would itself require a follow-up fix elsewhere (a cascading fix), do **NOT** modify that code path. Instead:
  - Add a **new function** that handles the case correctly, or
  - Add a **guarding condition** for the specific scenario,
  - and keep that **new logic in a new file** wherever practical.
- Do **not** move, rename, or delete any symbol that other code or other branches depend on.
- The fix must not change behavior for any case that currently works.

## Step 4 — Verify
- Build/typecheck both affected projects (`dotnet build`; `npm run build`) — confirm green.
- Re-run the reproduction from Step 1 and confirm it now passes.
- Sanity-check the previously-working paths near the change still behave correctly.
- Show `git --no-pager diff --stat`; confirm the change is minimal and avoids the hot set.
- Summarize: root cause, why this approach was chosen over editing the fragile path, and what (if any) new files/functions/conditions were added.
