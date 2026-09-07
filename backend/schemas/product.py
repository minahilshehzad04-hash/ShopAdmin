from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field
from typing import Literal


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)  # mandatory to give this field
    description: str | None = None

    price: Decimal = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)

    sku: str = Field(..., min_length=1, max_length=100)

    image_url: str | None = None

    status: Literal["Active", "Inactive"] = "Active"

    category_id: int = Field(..., gt=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    limit: int
    pages: int


class StockUpdate(BaseModel):
    stock: int = Field(..., ge=0)


class SellProduct(BaseModel):
    quantity: int = Field(default=1, gt=0)