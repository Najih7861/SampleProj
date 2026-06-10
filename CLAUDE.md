# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Wanderlust Tours — a tour package booking app. React 19 + Vite + TypeScript SPA (`client/`) talking to an ASP.NET Core (.NET 10) Web API (`server/TourPackages.Api/`) backed by PostgreSQL via EF Core.

## Commands

Backend (`cd server/TourPackages.Api`):
- `dotnet run --launch-profile http` — run API on http://localhost:5169 (Swagger at `/swagger`). Use the `http` profile; the Vite proxy targets that port.
- `dotnet ef database update` — apply migrations and seed 5 sample tours. Requires `dotnet tool install --global dotnet-ef`.
- `dotnet ef migrations add <Name>` — create a migration after changing models or `AppDbContext`.
- `dotnet build`

Frontend (`cd client`):
- `npm install` then `npm run dev` — dev server on http://localhost:5173.
- `npm run build` — type-checks (`tsc -b`) then builds; the build fails on type errors.
- `npm run lint` — ESLint.

There is no automated test suite. Use Swagger or `TourPackages.Api.http` for manual API testing.

## Architecture

**Request flow:** React pages → typed functions in `client/src/api/client.ts` (axios, `baseURL: '/api'`) → Vite dev proxy forwards `/api/*` to `:5169` (`vite.config.ts`) → ASP.NET controllers. The backend also has a CORS policy for `localhost:5173` (`Program.cs`), so direct (non-proxied) calls work too.

**Controllers return DTOs, never entities.** Each controller has a private `ToDto` mapper (e.g. `BookingsController.ToDto`). DTOs live in `server/TourPackages.Api/Dtos/`; keep entity shapes out of API responses. `BookingDto` flattens the related package title via `b.TourPackage?.Title`, so queries that build bookings `Include(x => x.TourPackage)`.

**Domain rules live in controllers.** Booking creation validates the package exists and `IsAvailable`, and forces `Status = Pending` server-side regardless of input. Booking ↔ TourPackage is configured with cascade delete in `AppDbContext`.

## Conventions that bite

- **DateTimes must be UTC for Npgsql.** PostgreSQL `timestamptz` rejects non-UTC `DateTime`. Incoming dates are normalized with `DateTime.SpecifyKind(..., DateTimeKind.Utc)` and new timestamps use `DateTime.UtcNow`. Follow this for any new date field.
- **`BookingStatus` enum: string on the wire, int in the DB.** `Program.cs` registers `JsonStringEnumConverter` (JSON sends/receives `"Pending"`, `"Confirmed"`, `"Cancelled"`), while `AppDbContext` maps the column with `HasConversion<int>()`. The TS `BookingStatus` type in `client/src/types.ts` must mirror these string values.
- **Seed data uses a fixed timestamp** (`2026-01-01`) so migrations stay deterministic — don't replace it with `DateTime.Now`.
- **Money** is `numeric(10,2)` (`Price`).

## Engineering principles — isolation by design

These are hard rules for all work in this repo. The goal: **one change must never ripple into unrelated code or another branch's work.**

- **Low coupling / high cohesion.** Functions should not depend on each other's internals. A function takes inputs and returns outputs; it does not reach into another function's state. Prefer pure functions and explicit parameters over shared mutable state or hidden globals.
- **Modular by file.** Each file/module owns one responsibility. Changing one feature should touch one area, not fan out across the codebase. If a change forces edits in many files, the design is too coupled — stop and reconsider.
- **Open for extension, closed for modification (OCP).** When adding behavior, *extend* — add a new function, file, component, endpoint, or a guard/condition. Do **not** rewrite or repurpose existing working functions to bolt on new cases.
- **New logic lives in new files.** Net-new behavior goes in a new file/function rather than being interleaved into existing code. This keeps the blast radius of every change to that new file.
- **Never break a dependency contract.** Do **not** move, rename, or delete any symbol (function, type, file, route, DB column, exported name) that other code, other functions, or other git branches depend on. Additive changes only. If a rename seems necessary, add the new name alongside and leave the old one intact.
- **Minimal diffs.** Make the smallest change that satisfies the requirement. Fewer changed lines = fewer ways to break something else.

## Custom workflows

Two project commands encode the rules above. Their definitions live in `.claude/commands/`.

### `/add-feature <description>` — see `.claude/commands/add-feature.md`
Adds a feature with isolation guarantees: first inspects **all other git branches** to learn what code they touch, then implements as **additive, minimal** changes that follow OCP and never move/rename/delete anything another branch or caller depends on. New logic goes in new files.

### `/bug-fix <description>` — see `.claude/commands/bug-fix.md`
Fixes a bug with the least risky change: reviews **all branches and recent history** to understand why the code is the way it is, then makes the **minimal** change to get the build/app green. If an in-place edit would crash another part of the app or cascade into further fixes, it instead adds a **new function or a guarding condition** (in a new file) rather than modifying the fragile code path.

### `/refactor <target + desired outcome>` — see `.claude/commands/refactor.md`
Refactors existing code. **Gathers complete requirements first and refuses to proceed on incomplete information** (asks the user for target, definition of done, behavior contract, scope boundary, and verification). This is the one workflow where modifying/restructuring existing code is allowed — but it's **bounded**: it alters only what the agreed outcome requires, picks the least-work/least-risk option, preserves all external behavior and dependency contracts unless explicitly authorized, and must not affect any other part of the program.

## Notes

- The admin area (`/admin/packages`, `/admin/bookings`) has **no authentication** — it's open by design for now.
- DB password sits in `appsettings.json` for local dev only; the connection string under `ConnectionStrings:DefaultConnection` must point at a running PostgreSQL instance before migrations or the API will work.
