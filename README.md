# ShopAdmin

ShopAdmin is a Next.js dashboard backed by FastAPI, SQLAlchemy, and PostgreSQL for managing a technology product catalog, customers, orders, and stock.

## Requirements

- Docker and Docker Compose (recommended)
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

## Running the Full Stack with Docker (Recommended)

1. Clone the repository and navigate to the project root.
2. Ensure you have Docker and Docker Compose installed.
3. Start the entire application:

```bash
docker compose up -d
```

This will spin up three containers:
- `db`: PostgreSQL database on port 5432
- `backend`: FastAPI backend on port 8000
- `frontend`: Next.js frontend on port 3000

You can then view the application at http://localhost:3000 and the API documentation at http://localhost:8000/docs.

## Environment Variables

Configuration is handled via `.env` files. The project includes an `.env.example` file in the `backend/` directory.

Backend variables (`backend/.env`):
- `DB_USER`: PostgreSQL user (default: postgres)
- `DB_PASSWORD`: PostgreSQL password
- `DB_HOST`: Database host (default: db)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name (default: ShopAdmin)

Frontend variables:
- `NEXT_PUBLIC_API_URL`: The URL of the backend API (default: http://localhost:8000)

## Running Tests

To run the pytest suite inside the backend container (which uses a transactional rollback fixture to keep the DB clean):

```bash
docker compose run --rm backend sh -c "PYTHONPATH=/app pytest tests/ -v"
```

## API

All resource endpoints use the `/api` prefix. Products, categories, customers, orders, order items, and dashboard endpoints are served by the FastAPI application.

There is a health check endpoint at `/health` which also verifies the database connection status.

## Project layout

- `backend/`: FastAPI application, SQLAlchemy models, schemas, routers, migrations, and seed data
- `frontend/my-app/`: Next.js application, reusable components, services, hooks, and pages
