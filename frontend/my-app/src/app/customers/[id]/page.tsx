"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StateMessage } from "@/components/ui/StateMessage";
import { FormModal } from "@/components/ui/FormModal";
import { CustomerSummary } from "@/components/customers/CustomerSummary";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { customerService } from "@/services/customerService";
import type { Customer } from "@/types/customer";
import type { Order } from "@/types/order";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadCustomer = useCallback(() => {
    if (!id) return;
    customerService.get(id).then(setCustomer).catch(() => undefined);
    customerService.orders(id).then(setOrders).catch(() => undefined);
  }, [id]);

  useEffect(() => {
    loadCustomer();

    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "edit") {
      setShowEditModal(true);
    }
  }, [loadCustomer]);

  const totalSpent = orders
    .filter((order) => order.status.toLowerCase() !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <DashboardLayout>
      <div className="content">
        <PageHeader
          eyebrow={`Customers / #${id}`}
          title={customer?.name || "Customer details"}
          subtitle="Customer profile and purchase history."
          action={{ href: "/customers", label: "Back to customers" }}
        />
        {customer ? (
          <>
            <CustomerSummary customer={customer} />

            <div className="detail-actions" style={{ marginBottom: "20px" }}>
              <button
                className="primary-button"
                type="button"
                onClick={() => setShowEditModal(true)}
              >
                Edit customer
              </button>
            </div>

            <section className="management-metrics">
              <div className="management-stat">
                <small>Total orders</small>
                <strong>{orders.length}</strong>
                <span>Purchase history</span>
              </div>
              <div className="management-stat">
                <small>Total spent</small>
                <strong>${totalSpent.toFixed(2)}</strong>
                <span>Cancelled orders excluded</span>
              </div>
            </section>
            <section className="panel management-panel">
              <div className="section-title">
                <h2>Order history</h2>
                <span>{orders.length} orders</span>
              </div>
              {orders.length ? (
                orders.map((order) => (
                  <div className="table-row" key={order.id}>
                    <span>#{order.id}</span>
                    <span>{order.status}</span>
                    <span>{order.created_at?.slice(0, 10) || "Today"}</span>
                    <span>${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="empty-state">No orders placed by this customer yet.</p>
              )}
            </section>
          </>
        ) : (
          <StateMessage>Loading customer details...</StateMessage>
        )}

        {/* Edit Customer Modal */}
        {showEditModal && customer && (
          <FormModal
            title={`Edit Customer: ${customer.name}`}
            subtitle="Update customer profile details."
            onClose={() => setShowEditModal(false)}
          >
            <CustomerForm
              customer={customer}
              onCancel={() => setShowEditModal(false)}
              onSaved={() => {
                setShowEditModal(false);
                loadCustomer();
              }}
            />
          </FormModal>
        )}
      </div>
    </DashboardLayout>
  );
}
