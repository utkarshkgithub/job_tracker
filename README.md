# CareerFlow — Job Application Tracking System

CareerFlow is an end-to-end, production-grade SaaS job application tracking and interview management platform with a polish-first UI/UX standard.

## Technology Stack

- **Backend:** C# / .NET 10 ASP.NET Core Web API
- **Database & ORM:** SQL Server 2022 with Entity Framework Core
- **Authentication & Security:** ASP.NET Core Identity with JWT Bearer tokens
- **Frontend:** Angular 19, TypeScript, Reactive Forms, Vanilla CSS Design System with Light/Dark theming
- **Containerization:** Docker & Docker Compose for SQL Server

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   Angular 19 SPA                       │
│  - Reactive Forms, Signals, Auth Interceptor, Guards   │
│  - Status Badges, Toast System, Accessible Modals      │
│  - Light / Dark / System Themes with Instant Preview  │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (JWT Bearer)
                            ▼
┌────────────────────────────────────────────────────────┐
│           ASP.NET Core 10 Web API Service              │
│  - Controllers: Auth, Applications, Interviews,        │
│                 Dashboard, Analytics, Settings         │
│  - Services: Scoped CRUD, User-level Data Isolation    │
│  - DbContext: EF Core SQL Server with Cascade Deletes   │
│  - Identity: ApplicationUser with Regional Preferences │
└───────────────────────────┬────────────────────────────┘
                            │ Port 1433
                            ▼
┌────────────────────────────────────────────────────────┐
│               Microsoft SQL Server 2022                │
│  - CareerFlowDb (Identity, JobApplications, Interviews)│
└────────────────────────────────────────────────────────┘
```

---

## Key Features

1. **Authentication & User Data Isolation**
   - User registration (`/register`) and login (`/login`) powered by ASP.NET Core Identity and JWT tokens.
   - Neutral enumeration-resistant password recovery (`/forgot-password`).
   - Every application and interview query strictly verifies ownership server-side.
   - Profile settings and secure password updates (`/settings/profile`).

2. **Overview Dashboard (`/dashboard`)**
   - Real-time summary cards: Total Applications, Active Applications, Upcoming Interviews, and Offers.
   - Visual status distribution breakdown with interactive stage bars.
   - Next upcoming interviews with direct "Join Meeting" action links.
   - 5 most recently updated applications with quick drill-down.
   - Welcoming empty state for first-time job seekers.

3. **Application Management (`/applications`)**
   - Real-time search across company name and job position.
   - Status tabs: All, Applied, Assessment, Interview, Offer, Rejected, Withdrawn.
   - Date range filters (Last 7 days, 30 days, 90 days, All time) and multi-field sorting.
   - Server-side pagination.
   - Add/Edit application form (`/applications/new`, `/applications/:id/edit`) with duplicate warning heuristics and unsaved changes confirmation.
   - Delete confirmation modal that explains automatic cascade removal of associated interview schedules.

4. **Interview Scheduling & Calendar (`/interviews`)**
   - Add and edit interviews either from application details or directly from `/interviews` via an application picker.
   - Chronological List view (Upcoming, Past, All).
   - Interactive Monthly Calendar view with previous/next month navigation, "Today" jumper, and day-inspection drawer.
   - Overlap warning when scheduling interviews within 45 minutes of existing appointments.

5. **Job Search Analytics (`/analytics`)**
   - Configurable observation periods: 7 days, 30 days, 90 days, this year, all time.
   - Conversion Funnel: `Applications → Interview Stage → Offers` with stage conversion rates and overall win rate.
   - Application volume activity trend bar charts.
   - Stage breakdown with click-through navigation to filtered applications.

6. **Preferences & Design System (`/settings/preferences`)**
   - Dark, Light, and System theme toggle with zero-flicker CSS variable persistence.
   - Configurable date formats (`DD MMM YYYY`, `YYYY-MM-DD`, `MM/DD/YYYY`).
   - 12-hour vs 24-hour time clock display.
   - Regional timezone configuration for interview schedules.
   - Built-in Help Center modal with keyboard navigation shortcuts (`Esc`, `Tab`, `Enter`).

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js](https://nodejs.org/) (v20+ or v24) and `npm`
- [Docker](https://www.docker.com/) (for SQL Server container)

### Option A: One-Command End-to-End Docker Setup (Recommended)

Run the entire stack (Database, ASP.NET Core Backend, and Nginx-served Angular Frontend) with a single command:

```bash
docker compose up --build -d
```

- **Frontend Application (Nginx SPA):** `http://localhost:4200`
- **Backend Web API:** `http://localhost:5000/api`
- **Swagger Documentation:** `http://localhost:5000/swagger`
- **SQL Server 2022:** `localhost:1433`

