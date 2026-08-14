# Payroll & Benefits Management System — Backend (Laravel API)

Centralized backend API for the Payroll & Benefits subsystem. Implements
every endpoint the frontend expects: Payroll Management, Compensation
Planning, Claims & Reimbursement, HMO & Benefits Administration, and HR
Analytics.

No demo/seed data is included — every table starts empty, ready for a
real client deployment.

## Stack

- PHP 8.2+ + Laravel 11
- PostgreSQL (database)
- Redis (cache, session, queue)
- Laravel Sanctum (token auth for the SPA)
- Docker

## Run with Docker (recommended)

From the parent folder that contains both `backend/` and
`payroll-benefits-system/`, use the root `docker-compose.yml`:

```bash
docker compose up --build
```

This starts Postgres, Redis, the Laravel API (`http://localhost:8000`),
and the frontend (`http://localhost:5173`). Migrations run automatically
on container start (`php artisan migrate --force`).

**Important:** run this from a folder outside OneDrive (or any synced
cloud folder). OneDrive intercepting file writes while Docker/npm are
working can cause random crashes (`SIGBUS`, permission errors). A plain
path like `C:\projects\payroll-benefits-system` works reliably.

## Run locally without Docker (PostgreSQL required)

```bash
composer install
cp .env.example .env
php artisan key:generate
# Point DB_HOST / REDIS_HOST in .env at 127.0.0.1 instead of postgres/redis
php artisan migrate
php artisan serve --host 0.0.0.0 --port 8000
```

This requires a local PostgreSQL and Redis install. If you'd rather use
MySQL via XAMPP with no Redis, see the note at the bottom.

## Creating your first user

There's no seeded user. Create one via Tinker:

```bash
php artisan tinker
>>> \App\Models\User::create(['name' => 'HR Admin', 'email' => 'admin@example.com', 'password' => bcrypt('changeme'), 'role' => 'HR Administrator']);
```

Then log in from the frontend (or via `POST /api/auth/login`) to get a
Sanctum token.

## Project structure

```
app/
  Models/                Employee, PayrollRun, Payslip, SalaryGrade,
                          CompensationAdjustment, Claim, BenefitPlan,
                          BenefitEnrollment, Dependent, User
  Http/Controllers/Api/   One controller per module, matching the routes
                          below
  Http/Resources/         JSON transformers — convert snake_case DB
                          columns to the camelCase shape the frontend's
                          TypeScript types expect
database/migrations/      One migration per table, in dependency order
routes/api.php             All API routes
```

## API routes

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Log in, returns a Sanctum token |
| GET | `/api/auth/me` | Current authenticated user (requires token) |
| POST | `/api/auth/logout` | Revoke current token |
| GET/POST | `/api/payroll/runs` | List / create payroll runs |
| GET | `/api/payroll/runs/{id}` | Get one payroll run |
| POST | `/api/payroll/runs/{id}/approve` | Approve a run |
| POST | `/api/payroll/runs/{id}/release` | Release a run (releases its payslips too) |
| GET | `/api/payroll/runs/{id}/payslips` | List payslips for a run |
| GET | `/api/payroll/payslips/{id}` | Get one payslip |
| GET/POST | `/api/compensation/salary-grades` | List / create salary grades |
| PATCH/DELETE | `/api/compensation/salary-grades/{id}` | Update / delete a grade |
| GET/POST | `/api/compensation/adjustments` | List / request adjustments |
| PATCH | `/api/compensation/adjustments/{id}` | Approve / reject an adjustment |
| GET/POST | `/api/claims` | List / submit claims |
| GET | `/api/claims/{id}` | Get one claim |
| PATCH | `/api/claims/{id}` | Approve / reject a claim |
| POST | `/api/claims/{id}/reimburse` | Mark a claim reimbursed |
| GET/POST | `/api/benefits/plans` | List / create benefit plans |
| PATCH | `/api/benefits/plans/{id}` | Update a plan |
| GET/POST | `/api/benefits/enrollments` | List / create enrollments |
| PATCH | `/api/benefits/enrollments/{id}` | Update enrollment status |
| GET | `/api/analytics/summary` | Dashboard + HR Analytics data, computed live from the tables above |

## Notes

- All amount fields are stored as `decimal(12,2)` or `decimal(14,2)` in
  the database and returned as plain numbers (not strings) in JSON.
- IDs are UUIDs (`Illuminate\Database\Eloquent\Concerns\HasUuids`), not
  auto-increment integers, to match the frontend's `ID = string` type.
- CORS is configured in `config/cors.php` to allow the frontend origin
  from `FRONTEND_URL` in `.env`.
- The `composer.json` in this project already disables Composer's
  security-advisory install blocking (`config.policy.advisories.block:
  false`) so `composer install` doesn't fail on affected transitive
  versions.
- `config/database.php` also has a `mysql` connection defined, and
  `config/cache.php` / `config/session.php` / `config/queue.php` can all
  fall back to `file` / `sync` — set `DB_CONNECTION=mysql`,
  `SESSION_DRIVER=file`, `CACHE_STORE=file`, `QUEUE_CONNECTION=sync` in
  `.env` if you want to run this against XAMPP/MySQL with no Redis
  instead of Docker.
