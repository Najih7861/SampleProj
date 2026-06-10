---
description: Refactor existing code — gather complete requirements first, then make the smallest bounded change that achieves the goal without affecting other parts
argument-hint: <what to refactor and the desired outcome>
---

You are refactoring: **$ARGUMENTS**

Follow the repo's "isolation by design" rules in `CLAUDE.md`. Refactoring is the **one** workflow where modifying/restructuring existing code is allowed — but it stays **bounded**: change only what's needed to reach the required output, with the smallest blast radius and the least work.

## Step 1 — Gather COMPLETE requirements first (BLOCKING)
Do **not** write or change any code until you have every piece of information below. If anything is missing, ambiguous, or assumed, **ask the user with the AskUserQuestion tool and STOP** — never proceed on incomplete information, and never guess intent.

Information required before starting:
1. **Target** — exactly which file(s), function(s), class, component, or module to refactor.
2. **Required output / definition of done** — what success looks like after the refactor (desired structure, behavior, performance, readability, or API shape).
3. **Motivation** — why it's being refactored (readability, deduplication, decoupling, performance, testability, etc.).
4. **Behavior contract** — must external/observable behavior and public signatures stay identical? Or is the user explicitly authorizing signature/behavior changes? Which?
5. **Scope boundary** — how far the change may reach; any files, modules, or APIs that are strictly off-limits.
6. **Verification** — how success will be confirmed (tests, build, a manual flow, expected output).

If the prompt already answers some of these, restate your understanding and only ask about the gaps. Once everything is confirmed, continue.

## Step 2 — Survey impact (branch- and caller-aware)
- `git branch -a` then `git fetch --all`; for each other branch run `git --no-pager diff --stat <base>...<branch>` to find which branches touch the target. Treat those files/symbols as a **hot set** to avoid disturbing.
- Find every caller/usage of the code being refactored (search the repo). Map what depends on it so the change can preserve those contracts.

## Step 3 — Plan the smallest bounded change
- Restructuring/modifying the target is allowed, but **alter only what is required** to achieve the agreed "required output." Do not opportunistically rewrite unrelated code.
- Pick the option with the **least work and least risk** that satisfies the goal.
- The change must **not affect any other part of the program**: code outside the target keeps its existing behavior, and no dependency contract (public signature, route, exported name, type, DB column) is broken unless Step 1 explicitly authorized it.
- If the cleanest refactor would ripple into the hot set or break a contract, STOP and report the trade-off to the user with options instead of proceeding.

## Step 4 — Implement
- Make the bounded edits. Keep the diff tight and focused on the agreed target.
- Where the refactor extracts new logic, prefer placing it in a new file/function so the blast radius stays contained (per `CLAUDE.md`).

## Step 5 — Verify
- Build/typecheck both affected projects (`dotnet build`; `npm run build`) — confirm green.
- Run the verification agreed in Step 1; confirm the required output is met.
- Confirm callers and previously-working behavior are unchanged (the refactor is behavior-preserving unless the user authorized otherwise).
- Show `git --no-pager diff --stat`; confirm the change is minimal and stays out of the hot set.
- Summarize: what changed, why it's the least-impact option, and confirm no other part of the program was affected.
