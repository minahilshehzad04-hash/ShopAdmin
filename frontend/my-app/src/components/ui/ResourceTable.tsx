import Link from "next/link";
import { money, titleCase } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { Order } from "@/types/order";
import type { Customer } from "@/types/customer";

export function ProductTable({
  items,
  onEdit,
}: {
  items: Product[];
  onEdit?: (item: Product) => void;
}) {
  return (
    <div className="management-table">
      <div className="management-table-head">
        <span>Product</span>
        <span>Price</span>
        <span>Stock</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      {items.map((item) => (
        <div className="management-table-row" key={item.id}>
          <span className="row-name">
            <i className="product-thumb">
              {item.image_url ? (
                <img src={item.image_url} alt="" />
              ) : (
                item.name[0]
              )}
            </i>
            <b>{item.name}</b>
          </span>
          <span>{money(Number(item.price))}</span>
          <span className={item.stock <= 5 ? "danger-text" : ""}>
            {item.stock} units
          </span>
          <span>
            <i className={`status ${item.status === "Active" ? "status-delivered" : "status-cancelled"}`}>
              {item.status}
            </i>
          </span>
          <div className="row-actions">
            {onEdit && (
              <button
                type="button"
                className="row-action edit-action-btn"
                onClick={() => onEdit(item)}
                title="Edit product in popup"
              >
                Edit
              </button>
            )}
            <Link className="row-action view-action-btn" href={`/products/${item.id}`}>
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryTable({
  items,
  onEdit,
}: {
  items: Category[];
  onEdit?: (item: Category) => void;
}) {
  return (
    <div className="management-table">
      <div className="management-table-head">
        <span>Category</span>
        <span>ID</span>
        <span>Description</span>
        <span>Products</span>
        <span>Actions</span>
      </div>
      {items.map((item) => (
        <div className="management-table-row" key={item.id}>
          <span className="row-name">
            <i className="category-icon">□</i>
            <b>{item.name}</b>
          </span>
          <span>#{item.id}</span>
          <span style={{ color: item.description ? "inherit" : "var(--muted)" }}>
            {item.description || "No description"}
          </span>
          <span>{item.product_count ?? 0} products</span>
          <div className="row-actions">
            {onEdit && (
              <button
                type="button"
                className="row-action edit-action-btn"
                onClick={() => onEdit(item)}
                title="Edit category in popup"
              >
                Edit
              </button>
            )}
            <Link className="row-action view-action-btn" href={`/categories/${item.id}`}>
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderTable({
  items,
  onViewOrder,
}: {
  items: Order[];
  onViewOrder?: (item: Order) => void;
}) {
  return (
    <div className="management-table order-table">
      <div className="management-table-head">
        <span>Order ID</span>
        <span>Customer</span>
        <span>Date</span>
        <span>Items</span>
        <span>Amount</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      {items.map((item) => (
        <div className="management-table-row" key={item.id}>
          <span>#{item.id}</span>
          <span>{item.customer_name || `Customer #${item.customer_id || ""}`}</span>
          <span>{item.created_at?.slice(0, 10) || "Today"}</span>
          <span>{item.items?.length || 0} lines</span>
          <span>{money(Number(item.total_amount))}</span>
          <span>
            <i className={`status status-${item.status.toLowerCase()}`}>
              {titleCase(item.status)}
            </i>
          </span>
          <div className="row-actions">
            {onViewOrder ? (
              <button
                type="button"
                className="row-action edit-action-btn"
                onClick={() => onViewOrder(item)}
                title="View & update status in popup"
              >
                View
              </button>
            ) : (
              <Link className="row-action view-action-btn" href={`/orders/${item.id}`}>
                View
              </Link>
            )}
            <Link className="row-action view-action-btn" href={`/orders/${item.id}`}>
              Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CustomerTable({
  items,
  onEdit,
}: {
  items: Customer[];
  onEdit?: (item: Customer) => void;
}) {
  return (
    <div className="management-table">
      <div className="management-table-head">
        <span>Customer</span>
        <span>Email</span>
        <span>ID</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      {items.map((item) => (
        <div className="management-table-row" key={item.id}>
          <span className="row-name">
            <i className="avatar">{item.name[0]}</i>
            <b>{item.name}</b>
          </span>
          <span>{item.email}</span>
          <span>#{item.id}</span>
          <span>
            <i className="status status-delivered">Active</i>
          </span>
          <div className="row-actions">
            {onEdit && (
              <button
                type="button"
                className="row-action edit-action-btn"
                onClick={() => onEdit(item)}
                title="Edit customer in popup"
              >
                Edit
              </button>
            )}
            <Link className="row-action view-action-btn" href={`/customers/${item.id}`}>
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
