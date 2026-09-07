import argparse
from datetime import datetime, timedelta
from decimal import Decimal
import random

from db.database import Base, SessionLocal, engine
from models.category import Category
from models.customer import Customer
from models.order import Order
from models.order_item import OrderItem
from models.product import Product


CATEGORIES = [
    ("Laptops & Computers", "High-performance laptops, workstations, and ultrabooks"),
    ("Smartphones & Tablets", "Flagship phones, tablets, and mobile devices"),
    ("Audio & Headphones", "Wireless headphones, studio monitors, and earbuds"),
    ("Monitors & Displays", "4K, OLED, and ultrawide curved displays"),
    ("PC Components & Storage", "High-speed NVMe SSDs, memory, and graphics cards"),
    ("Gaming & Consoles", "Gaming consoles, controllers, and handheld devices"),
    ("Wearables & Smart Home", "Smartwatches, fitness trackers, and connected devices"),
    ("Peripherals & Accessories", "Mechanical keyboards, ergonomic mice, and hubs"),
]

PRODUCTS = [
    ("MacBook Pro 16\" M3 Max", "Laptops & Computers", "3499.00", 6, "MBP-16-M3MAX", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80"),
    ("MacBook Air 15\" M2", "Laptops & Computers", "1299.00", 14, "MBA-15-M2-512", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&q=80"),
    ("Dell XPS 15 OLED", "Laptops & Computers", "1899.00", 8, "DELL-XPS15-9530", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&q=80"),
    ("Lenovo ThinkPad X1 Carbon Gen 11", "Laptops & Computers", "1449.00", 5, "LEN-X1C-G11", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&q=80"),
    ("ASUS ROG Zephyrus G16", "Laptops & Computers", "1999.00", 4, "ASUS-ROG-G16", "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&q=80"),

    ("iPhone 15 Pro Max 256GB", "Smartphones & Tablets", "1199.00", 22, "IPH-15PM-256", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&q=80"),
    ("Samsung Galaxy S24 Ultra", "Smartphones & Tablets", "1299.00", 18, "SAM-S24U-512", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&q=80"),
    ("Google Pixel 8 Pro 128GB", "Smartphones & Tablets", "899.00", 11, "PIX-8P-128", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&q=80"),
    ("iPad Pro 12.9\" M2", "Smartphones & Tablets", "1099.00", 9, "APP-IPAD-129", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80"),

    ("Sony WH-1000XM5 Wireless Headphones", "Audio & Headphones", "399.00", 3, "SNY-WH1000XM5", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80"),
    ("Apple AirPods Pro 2", "Audio & Headphones", "249.00", 28, "APP-AIRPOD-P2", "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&q=80"),
    ("Bose QuietComfort Ultra", "Audio & Headphones", "429.00", 12, "BSE-QCU-001", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&q=80"),
    ("Marshall Stanmore III Speaker", "Audio & Headphones", "379.00", 7, "MSH-STN-3", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&q=80"),

    ("Dell UltraSharp 32\" 4K USB-C Monitor", "Monitors & Displays", "749.00", 6, "DEL-U3223QE", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80"),
    ("LG 34\" UltraWide Curved OLED Monitor", "Monitors & Displays", "999.00", 4, "LG-34GS95QE", "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=300&q=80"),
    ("Samsung 49\" Odyssey OLED G9", "Monitors & Displays", "1499.00", 2, "SAM-ODY-G9-49", "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=300&q=80"),

    ("Samsung 990 PRO 2TB NVMe SSD", "PC Components & Storage", "179.00", 25, "SAM-990P-2TB", "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&q=80"),
    ("Crucial T700 2TB Gen5 NVMe SSD", "PC Components & Storage", "279.00", 8, "CRU-T700-2TB", "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=300&q=80"),
    ("SanDisk 1TB Extreme Portable SSD", "PC Components & Storage", "129.00", 16, "SND-EXT-1TB", "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=300&q=80"),

    ("PlayStation 5 Slim 1TB", "Gaming & Consoles", "499.00", 15, "SNY-PS5-SLIM", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&q=80"),
    ("Xbox Series X 1TB", "Gaming & Consoles", "499.00", 10, "MSF-XSX-1TB", "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=300&q=80"),
    ("Nintendo Switch OLED Model", "Gaming & Consoles", "349.00", 0, "NIN-SWT-OLED", "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=300&q=80"),

    ("Apple Watch Ultra 2", "Wearables & Smart Home", "799.00", 13, "APP-WCH-U2", "https://images.unsplash.com/photo-1509741102003-ca64bfe5f069?w=300&q=80"),
    ("Garmin Fenix 7 Pro Sapphire Solar", "Wearables & Smart Home", "899.00", 7, "GAR-FNX-7P", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80"),

    ("Logitech MX Master 3S Wireless Mouse", "Peripherals & Accessories", "99.00", 35, "LOG-MXM-3S", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&q=80"),
    ("Keychron Q1 Pro Wireless Keyboard", "Peripherals & Accessories", "199.00", 17, "KEY-Q1P-RGB", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80"),
    ("Anker Prime 100W GaN Charger", "Peripherals & Accessories", "79.00", 40, "ANK-PRM-100W", "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80"),
    ("Elgato Stream Deck MK.2", "Peripherals & Accessories", "149.00", 12, "ELG-STRM-MK2", "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&q=80"),
]

CUSTOMERS = [
    ("Ava Mitchell", "ava.mitchell@example.com", "+1 555-0101", "742 Evergreen Terrace, Springfield, OR"),
    ("Liam Carter", "liam.carter@example.com", "+1 555-0102", "100 Main St, Austin, TX"),
    ("Noah Bennett", "noah.bennett@example.com", "+1 555-0103", "456 Elm St, Seattle, WA"),
    ("Emma Brooks", "emma.brooks@example.com", "+1 555-0104", "789 Pine Ave, Denver, CO"),
    ("Oliver Hayes", "oliver.hayes@example.com", "+1 555-0105", "321 Oak Dr, Chicago, IL"),
    ("Sophia Reed", "sophia.reed@example.com", "+1 555-0106", "654 Maple St, Boston, MA"),
    ("Elijah Foster", "elijah.foster@example.com", "+1 555-0107", "987 Cedar Rd, Portland, OR"),
    ("Mia Collins", "mia.collins@example.com", "+1 555-0108", "147 Birch Way, San Francisco, CA"),
    ("James Parker", "james.parker@example.com", "+1 555-0109", "258 Walnut Ct, New York, NY"),
    ("Isabella Ward", "isabella.ward@example.com", "+1 555-0110", "369 Spruce Ln, Miami, FL"),
    ("Lucas Morgan", "lucas.morgan@example.com", "+1 555-0111", "741 Willow Dr, Atlanta, GA"),
    ("Amelia Cooper", "amelia.cooper@example.com", "+1 555-0112", "852 Aspen Ct, Phoenix, AZ"),
    ("Henry Richardson", "henry.richardson@example.com", "+1 555-0113", "963 Magnolia St, Nashville, TN"),
    ("Charlotte Cox", "charlotte.cox@example.com", "+1 555-0114", "159 Cypress Way, Raleigh, NC"),
    ("Benjamin Howard", "benjamin.howard@example.com", "+1 555-0115", "357 Redwood Blvd, San Diego, CA"),
    ("Evelyn Taylor", "evelyn.taylor@example.com", "+1 555-0116", "482 Sycamore St, Dallas, TX"),
    ("Alexander Wright", "alexander.wright@example.com", "+1 555-0117", "619 Hickory Rd, Minneapolis, MN"),
    ("Harper Diaz", "harper.diaz@example.com", "+1 555-0118", "735 Chestnut St, Philadelphia, PA"),
]


def seed(reset: bool = False) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if reset:
            print("Resetting existing catalog, orders, and customer data...")
            db.query(OrderItem).delete()
            db.query(Order).delete()
            db.query(Product).delete()
            db.query(Category).delete()
            db.query(Customer).delete()
            db.commit()

        # 1. Seed Categories
        if db.query(Category).count() == 0:
            category_objs = {name: Category(name=name, description=description) for name, description in CATEGORIES}
            db.add_all(category_objs.values())
            db.flush()
            print(f"Seeded {len(category_objs)} categories.")
        else:
            category_objs = {c.name: c for c in db.query(Category).all()}

        # 2. Seed Products
        if db.query(Product).count() == 0:
            products = []
            for name, cat_name, price, stock, sku, img in PRODUCTS:
                cat_id = category_objs[cat_name].id if cat_name in category_objs else list(category_objs.values())[0].id
                products.append(
                    Product(
                        name=name,
                        description=f"Premium {name} featuring the latest technology and top-tier build quality.",
                        price=Decimal(price),
                        stock=stock,
                        sku=sku,
                        status="Active",
                        image_url=img,
                        category_id=cat_id,
                    )
                )
            db.add_all(products)
            db.flush()
            print(f"Seeded {len(products)} products.")
        else:
            products = db.query(Product).all()

        # 3. Seed Customers
        if db.query(Customer).count() == 0:
            customers = [
                Customer(name=name, email=email, phone=phone, address=addr)
                for name, email, phone, addr in CUSTOMERS
            ]
            db.add_all(customers)
            db.flush()
            print(f"Seeded {len(customers)} customers.")
        else:
            customers = db.query(Customer).all()

        # 4. Seed Orders (Spread across the last 45 days with varying statuses)
        if db.query(Order).count() == 0:
            # 32 diverse orders across 45 days
            statuses_pool = [
                "Completed", "Completed", "Completed", "Processing",
                "Shipped", "Shipped", "Pending", "Cancelled"
            ]

            now = datetime.utcnow()
            orders_created = 0

            # Generate 32 realistic orders spread across 45 days
            for i in range(32):
                customer = customers[i % len(customers)]
                status = statuses_pool[i % len(statuses_pool)]

                # Distribute dates across last 45 days
                days_ago = int((45 - (i * 1.35)))
                if days_ago < 0:
                    days_ago = 0
                order_time = now - timedelta(days=days_ago, hours=(i * 3) % 24, minutes=(i * 17) % 60)

                # Select 1 to 3 items per order
                item_count = 1 + (i % 3)
                chosen_products = random.sample(products, k=min(item_count, len(products)))

                total = Decimal("0.00")
                order_items_to_add = []

                for prod in chosen_products:
                    qty = 1 if prod.price > 500 else (1 + (i % 2))
                    line_total = Decimal(str(prod.price)) * qty
                    total += line_total
                    order_items_to_add.append((prod.id, qty, Decimal(str(prod.price))))

                order = Order(
                    customer_id=customer.id,
                    status=status,
                    total_amount=total,
                    created_at=order_time,
                    updated_at=order_time + timedelta(hours=1),
                )
                db.add(order)
                db.flush()

                for prod_id, qty, price in order_items_to_add:
                    db.add(
                        OrderItem(
                            order_id=order.id,
                            product_id=prod_id,
                            quantity=qty,
                            price=price,
                        )
                    )
                orders_created += 1

            db.commit()
            print(f"Seeded {orders_created} orders spread across 45 days.")

        print("All seed data successfully generated and committed.")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed ShopAdmin with sample catalog data")
    parser.add_argument("--reset", action="store_true", help="Delete existing catalog, customer, and order data first")
    args = parser.parse_args()
    seed(reset=args.reset)
