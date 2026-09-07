from sqlalchemy.orm import Session

from models.order import Order
from models.order_item import OrderItem
from models.product import Product


def _with_product_name(db: Session, item: OrderItem):
    product = db.query(Product).filter(Product.id == item.product_id).first()
    item.product_name = product.name if product else None
    return item


def get_all_order_items(db: Session):
    items = db.query(OrderItem).all()
    products = {
        product.id: product.name
        for product in db.query(Product)
        .filter(Product.id.in_([item.product_id for item in items]))
        .all()
    } if items else {}

    for item in items:
        item.product_name = products.get(item.product_id)
    return items


def get_order_item_by_id(db: Session, item_id: int):
    item = db.query(OrderItem).filter(OrderItem.id == item_id).first()
    return _with_product_name(db, item) if item else None


def create_order_item(db: Session, item_data):
    order = db.query(Order).filter(Order.id == item_data["order_id"]).first()
    if not order:
        raise LookupError("Order not found")

    product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
    if not product:
        raise LookupError("Product not found")

    if order.status.lower() == "completed" and item_data["quantity"] > product.stock:
        raise ValueError("Insufficient stock for this order item")

    item = OrderItem(**item_data)
    db.add(item)
    db.commit()
    db.refresh(item)
    item.product_name = product.name
    return item
