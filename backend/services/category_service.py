from sqlalchemy.orm import Session

from models.category import Category
from models.product import Product

# decides what to do with the data received from the API endpoints. It contains functions for creating, updating, deleting, and retrieving categories from the database. Each function interacts with the database using SQLAlchemy sessions and performs the necessary operations based on the provided data.
def get_all_categories(db: Session, page: int = 1, limit: int = 50):
    categories = (
        db.query(Category)
        .order_by(Category.name)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    for category in categories:
        category.product_count = (
            db.query(Product)
            .filter(Product.category_id == category.id)
            .count()
        )

    return categories


def get_category_by_id(db: Session, category_id: int):
    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if category:
        category.product_count = (
            db.query(Product)
            .filter(Product.category_id == category.id)
            .count()
        )

    return category


def create_category(db: Session, category_data):
    category = Category(**category_data)

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def update_category(db: Session, category_id: int, category_data):
    category = get_category_by_id(db, category_id)

    if not category:
        return None

    for key, value in category_data.items():
        setattr(category, key, value)

    db.commit()
    db.refresh(category)

    return category


def delete_category(db: Session, category_id: int):
    category = get_category_by_id(db, category_id)

    if not category:
        return None

    db.delete(category)
    db.commit()

    return category