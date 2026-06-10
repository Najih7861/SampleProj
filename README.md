# 🌍 Wanderlust Tours — Tour Package Web Application

A full-stack tour package booking application built with **React** (frontend) and **ASP.NET Core** (backend), backed by **PostgreSQL** via **Entity Framework Core**.

Visitors can browse tour packages, filter by destination and price, view details, and submit a booking. A lightweight admin area manages packages and booking statuses.

---

## ✨ Features

**Visitor**
- Browse all tour packages as cards (title, destination, price, duration, image)
- Search / filter by destination and price range
- View full package details
- Submit a booking/inquiry (name, email, phone, travel date, number of travelers)

**Admin**
- Create / edit / delete tour packages
- View all bookings and update their status (Pending → Confirmed / Cancelled)

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, React Router, Axios |
| Backend | ASP.NET Core Web API (.NET 10), EF Core |
| Database | PostgreSQL (Npgsql provider) |
| API docs | Swagger / OpenAPI |

The UI theme uses an ocean-blue + turquoise palette with sunset-coral CTAs — chosen to fit the travel/tourism nature of the business. All colors are defined as CSS variables in [`client/src/index.css`](client/src/index.css) so the theme can be re-skinned without touching components.

---

## 📁 Project Structure

```
.
├── server/
│   └── TourPackages.Api/        # ASP.NET Core Web API
│       ├── Controllers/         # PackagesController, BookingsController
│       ├── Data/                # AppDbContext (+ seed data)
│       ├── Dtos/                # Request/response DTOs
│       ├── Models/              # TourPackage, Booking, BookingStatus
│       ├── Migrations/          # EF Core migrations
│       └── appsettings.json     # Connection string lives here
└── client/                      # React + Vite SPA
    └── src/
        ├── api/                 # Typed API client (axios)
        ├── components/          # Navbar, PackageCard, BookingForm, PackageForm
        ├── pages/               # Home, PackageDetails, AdminPackages, AdminBookings
        ├── types.ts             # Shared TypeScript types
        └── index.css            # Theme tokens + global styles
```

---

## 🚀 Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) and npm
- [PostgreSQL](https://www.postgresql.org/) running locally
- EF Core CLI tools: `dotnet tool install --global dotnet-ef`

### 1. Configure the database connection
Edit the connection string in [`server/TourPackages.Api/appsettings.json`](server/TourPackages.Api/appsettings.json):

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=tourpackages;Username=postgres;Password=YOUR_PASSWORD"
}
```

### 2. Create the database & apply migrations
```bash
cd server/TourPackages.Api
dotnet ef database update
```
This creates the `tourpackages` database, the schema, and seeds 5 sample tours.

### 3. Run the backend (Terminal 1)
```bash
cd server/TourPackages.Api
dotnet run --launch-profile http
```
API: http://localhost:5169 — Swagger UI: http://localhost:5169/swagger

### 4. Run the frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
```
App: http://localhost:5173

The Vite dev server proxies `/api/*` to the backend (see [`client/vite.config.ts`](client/vite.config.ts)), so no CORS configuration is needed in development.

---

## 🔌 API Endpoints

### Packages
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/packages` | List packages. Query: `destination`, `minPrice`, `maxPrice` |
| `GET` | `/api/packages/{id}` | Get a single package |
| `POST` | `/api/packages` | Create a package |
| `PUT` | `/api/packages/{id}` | Update a package |
| `DELETE` | `/api/packages/{id}` | Delete a package |

### Bookings
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/bookings` | Create a booking for a package |
| `GET` | `/api/bookings` | List bookings. Query: `status` |
| `GET` | `/api/bookings/{id}` | Get a single booking |
| `PUT` | `/api/bookings/{id}/status` | Update a booking's status |

---

## 🗺️ Roadmap (Future Expansion)

The data model is intentionally small but structured so these can be added without rework:

- 🔐 Authentication & roles (protect the admin area)
- 🗓️ Day-by-day itineraries per package
- ⭐ Reviews & ratings
- 🏷️ Categories / tags (Adventure, Beach, Family) with filtering
- 🖼️ Image uploads (replace the `ImageUrl` text field)
- 💳 Payments (Stripe) on confirmed bookings
- 📧 Email notifications on booking submission/confirmation

---

## 🔒 Security Note

For local development the DB password sits in `appsettings.json`. Before deploying or pushing to a shared repository, move it to [.NET user-secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets) or an environment variable.
