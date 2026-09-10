from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from db.dependencies import get_db
from models.product import Product
from models.category import Category
from models.order_item import OrderItem
from schemas.product import ProductCreate, ProductListResponse, ProductResponse, SellProduct, StockUpdate
from services.product_service import (
    create_product as create_product_service,
    delete_product as delete_product_service,
    get_all_products as get_all_products_service,
    get_product_by_id as get_product_by_id_service,
    sell_product as sell_product_service,
    update_product as update_product_service,
    update_product_stock as update_product_stock_service,
)

router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)

@router.patch("/{product_id}/stock", response_model=ProductResponse,status_code=200)
def update_product_stock(product_id: int, payload: StockUpdate, db: Session = Depends(get_db)):
    product = update_product_stock_service(db, product_id, payload.stock)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/{product_id}/sell", response_model=ProductResponse, status_code=200)
def sell_product(product_id: int, payload: SellProduct, db: Session = Depends(get_db)):
    try:
        product = sell_product_service(db, product_id, payload.quantity)
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

#  create product
@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    # Check if category exists
    category = (
        db.query(Category)
        .filter(Category.id == product.category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    if db.query(Product).filter(Product.sku == product.sku).first():
        raise HTTPException(status_code=409, detail="Product with this SKU already exists")

    return create_product_service(db, product.model_dump())

# update product
@router.put("/{product_id}", response_model=ProductResponse, status_code=200)
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    existing_product = get_product_by_id_service(db, product_id)

    if not existing_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    duplicate_sku = db.query(Product).filter(Product.sku == product.sku, Product.id != product_id).first()
    if duplicate_sku:
        raise HTTPException(status_code=409, detail="Product with this SKU already exists")

    category = (
        db.query(Category)
        .filter(Category.id == product.category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return update_product_service(db, product_id, product.model_dump())

# delete product
@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = get_product_by_id_service(db, product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if db.query(OrderItem).filter_by(product_id=product_id).count():
        raise HTTPException(status_code=409, detail="Products used in orders cannot be deleted")

    delete_product_service(db, product_id)

# get all products
@router.get("/", response_model=ProductListResponse, status_code=200)
def get_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    search: str | None = None,
    category_id: int | None = Query(default=None, gt=0),
    status: str | None = None,
    stock: str | None = Query(default=None, pattern="^(in_stock|low_stock|out_of_stock)$"),
    sort: str = Query(default="name", pattern="^(name|price|stock)$"),
    db: Session = Depends(get_db)
):
    products, total = get_all_products_service(
        db, page, limit, search, category_id, status, stock, sort
    )
    return {"items": products, "total": total, "page": page, "limit": limit, "pages": ceil(total / limit) if total else 0}


# get product by id
@router.get("/{product_id}", response_model=ProductResponse, status_code=200)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = get_product_by_id_service(db, product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product

