"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StockTable } from "@/components/products/StockTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { StateMessage } from "@/components/ui/StateMessage";
import { FormModal } from "@/components/ui/FormModal";
import { ProductForm } from "@/components/products/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";

export default function InventoryPage() {
  const { data, loading, error } = useProducts({ limit: 100, sort: "stock" });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const lowStock = data.filter((product) => product.stock <= 5);

  return (
    <DashboardLayout>
      <div className="content">
        <PageHeader
          eyebrow="Reports / Inventory"
          title="Inventory"
          subtitle="Monitor stock levels and quickly update product quantities."
        />
        <section className="metric-grid">
          <StatCard label="Total units" value={data.reduce((sum, p) => sum + p.stock, 0).toLocaleString()} tone="violet" />
          <StatCard label="Low stock" value={lowStock.length.toLocaleString()} tone="red" />
          <StatCard label="Catalog items" value={data.length.toLocaleString()} tone="green" />
        </section>
        {loading ? (
          <StateMessage>Loading inventory...</StateMessage>
        ) : error ? (
          <StateMessage>Could not load inventory.</StateMessage>
        ) : (
          <section className="panel management-panel">
            <div className="section-title">
              <h2>Stock levels</h2>
              <span>{data.length} products</span>
            </div>
            {data.length ? (
              <StockTable
                products={data}
                onEdit={(item) => setEditingProduct(item)}
              />
            ) : (
              <StateMessage>No inventory records yet.</StateMessage>
            )}
          </section>
        )}

        {/* Edit Product Popup Modal from Inventory */}
        {editingProduct && (
          <FormModal
            title={`Edit Product: ${editingProduct.name}`}
            subtitle="Update product inventory and details."
            onClose={() => setEditingProduct(null)}
          >
            <ProductForm
              product={editingProduct}
              onCancel={() => setEditingProduct(null)}
              onSaved={() => {
                setEditingProduct(null);
                window.location.reload();
              }}
            />
          </FormModal>
        )}
      </div>
    </DashboardLayout>
  );
}