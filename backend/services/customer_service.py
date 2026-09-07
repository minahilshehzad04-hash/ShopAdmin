from sqlalchemy.orm import Session

from models.customer import Customer
from models.order import Order


def get_all_customers(db: Session, page: int = 1, limit: int = 50, search: str | None = None):
	query = db.query(Customer)
	if search:
		search_filter = f"%{search}%"
		query = query.filter(
			(Customer.name.ilike(search_filter))
			| (Customer.email.ilike(search_filter))
		)
	return (
		query.order_by(Customer.name)
		.offset((page - 1) * limit)
		.limit(limit)
		.all()
	)


def get_customer_by_id(db: Session, customer_id: int):
	return db.query(Customer).filter(Customer.id == customer_id).first()


def get_orders_by_customer(db: Session, customer_id: int):
	return db.query(Order).filter(Order.customer_id == customer_id).all()


def create_customer(db: Session, customer_data):
	customer = Customer(**customer_data)
	db.add(customer)
	db.commit()
	db.refresh(customer)
	return customer


def update_customer(db: Session, customer_id: int, customer_data):
	customer = get_customer_by_id(db, customer_id)
	if not customer:
		return None

	for key, value in customer_data.items():
		setattr(customer, key, value)

	db.commit()
	db.refresh(customer)
	return customer


def delete_customer(db: Session, customer_id: int):
	customer = get_customer_by_id(db, customer_id)
	if not customer:
		return None

	db.delete(customer)
	db.commit()
