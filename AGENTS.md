# Repository Guidelines

## Project Structure & Module Organization

This repository contains the Wanderlust Tours full-stack app. `client/` is the React 19 + Vite + TypeScript SPA; source lives in `client/src/`, with typed Axios calls in `api/`, route pages in `pages/`, reusable UI in `components/`, auth guards/context in `auth/`, shared types in `types.ts`, and global theme tokens in `index.css`. Static client assets live in `client/public/`.

`server/TourPackages.Api/` is the ASP.NET Core .NET 10 Web API. Important folders include `Controllers/`, `Services/`, `Repositories/`, `Dtos/`, `Models/`, `Data/`, `Migrations/`, `Validation/`, and `Common/`. Uploaded images are stored under `wwwroot/uploads/`.

## Build, Test, and Development Commands

- `cd client; npm install` installs frontend dependencies.
- `cd client; npm run dev` starts Vite on `http://localhost:5173`.
- `cd client; npm run build` runs TypeScript project checks and creates the production build.
- `cd client; npm run lint` runs ESLint over the frontend.
- `cd server/TourPackages.Api; dotnet run --launch-profile http` starts the API on `http://localhost:5169` with Swagger at `/swagger`.
- `cd server/TourPackages.Api; dotnet build` compiles the backend.
- `cd server/TourPackages.Api; dotnet ef database update` applies EF Core migrations to PostgreSQL.

## Coding Style & Naming Conventions

Use TypeScript for client code and C# with nullable reference types enabled for backend code. Prefer PascalCase for React components and C# public types, camelCase for TypeScript variables/functions, and descriptive DTO names such as `CreateBookingDto`. Keep API responses DTO-based; do not expose EF entities directly. Preserve UTC handling for `DateTime` values and keep `BookingStatus` JSON values aligned with `client/src/types.ts`.

## Testing Guidelines

No automated test suite is currently committed. Before submitting changes, run `npm run lint`, `npm run build`, and `dotnet build`. For API behavior, use Swagger or `server/TourPackages.Api/TourPackages.Api.http`. When changing database models, add an EF migration and verify `dotnet ef database update` against a local PostgreSQL instance.

## Commit & Pull Request Guidelines

Recent history uses short, feature-oriented messages such as `Feat-Booking Notification` and `refactor/enterprise-backend`. Use concise subjects with a clear scope, for example `feat: add package image upload` or `fix: normalize booking date`. Pull requests should include a summary, verification commands run, linked issue if available, screenshots for UI changes, and notes for migrations or configuration changes.

## Security & Configuration Tips

Keep local secrets out of commits. The development connection string is in `server/TourPackages.Api/appsettings.json`; move real passwords, JWT secrets, and SMTP credentials to user secrets or environment variables before sharing or deploying.
