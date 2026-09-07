"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerTable } from "@/components/ui/ResourceTable";
import { StateMessage } from "@/components/ui/StateMessage";
import { FormModal } from "@/components/ui/FormModal";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { customerService } from "@/services/customerService";
import { useCustomers } from "@/hooks/useCustomers";
import type { Customer } from "@/types/customer";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { data, loading, error } = useCustomers(search);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      setShowForm(true);
    }
    const editId = params.get("edit");
    if (editId) {
      customerService.get(editId).then(setEditingCustomer).catch(() => undefined);
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="content">
        <PageHeader
          eyebrow="Workspace / Customers"
          title="Customers"
          subtitle="Search customer profiles and order history."
          action={{
            label: "+ Add customer",
            onClick: () => setShowForm(true),
          }}
        />

        <section className="panel product-filters">
          <input
            placeholder="Search name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </section>

        {loading ? (
          <StateMessage>Loading customers...</StateMessage>
        ) : error ? (
          <StateMessage>Could not load customers. Start the FastAPI server.</StateMessage>
        ) : (
          <section className="panel management-panel">
            <div className="section-title">
              <h2>Customer list</h2>
              <span>{data.length} records</span>
            </div>
            {data.length ? (
              <CustomerTable
                items={data}
                onEdit={(item) => setEditingCustomer(item)}
              />
            ) : (
              <StateMessage>No customers match your search.</StateMessage>
            )}
          </section>
        )}

        {/* Add Customer Modal */}
        {showForm && (
          <FormModal
            title="Add customer"
            subtitle="Create a new customer profile."
            onClose={() => setShowForm(false)}
          >
            <CustomerForm
              onCancel={() => setShowForm(false)}
              onSaved={() => {
                setShowForm(false);
                window.location.reload();
              }}
            />
          </FormModal>
        )}

        {/* Edit Customer Modal */}
        {editingCustomer && (
          <FormModal
            title={`Edit Customer: ${editingCustomer.name}`}
            subtitle="Update customer contact and shipping information."
            onClose={() => setEditingCustomer(null)}
          >
            <CustomerForm
              customer={editingCustomer}
              onCancel={() => setEditingCustomer(null)}
              onSaved={() => {
                setEditingCustomer(null);
                window.location.reload();
              }}
            />
          </FormModal>
        )}
      </div>
    </DashboardLayout>
  );
}
