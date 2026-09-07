from pydantic import BaseModel, Field
from decimal import Decimal
from pydantic import ConfigDict


class OrderItemBase(BaseModel):
    order_id: int
    product_id: int
    quantity: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)


class OrderItemCreate(OrderItemBase):
    pass


class OrderLineCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)


class OrderItemResponse(OrderItemBase):
    id: int
    product_name: str | None = None

    model_config = ConfigDict(from_attributes=True)

