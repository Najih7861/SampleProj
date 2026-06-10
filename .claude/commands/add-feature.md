---
description: Add a feature with isolation-by-design guarantees (branch-aware, additive, OCP, minimal diff)
argument-hint: <feature description>
---

You are adding a new feature: **$ARGUMENTS**

Follow the repo's "isolation by design" rules in `CLAUDE.md`. This is non-negotiable: the feature must be **additive** and must **not** disturb existing functionality or any other branch's in-flight work.

## Step 1 — Survey other branches FIRST (before writing any code)
Run these and read the output before planning:
- `git branch -a` — list every local and remote branch.
- For each branch other than the current one, see what files/areas it touches:
  - `git fetch --all` (refresh remotes)
  - `git --no-pager diff --stat main...<branch>` (or the repo's base branch) for each branch
  - `git --no-pager log --oneline main..<branch>` to understand intent
Build a set of **"hot" files/symbols** that other branches are actively changing. Treat those as off-limits for modification — you may add new files, but do not edit, move, rename, or delete anything in that hot set.

## Step 2 — Plan an additive, minimal design
- Identify the **smallest** set of changes that delivers the feature.
- Prefer **new files / new functions / new components / new endpoints** over editing existing ones (Open/Closed Principle).
- Decoupling: the new code should take explicit inputs and return outputs — no reaching into existing functions' internals, no new shared mutable/global state.
- Confirm you will **not** move, rename, or delete any function, type, file, route, exported name, or DB column that existing callers or other branches depend on. If a rename feels necessary, add the new name alongside and leave the old one untouched.
- If delivering the feature *requires* changing a hot/shared file, STOP and report the conflict to the user with options — do not silently edit it.

## Step 3 — Implement
- Put net-new logic in **new files**. Wire it in with the minimum possible edits to existing files (ideally just registration/import lines, not logic changes).
- Keep the diff small and reviewable.

## Step 4 — Verify isolation
- Build/typecheck both affected projects (backend: `dotnet build`; frontend: `npm run build`).
- Run a quick smoke test of the new behavior.
- Show `git --no-pager diff --stat` and confirm the changed-file list is minimal and contains **no** files from the hot set identified in Step 1.
- Summarize: what was added (new files), what existing files were touched and why, and confirm no dependency contracts were broken.
