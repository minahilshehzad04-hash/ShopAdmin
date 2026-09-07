from datetime import date, datetime, timedelta
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.dependencies import get_db
from schemas.order import OrderCreate, OrderListResponse, OrderResponse, OrderStatusUpdate
from services.order_service import (
    create_order,
    get_all_orders,
    get_order_by_id,
    serialize_order,
    update_order_status as update_order_status_service,
)
from models.customer import Customer

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)

@router.post("/", response_model=OrderResponse, status_code=201)
def create_new_order(
    payload: OrderCreate,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    try:
        order = create_order(db, payload.model_dump())
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return serialize_order(db, order)

@router.get("/", response_model=OrderListResponse)
def get_orders(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    search: str | None = None,
    status: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db)
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")
    end_boundary = datetime.combine(end_date + timedelta(days=1), datetime.min.time()) if end_date else None
    orders, total = get_all_orders(db, page, limit, search, status, start_date, end_boundary)
    return {"items": [serialize_order(db, order) for order in orders], "total": total, "page": page, "limit": limit, "pages": ceil(total / limit) if total else 0}


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = get_order_by_id(db, order_id)

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return serialize_order(db, order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate | None = None,
    status: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    order = get_order_by_id(db, order_id)

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    requested_status = payload.status if payload else status
    allowed_statuses = ["pending", "processing", "shipped", "completed", "cancelled"]
    requested_status = requested_status.lower() if requested_status else ""

    if requested_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed values: {allowed_statuses}"
        )

    try:
        order = update_order_status_service(db, order_id, requested_status)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error

    return serialize_order(db, order)


