---
description: Fix a bug with the least risky branch- and history-aware change
argument-hint: <bug description or failing behavior>
---

You are fixing a bug: **$ARGUMENTS**

Follow this repository's guidance in `AGENTS.md` and, when useful for existing project rules, `CLAUDE.md`. The objective is to make the build or app path green with the smallest reliable change, without trading one breakage for another.

## Step 1 - Reproduce And Locate

- Reproduce the failure through the relevant build, app path, API call, or UI flow.
- Capture the exact error, bad response, or incorrect behavior.
- Trace the root cause before editing; avoid symptom-only fixes.

## Step 2 - Review Branches And History Before Editing

- Run `git branch -a`.
- Run `git fetch --all` when network access is available; if approval is required, request it with a short justification.
- For each other branch, inspect `git --no-pager diff --stat main...<branch>` and `git --no-pager log --oneline main..<branch>`.
- Identify branches that touch the suspect files or symbols and treat those areas as a hot set.
- Review recent intent with `git --no-pager log --oneline -n 20 -- <suspect files>` and `git --no-pager blame <suspect file>` for the relevant lines.

## Step 3 - Choose The Safest Fix

- Make the minimal change required to fix the reproduced failure.
- If editing an existing fragile path would create a cascading fix elsewhere, add a narrow guard or a new helper function instead.
- Keep new logic in a new file where practical.
- Do not move, rename, delete, or reshape dependency contracts.
- Preserve behavior for cases that currently work.

## Step 4 - Verify

- Run the checks relevant to the changed area: `npm run lint`, `npm run build`, `dotnet build`, API checks, or a browser smoke test.
- Re-run the original reproduction and confirm it now passes.
- Sanity-check nearby working paths.
- Show `git --no-pager diff --stat`.
- Summarize the root cause, the fix, why this was the lowest-risk approach, and what verification passed.
