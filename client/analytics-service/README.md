# Wanderlust Analytics Service

A standalone **Python FastAPI** microservice that powers the admin **Analytics**
dashboard. It reads the *same* PostgreSQL database the .NET API owns (read-only),
computes business analytics, and is protected by the **same JWT** the .NET
backend issues — so a token that works against the .NET API works here too.

It lives under `client/` (alongside the React app) by design; it is **not** part
of `server/TourPackages.Api`.

## What it exposes

| Method | Path                   | Auth            | Purpose                                  |
|--------|------------------------|-----------------|------------------------------------------|
| GET    | `/analytics/health`    | none            | Liveness probe                           |
| GET    | `/analytics/dashboard` | **Admin** JWT   | Full dashboard payload (KPIs + matplotlib chart images + tables + insights) |
| GET    | `/docs`                | none            | Swagger UI                               |

### Auth behavior
- Missing / malformed / bad-signature / wrong issuer-or-audience token → **401**
- Expired token → **401** (`"Token expired"`)
- Valid token without the `Admin` role → **403**

## Prerequisites
- Python 3.11+
- The PostgreSQL database used by the .NET API, reachable and migrated
  (`dotnet ef database update` in `server/TourPackages.Api`).

## Setup & run

```bash
cd client/analytics-service
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# (macOS/Linux: source .venv/bin/activate)

pip install -r requirements.txt

# Optional: copy and tweak environment overrides
cp .env.example .env

uvicorn app.main:app --port 8000 --reload
```

The React dev server proxies `/analytics/*` to `http://localhost:8000`
(see `client/vite.config.ts`), so once all three processes are up
(.NET API on 5169, this service on 8000, Vite on 5173) the **Analytics** tab
works end to end.

## Configuration

All settings have dev defaults matching the .NET `appsettings.json`; override via
environment variables or a `.env` file (see `.env.example`):

| Variable        | Default                                                        | Notes                                   |
|-----------------|---------------------------------------------------------------|-----------------------------------------|
| `DATABASE_URL`  | `postgresql+psycopg2://postgres:1234@localhost:5432/tourpackages` | SQLAlchemy URL for the shared DB    |
| `JWT_KEY`       | `dev-only-...`                                                 | **Must match** the .NET signing key     |
| `JWT_ISSUER`    | `WanderlustTours`                                             | Must match the .NET issuer              |
| `JWT_AUDIENCE`  | `WanderlustToursClient`                                       | Must match the .NET audience            |
| `JWT_ALG`       | `HS256`                                                        | Must match the .NET algorithm           |
| `CORS_ORIGINS`  | `http://localhost:5173`                                       | Comma-separated allowed origins         |

> In production, set a strong `JWT_KEY` in **both** services and point
> `DATABASE_URL` at the real database with a least-privilege (read-only) user.

## Layout

```
app/
  main.py              FastAPI app + CORS + router wiring
  config.py            env-driven settings (DB + JWT)
  db.py                SQLAlchemy engine + read-only connection dependency
  security.py          JWT validation (PyJWT) + require_admin guard
  schemas.py           Pydantic response models (typed contract)
  queries.py           SQL aggregation functions + insight rules
  charts.py            matplotlib chart rendering -> PNG data URIs (brand palette)
  routers/analytics.py endpoints
```
