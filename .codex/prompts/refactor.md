---
description: Refactor existing code with bounded scope and complete requirements
argument-hint: <target and desired outcome>
---

You are refactoring: **$ARGUMENTS**

Follow this repository's guidance in `AGENTS.md` and, when useful for existing project rules, `CLAUDE.md`. Refactoring may modify existing code, but only inside the agreed scope and only as much as required to reach the stated outcome.

## Step 1 - Gather Complete Requirements First

Do not change code until the requirements are complete. If any required item is missing, ask the user a concise blocking question and stop.

Required information:

- Target: exact file, function, class, component, module, endpoint, or flow.
- Definition of done: what success looks like after the refactor.
- Motivation: readability, deduplication, decoupling, performance, testability, or another reason.
- Behavior contract: whether external behavior and public signatures must stay identical, or which changes are explicitly allowed.
- Scope boundary: files, modules, routes, APIs, or behaviors that are off-limits.
- Verification: commands, tests, manual flow, or expected output that proves success.

If the prompt already provides some of this, restate the known requirements and ask only for the gaps.

## Step 2 - Survey Impact

- Run `git branch -a`.
- Run `git fetch --all` when network access is available; if approval is required, request it with a short justification.
- For each other branch, inspect `git --no-pager diff --stat main...<branch>` to identify hot files touching the target.
- Search the repository for every caller and usage of the target so dependency contracts are explicit.

## Step 3 - Plan the Smallest Bounded Change

- Modify only what is needed for the agreed output.
- Do not rewrite unrelated code or clean up adjacent areas opportunistically.
- Preserve routes, public signatures, exported names, DTO shapes, DB columns, and observable behavior unless explicitly authorized.
- If the cleanest refactor would touch the hot set or break a contract, stop and present options.

## Step 4 - Implement And Verify

Make the bounded edits. Prefer extracted helper files or functions when that reduces risk without expanding scope.

Run the agreed verification plus relevant checks: `npm run lint`, `npm run build`, and `dotnet build`. Show `git --no-pager diff --stat` and summarize what changed, why it is the least-impact option, and what behavior was preserved.
