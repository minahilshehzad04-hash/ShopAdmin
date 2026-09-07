"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { OrderTable } from "@/components/ui/ResourceTable";
import { StateMessage } from "@/components/ui/StateMessage";
import { FormModal } from "@/components/ui/FormModal";
import { OrderForm } from "@/components/orders/OrderForm";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { useOrders } from "@/hooks/useOrders";

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      setShowForm(true);
    }
    const viewId = params.get("view");
    if (viewId) {
      setSelectedOrderId(viewId);
    }
  }, []);

  const { data, total, pages, loading, error } = useOrders({
    page,
    limit: 10,
    search,
    status,
    start_date: startDate,
    end_date: endDate,
  });

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <DashboardLayout>
      <div className="content">
        <PageHeader
          eyebrow="Workspace / Orders"
          title="Orders"
          subtitle="Search, filter and manage fulfillment."
          action={{
            label: "+ Add order",
            onClick: () => setShowForm(true),
          }}
        />

        <section className="panel order-filters">
          <input
            aria-label="Search orders"
            placeholder="Search order ID or customer"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
          />
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
          <label>
            From{" "}
            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            To{" "}
            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPage(1);
              }}
            />
          </label>
        </section>

        {loading ? (
          <StateMessage>Loading orders...</StateMessage>
        ) : error ? (
          <StateMessage>Could not load orders. Start the FastAPI server.</StateMessage>
        ) : (
          <section className="panel management-panel">
            <div className="section-title">
              <h2>Order list</h2>
              <span>{total} records</span>
            </div>
            {data.length ? (
              <>
                <OrderTable
                  items={data}
                  onViewOrder={(item) => setSelectedOrderId(item.id)}
                />
                <div className="pagination">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {pages || 1}
                  </span>
                  <button
                    disabled={page >= pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <StateMessage>No orders match these filters.</StateMessage>
            )}
          </section>
        )}

        {/* Add Order Popup Modal */}
        {showForm && (
          <FormModal
            title="Add order"
            subtitle="Create a new customer order and assign items."
            onClose={() => setShowForm(false)}
          >
            <OrderForm
              onCancel={() => setShowForm(false)}
              onSaved={() => {
                setShowForm(false);
                window.location.reload();
              }}
            />
          </FormModal>
        )}

        {/* Order Details & Status Update Popup Modal */}
        {selectedOrderId && (
          <OrderDetailsModal
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
            onUpdated={() => {
              window.location.reload();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
