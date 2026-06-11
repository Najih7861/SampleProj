---
description: Add a feature with isolation-by-design guarantees
argument-hint: <feature description>
---

You are adding a new feature: **$ARGUMENTS**

Follow this repository's guidance in `AGENTS.md` and, when useful for existing project rules, `CLAUDE.md`. The feature must be additive, minimal, and must not disturb existing functionality or other branches' in-flight work.

## Step 1 - Survey Branches Before Editing

Run these before planning:

- `git branch -a`
- `git fetch --all` when network access is available; if approval is required, request it with a short justification.
- For each branch other than the current branch, inspect `git --no-pager diff --stat main...<branch>` and `git --no-pager log --oneline main..<branch>`.

Build a "hot set" of files, symbols, routes, models, and migrations touched by other branches. Avoid modifying that hot set unless the user explicitly approves the conflict.

## Step 2 - Plan an Additive Design

- Identify the smallest change that delivers the feature.
- Prefer new files, new functions, new components, or new endpoints over rewriting existing code.
- Keep new logic decoupled: explicit inputs, explicit outputs, no hidden shared state.
- Do not move, rename, or delete public symbols, exported names, routes, DB columns, files, or contracts that callers may depend on.
- If the feature requires editing a hot/shared file, stop and report the trade-off with options.

## Step 3 - Implement

Make the minimal code changes. Put net-new behavior in new files where practical, and wire it into existing code with the smallest necessary edits, such as registration, routing, or imports.

## Step 4 - Verify

- Run the relevant checks: `npm run lint`, `npm run build`, `dotnet build`, and any focused manual flow.
- Use Swagger or `server/TourPackages.Api/TourPackages.Api.http` for backend behavior when no automated test exists.
- Show `git --no-pager diff --stat`.
- Summarize what was added, which existing files were touched and why, what was verified, and confirm no dependency contracts were broken.
