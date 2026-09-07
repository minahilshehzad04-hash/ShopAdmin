# ShopAdmin

ShopAdmin is a Next.js dashboard backed by FastAPI, SQLAlchemy, and PostgreSQL for managing a technology product catalog, customers, orders, and stock.

## Requirements

- Node.js 20+
- Python 3.11+
- PostgreSQL 14+

## Backend setup

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Set the PostgreSQL values in `backend/.env`, then run migrations and seed data:

```powershell
alembic upgrade head
py -m seed
```

For a fresh sample database, use `py -m seed --reset`.

Start the API:

```powershell
uvicorn main:app --reload --port 8000
```

Swagger is available at http://localhost:8000/docs.

## Frontend setup

```powershell
cd frontend\my-app
npm install
$env:NEXT_PUBLIC_API_URL="http://localhost:8000"
npm.cmd run dev
```

Open http://localhost:3000.

## API

All resource endpoints use the `/api` prefix. Products, categories, customers, orders, order items, and dashboard endpoints are served by the FastAPI application. The frontend reads the API URL from `NEXT_PUBLIC_API_URL` and defaults to `http://localhost:8000`.

## Project layout

- `backend/`: FastAPI application, SQLAlchemy models, schemas, routers, migrations, and seed data
- `frontend/my-app/`: Next.js application, reusable components, services, hooks, and pages
