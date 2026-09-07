from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.dependencies import get_db
from schemas.order_item import OrderItemCreate, OrderItemResponse
from services.order_item_service import (
    create_order_item as create_order_item_service,
    get_all_order_items as get_all_order_items_service,
    get_order_item_by_id as get_order_item_by_id_service,
)

router = APIRouter(
    prefix="/api/order-items",
    tags=["Order Items"]
)

@router.post("/", response_model=OrderItemResponse)
def create_order_item(
    item: OrderItemCreate,
    db: Session = Depends(get_db)
):
    try:
        return create_order_item_service(db, item.model_dump())
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.get("/", response_model=list[OrderItemResponse])
def get_order_items(
    db: Session = Depends(get_db)
):
    return get_all_order_items_service(db)


@router.get("/{item_id}", response_model=OrderItemResponse)
def get_order_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    item = get_order_item_by_id_service(db, item_id)

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Order item not found"
        )

    return item