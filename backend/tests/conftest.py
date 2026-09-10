"""
Shared pytest fixtures for the ShopAdmin test suite.

This conftest:
1. Waits for the database to be reachable before any test runs.
   Solves the docker compose run race condition where the backend container
   starts before Postgres has finished initialising.
2. Ensures a Category with id=1 ('Test Category') exists so that product
   tests which pass category_id=1 never receive a 404.
"""

import time

import pytest
from sqlalchemy.exc import OperationalError
from fastapi.testclient import TestClient

from main import app
from db.database import SessionLocal, engine
from models.category import Category


# ---------------------------------------------------------------------------
# DB readiness helper
# ---------------------------------------------------------------------------

def wait_for_db(retries: int = 30, delay: float = 1.0) -> None:
    """Poll until Postgres accepts connections (up to retries * delay seconds)."""
    for attempt in range(1, retries + 1):
        try:
            with engine.connect():
                return  # success
        except OperationalError:
            if attempt == retries:
                raise RuntimeError(
                    f"Database not reachable after {retries} attempts."
                )
            print(
                f"[conftest] DB not ready (attempt {attempt}/{retries}), "
                f"retrying in {delay}s…"
            )
            time.sleep(delay)


# ---------------------------------------------------------------------------
# Session-scoped fixtures (run once per pytest session)
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session", autouse=True)
def ensure_test_category():
    """
    Wait for the DB then make sure category id=1 exists.
    All product creation tests use category_id=1; without this they would
    receive a 404 on a freshly-migrated (empty) database.
    """
    wait_for_db()

    db = SessionLocal()
    try:
        existing = db.query(Category).filter(Category.id == 1).first()
        if not existing:
            # Insert without specifying id so the DB sequence assigns it.
            # On a fresh database this will be id=1, matching what tests expect.
            category = Category(
                name="Test Category",
                description="Auto-created by conftest for testing",
            )
            db.add(category)
            db.commit()
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Convenience client fixture (function-scoped — fresh per test)
# ---------------------------------------------------------------------------

@pytest.fixture
def db_session():
    """Create a new database session with a rollback for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = SessionLocal(bind=connection)

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()

@pytest.fixture
def client(db_session):
    """FastAPI TestClient, re-created for every test function."""
    from db.dependencies import get_db
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
