from sqlalchemy.orm import Session

from models.product import Product
from models.category import Category


def get_all_products(
    db: Session,
    page: int = 1,
    limit: int = 50,
    search: str | None = None,
    category_id: int | None = None,
    status: str | None = None,
    stock: str | None = None,
    sort: str = "name",
):
    query = db.query(Product)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_filter)) | (Product.sku.ilike(search_filter))
        )
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if status:
        query = query.filter(Product.status == status)
    if stock == "out_of_stock":
        query = query.filter(Product.stock == 0)
    elif stock == "low_stock":
        query = query.filter(Product.stock > 0, Product.stock <= 5)
    elif stock == "in_stock":
        query = query.filter(Product.stock > 5)

    total = query.count()
    products = (
        query.order_by(getattr(Product, sort))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return products, total


def get_product_by_id(db: Session, product_id: int):
    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )


def get_products_by_category(db: Session, category_id: int):
    return (
        db.query(Product)
        .filter(Product.category_id == category_id)
        .all()
    )


def create_product(db: Session, product_data):
    category = (
        db.query(Category)
        .filter(Category.id == product_data["category_id"])
        .first()
    )

    if not category:
        return None

    product = Product(**product_data)

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def update_product(db: Session, product_id: int, product_data):
    product = get_product_by_id(db, product_id)

    if not product:
        return None

    if "category_id" in product_data:
        category = (
            db.query(Category)
            .filter(Category.id == product_data["category_id"])
            .first()
        )

        if not category:
            return None

    for key, value in product_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return product


def delete_product(db: Session, product_id: int):
    product = get_product_by_id(db, product_id)

    if not product:
        return None

    db.delete(product)
    db.commit()

    return product


def update_product_stock(db: Session, product_id: int, stock: int):
    product = get_product_by_id(db, product_id)
    if not product:
        return None
    product.stock = stock
    db.commit()
    db.refresh(product)
    return product


def sell_product(db: Session, product_id: int, quantity: int):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .with_for_update()
        .first()
    )
    if not product:
        return None
    if product.stock < quantity:
        raise ValueError("Insufficient stock")
    product.stock -= quantity
    db.commit()
    db.refresh(product)
    return product