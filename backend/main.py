from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from routers import category, product, order, customer, order_item, dashboard



from db.database import engine

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


@app.get("/")
def home():
    return {
        "message": "ShopAdmin Backend is running!"
    }


@app.get("/test-db")
def test_database():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

    return {
        "database": result.scalar()
    }


app.include_router(category.router)
app.include_router(product.router)
app.include_router(order.router)
app.include_router(customer.router)
app.include_router(order_item.router)
app.include_router(dashboard.router)