To stop all containers:
```bash
docker compose down
```

---

### Option B: Local Development Setup

If you prefer running services directly with local SDKs:

#### 1. Start SQL Server
```bash
docker compose up -d sqlserver
```

#### 2. Run the Backend Web API
```bash
cd backend/CareerFlow.Api
dotnet run --urls "http://localhost:5000"
```

The database tables are automatically verified, migrated, and initialized on startup.
- Swagger UI: `http://localhost:5000/swagger`
- API Base: `http://localhost:5000/api`

#### 3. Run the Frontend Angular Application
```bash
cd frontend
npm install
NG_FORCE_RESOLVE_NODE=1 npx @angular/cli serve --host 0.0.0.0 --port 4200
```

Open `http://localhost:4200` in your browser.

---

## Demo Credentials & Seed Data

The database automatically seeds an active demo account so you can immediately explore real data:

- **Email:** `demo@careerflow.dev`
- **Password:** `CareerFlow@123`

The demo account includes:
- 7 tracked applications across Stripe, Google, Microsoft, Netflix, AWS, Datadog, and Meta.
- Upcoming technical and system design interviews with meeting URLs.
- Historical interviews and offer status.

To test clean isolation, click **Sign up** to register a new account (e.g., `jane@example.com` / `Password123`) to experience the first-time user empty state.

---

## API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account and receive a JWT token
- `POST /api/auth/login` — Sign in with email and password
- `GET /api/auth/me` — Get authenticated user details
- `POST /api/auth/forgot-password` — Request password reset (anti-enumeration response)

### Applications (`/api/applications`)
- `GET /api/applications` — Get paginated applications (supports `search`, `status`, `dateFilter`, `sortBy`, `page`, `pageSize`)
- `GET /api/applications/lookup` — Lightweight ID/Company/Position list for selectors
- `GET /api/applications/{id}` — Get single application details with interview count
- `POST /api/applications` — Create a new job application
- `PUT /api/applications/{id}` — Update job application fields
- `PATCH /api/applications/{id}/status` — Update application status
- `DELETE /api/applications/{id}` — Delete application and cascade delete associated interviews

### Interviews (`/api/interviews`)
- `GET /api/interviews?filter={upcoming|past|all}` — List interviews
- `GET /api/interviews/calendar?startDate={d}&endDate={d}` — Query interviews for calendar month
- `GET /api/interviews/by-application/{applicationId}` — Get timeline for specific application
- `GET /api/interviews/{id}` — Get single interview details
- `POST /api/interviews` — Schedule a new interview (checks overlap)
- `PUT /api/interviews/{id}` — Update interview round, type, date/time, URL, or notes
- `DELETE /api/interviews/{id}` — Remove interview record without deleting application

### Dashboard & Analytics
- `GET /api/dashboard` — Summary counts, stage distribution, upcoming rounds, recent roles
- `GET /api/analytics?period={7days|30days|90days|year|all}` — Funnel, activity trends, stage breakdown

### User Settings (`/api/settings`)
- `GET /api/settings/profile` — User profile details
- `PUT /api/settings/profile` — Update display name
- `POST /api/settings/change-password` — Change password with validation
- `PUT /api/settings/preferences` — Persist theme, date, time, and timezone preferences

---

## Testing & Verification

1. **Backend Build & Verification:**
   ```bash
   dotnet build backend/CareerFlow.Api
   ```
2. **Frontend Build & Budget Verification:**
   ```bash
   cd frontend
   NG_FORCE_RESOLVE_NODE=1 npx @angular/cli build
   ```
3. **End-to-End API Integration:**
   ```bash
   # Test demo authentication
   curl -s -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@careerflow.dev","password":"CareerFlow@123"}'
   ```
