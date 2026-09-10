import logging
import time
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from db.dependencies import get_db
from routers import category, product, order, customer, order_item, dashboard


from db.database import engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ShopAdmin API",
    description="Backend API for the ShopAdmin dashboard",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} "
        f"completed in {process_time:.4f}s with status {response.status_code}"
    )
    return response

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error due to database issue."},
    )


@app.get("/")
def home():
    return {
        "message": "ShopAdmin Backend is running!"
    }


@app.get("/test-db")
def test_database():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
        return {
            "database": result.scalar()
        }
    except Exception as e:
        logger.error(f"Test DB failed: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable")


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable")

app.include_router(category.router)
app.include_router(product.router)
app.include_router(order.router)
app.include_router(customer.router)
app.include_router(order_item.router)
app.include_router(dashboard.router)

