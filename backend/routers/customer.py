from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.dependencies import get_db
from models.customer import Customer
from models.order import Order
from schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from schemas.order import OrderResponse
from services.customer_service import (
    create_customer as create_customer_service,
    delete_customer as delete_customer_service,
    get_all_customers as get_all_customers_service,
    get_customer_by_id as get_customer_by_id_service,
    get_orders_by_customer as get_orders_by_customer_service,
    update_customer as update_customer_service,
)
from services.order_service import serialize_order

router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)


@router.get("/", response_model=list[CustomerResponse])
def get_customers(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    search: str | None = None,
    db: Session = Depends(get_db)
):
    return get_all_customers_service(db, page, limit, search)


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    if db.query(Customer).filter(Customer.email == customer.email).first():
        raise HTTPException(status_code=409, detail="Customer with this email already exists")
    return create_customer_service(db, customer.model_dump())


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = get_customer_by_id_service(db, customer_id)

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)):
    record = get_customer_by_id_service(db, customer_id)
    if not record:
        raise HTTPException(status_code=404, detail="Customer not found")
    duplicate = db.query(Customer).filter(Customer.email == customer.email, Customer.id != customer_id).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Customer with this email already exists")
    return update_customer_service(db, customer_id, customer.model_dump())


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    record = get_customer_by_id_service(db, customer_id)
    if not record:
        raise HTTPException(status_code=404, detail="Customer not found")
    if db.query(Order).filter(Order.customer_id == customer_id).count():
        raise HTTPException(status_code=409, detail="Customers with orders cannot be deleted")
    delete_customer_service(db, customer_id)


@router.get("/{customer_id}/orders", response_model=list[OrderResponse])
def get_customer_orders(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = get_customer_by_id_service(db, customer_id)

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return [
        serialize_order(db, order)
        for order in get_orders_by_customer_service(db, customer_id)
    ]