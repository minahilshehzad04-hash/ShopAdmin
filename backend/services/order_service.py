from sqlalchemy.orm import Session

from models.order import Order
from models.order_item import OrderItem
from models.product import Product
from models.customer import Customer


def serialize_order(db: Session, order: Order):
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    products = {product.id: product.name for product in db.query(Product).filter(Product.id.in_([item.product_id for item in items])).all()} if items else {}
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": customer.name if customer else None,
        "customer_email": customer.email if customer else None,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": [{"id": item.id, "order_id": item.order_id, "product_id": item.product_id, "product_name": products.get(item.product_id), "quantity": item.quantity, "price": item.price} for item in items],
    }


def get_all_orders(db: Session, page=1, limit=10, search=None, status=None, start_date=None, end_date=None):
    query = db.query(Order).join(Customer, Customer.id == Order.customer_id)
    if search:
        search_filter = f"%{search}%"
        if search.isdigit():
            query = query.filter((Customer.name.ilike(search_filter)) | (Customer.email.ilike(search_filter)) | (Order.id == int(search)))
        else:
            query = query.filter((Customer.name.ilike(search_filter)) | (Customer.email.ilike(search_filter)))
    if status:
        query = query.filter(Order.status.ilike(status))
    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at < end_date)
    total = query.count()
    orders = query.order_by(Order.created_at.desc(), Order.id.desc()).offset((page - 1) * limit).limit(limit).all()
    return orders, total


def get_order_by_id(db: Session, order_id: int):
    return (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )


def get_orders_by_customer(db: Session, customer_id: int):
    return (
        db.query(Order)
        .filter(Order.customer_id == customer_id)
        .all()
    )


def create_order(db: Session, order_data):
    items = order_data.pop("items", [])
    order = Order(**order_data)

    db.add(order)
    db.flush()
    for item_data in items:
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        if not product:
            db.rollback()
            raise LookupError("Product not found")
        if order.status.lower() == "completed":
            if product.stock < item_data["quantity"]:
                db.rollback()
                raise ValueError("Insufficient stock to complete this order")
            product.stock -= item_data["quantity"]
        db.add(OrderItem(order_id=order.id, **item_data))
    db.commit()
    db.refresh(order)

    return order


def update_order(db: Session, order_id: int, order_data):
    order = get_order_by_id(db, order_id)

    if not order:
        return None

    for key, value in order_data.items():
        setattr(order, key, value)

    db.commit()
    db.refresh(order)

    return order


def delete_order(db: Session, order_id: int):
    order = get_order_by_id(db, order_id)

    if not order:
        return None

    db.delete(order)
    db.commit()

    return order


def update_order_status(db: Session, order_id: int, requested_status: str):
    order = get_order_by_id(db, order_id)
    if not order:
        return None

    current_status = (order.status or "pending").lower()
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

    if requested_status == "completed" and current_status != "completed":
        for item in items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
                .first()
            )
            if not product or product.stock < item.quantity:
                db.rollback()
                raise ValueError("Insufficient stock to complete this order")
            product.stock -= item.quantity
    elif current_status == "completed" and requested_status == "cancelled":
        for item in items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
                .first()
            )
            if product:
                product.stock += item.quantity

    order.status = requested_status.title()
    db.commit()
    db.refresh(order)
    return order