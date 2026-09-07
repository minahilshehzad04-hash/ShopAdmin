"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProductTable } from "@/components/ui/ResourceTable";
import { StateMessage } from "@/components/ui/StateMessage";
import { FormModal } from "@/components/ui/FormModal";
import { ProductForm } from "@/components/products/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";

export default function StockReportPage() {
  const { data, loading, error } = useProducts({ limit: 100, sort: "stock" });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const lowStock = data.filter((product) => product.stock > 0 && product.stock <= 5);
  const outOfStock = data.filter((product) => product.stock === 0);
  const inStock = data.filter((product) => product.stock > 5);

  return (
    <DashboardLayout>
      <div className="content">
        <PageHeader
          eyebrow="Reports / Stock"
          title="Stock report"
          subtitle="Review stock health and replenishment needs."
          action={{ href: "/products", label: "View products" }}
        />
        <section className="metric-grid">
          <StatCard label="In stock" value={inStock.length.toLocaleString()} tone="green" />
          <StatCard label="Low stock" value={lowStock.length.toLocaleString()} tone="amber" />
          <StatCard label="Out of stock" value={outOfStock.length.toLocaleString()} tone="red" />
        </section>
        {loading ? (
          <StateMessage>Loading stock report...</StateMessage>
        ) : error ? (
          <StateMessage>Could not load stock report.</StateMessage>
        ) : (
          <section className="panel management-panel">
            <div className="section-title">
              <h2>Stock report</h2>
              <span>{data.length} products</span>
            </div>
            {data.length ? (
              <ProductTable
                items={data}
                onEdit={(item) => setEditingProduct(item)}
              />
            ) : (
              <StateMessage>No stock records yet.</StateMessage>
            )}
          </section>
        )}

        {/* Edit Product Modal */}
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