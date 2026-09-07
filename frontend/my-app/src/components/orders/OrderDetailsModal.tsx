"use client";

import { useEffect, useState } from "react";
import { FormModal } from "@/components/ui/FormModal";
import { OrderStatus } from "@/components/orders/OrderStatus";
import { orderService } from "@/services/orderService";
import { money } from "@/lib/utils";
import type { Order } from "@/types/order";

export function OrderDetailsModal({
  orderId,
  onClose,
  onUpdated,
}: {
  orderId: number | string;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setLoading(true);
    orderService
      .get(String(orderId))
      .then((data) => {
        setOrder(data);
        setStatus(data.status.toLowerCase());
      })
      .catch(() => setError("Could not load order details."))
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleStatusUpdate() {
    if (!order) return;
    setError("");
    setSuccess("");
    setUpdating(true);
    try {
      const updated = await orderService.updateStatus(String(order.id), status);
      setOrder(updated);
      setSuccess("Order status updated successfully!");
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <FormModal
      title={`Order #${orderId}`}
      subtitle="Review order items, customer information and update status."
      onClose={onClose}
    >
      <div className="order-modal-content">
        {loading ? (
          <p className="empty-state">Loading order details...</p>
        ) : error && !order ? (
          <p className="danger-text">{error}</p>
        ) : order ? (
          <>
            {error && <p className="danger-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <div className="order-modal-header-info">
              <div className="order-modal-stat">
                <small>Customer</small>
                <strong>{order.customer_name || `Customer #${order.customer_id}`}</strong>
                <span>{order.customer_email || "No email provided"}</span>
              </div>
              <div className="order-modal-stat">
                <small>Total Amount</small>
                <strong>{money(Number(order.total_amount))}</strong>
                <span>Placed: {order.created_at?.slice(0, 10) || "Today"}</span>
              </div>
              <div className="order-modal-stat">
                <small>Current Status</small>
                <div style={{ marginTop: "6px" }}>
                  <OrderStatus status={order.status} />
                </div>
              </div>
            </div>

            <div className="order-modal-status-bar">
              <label>
                <b>Change Status:</b>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={updating}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <button
                className="primary-button"
                type="button"
                onClick={handleStatusUpdate}
                disabled={updating || status === order.status.toLowerCase()}
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>

            <div className="order-items-panel">
              <div className="section-title">
                <h2>Line Items</h2>
                <span>{order.items?.length || 0} items</span>
              </div>
              {order.items && order.items.length > 0 ? (
                <div className="order-items-list">
                  {order.items.map((line) => (
                    <div className="order-item-row" key={line.id}>
                      <span>
                        <b>{line.product_name || `Product #${line.product_id}`}</b>
                        <small>Product ID: #{line.product_id}</small>
                      </span>
                      <span>
                        {line.quantity} × {money(Number(line.price))}
                      </span>
                      <strong>{money(line.quantity * Number(line.price))}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No items attached to this order.</p>
              )}
            </div>

            <div className="modal-form-actions" style={{ marginTop: "24px" }}>
              <button className="date-filter modal-cancel-btn" type="button" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : null}
      </div>
    </FormModal>
  );
}
