from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from schemas.order_item import OrderItemResponse, OrderLineCreate


class OrderBase(BaseModel):
    customer_id: int
    total_amount: Decimal = Field(default=0, ge=0)
    status: str = "Pending"


class OrderCreate(OrderBase):
    items: list[OrderLineCreate] = []


class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    customer_name: str | None = None
    customer_email: str | None = None
    items: list[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    limit: int
    pages: int


class OrderStatusUpdate(BaseModel):
    status: str

