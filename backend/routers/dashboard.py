from datetime import datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from db.dependencies import get_db
from models.category import Category
from models.customer import Customer
from models.order import Order
from models.order_item import OrderItem
from models.product import Product

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("")
def get_dashboard(days: int = Query(default=30, ge=7, le=365), db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=days)
    previous_since = since - timedelta(days=days)
    active_orders = db.query(Order).filter(func.lower(Order.status) != "cancelled")
    total_sales = active_orders.with_entities(func.coalesce(func.sum(Order.total_amount), 0)).scalar() or 0
    period_sales = active_orders.filter(Order.created_at >= since).with_entities(func.coalesce(func.sum(Order.total_amount), 0)).scalar() or 0
    previous_sales = active_orders.filter(Order.created_at >= previous_since, Order.created_at < since).with_entities(func.coalesce(func.sum(Order.total_amount), 0)).scalar() or 0
    period_orders = active_orders.filter(Order.created_at >= since).count()
    previous_orders = active_orders.filter(Order.created_at >= previous_since, Order.created_at < since).count()
    low_stock = db.query(Product).filter(Product.stock <= 5).order_by(Product.stock, Product.name).all()

    sales_rows = (
        active_orders.filter(Order.created_at >= since)
        .with_entities(func.date(Order.created_at).label("date"), func.sum(Order.total_amount).label("total"))
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )
    order_status_rows = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    category_rows = (
        db.query(Category.name, func.sum(OrderItem.quantity * OrderItem.price).label("total"))
        .join(Product, Product.category_id == Category.id)
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(func.lower(Order.status) != "cancelled")
        .group_by(Category.name)
        .order_by(func.sum(OrderItem.quantity * OrderItem.price).desc())
        .all()
    )
    top_product_rows = (
        db.query(Product.id, Product.name, Product.price, func.sum(OrderItem.quantity).label("units"))
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(func.lower(Order.status) != "cancelled")
        .group_by(Product.id, Product.name, Product.price)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )

    return {
        "stats": {
            "total_sales": float(Decimal(str(total_sales))),
            "total_orders": active_orders.count(),
            "total_products": db.query(Product).count(),
            "total_customers": db.query(Customer).count(),
            "low_stock_items": len(low_stock),
            "sales_change": ((float(period_sales) - float(previous_sales)) / float(previous_sales) * 100) if previous_sales else None,
            "orders_change": ((period_orders - previous_orders) / previous_orders * 100) if previous_orders else None,
        },
        "sales": [{"date": str(row.date), "total": float(row.total or 0)} for row in sales_rows],
        "orders": [{"status": status, "count": count} for status, count in order_status_rows],
        "categories": [{"name": name, "total": float(total or 0)} for name, total in category_rows],
        "top_products": [{"id": product_id, "name": name, "price": float(price), "units": units} for product_id, name, price, units in top_product_rows],
        "low_stock": [{"id": product.id, "name": product.name, "stock": product.stock} for product in low_stock],
    }
