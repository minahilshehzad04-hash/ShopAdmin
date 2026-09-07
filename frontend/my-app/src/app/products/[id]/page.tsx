"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StateMessage } from "@/components/ui/StateMessage";
import { FormModal } from "@/components/ui/FormModal";
import { ProductForm } from "@/components/products/ProductForm";
import { productService } from "@/services/productService";
import type { Product } from "@/types/product";
import { money } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Product>();
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const loadProduct = useCallback(() => {
    if (!id) return;
    productService
      .get(id)
      .then(setItem)
      .catch(() => setError("Could not load product details."));
  }, [id]);

  useEffect(() => {
    loadProduct();

    // Auto-open modal if URL contains ?action=edit
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "edit") {
      setShowEditModal(true);
    }
  }, [loadProduct]);

  async function remove() {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.remove(id);
      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product");
    }
  }

  async function toggleStatus() {
    if (!item) return;
    try {
      setItem(
        await productService.update(id, {
          ...item,
          status: item.status === "Active" ? "Inactive" : "Active",
        })
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update product status"
      );
    }
  }

  async function sell() {
    if (!item) return;
    try {
      setItem(await productService.sell(item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sell product");
    }
  }

  return (
    <DashboardLayout>
      <div className="content">
        <PageHeader
          eyebrow={`Products / #${id}`}
          title={item?.name || "Product details"}
          subtitle="Review catalog, pricing, and inventory information."
          action={{ href: "/products", label: "Back to products" }}
        />
        {error && <p className="danger-text">{error}</p>}
        {item ? (
          <div className="product-premium-view">
            <style dangerouslySetInnerHTML={{
              __html: `
              .product-premium-view {
                animation: fadeIn 0.4s ease-out forwards;
                display: flex;
                flex-direction: column;
                gap: 24px;
              }
              
              .premium-metrics {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
              }
              
              .premium-stat-card {
                background: linear-gradient(145deg, #ffffff, #f9f9fc);
                border: 1px solid rgba(91, 75, 223, 0.1);
                border-radius: 16px;
                padding: 24px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                position: relative;
                overflow: hidden;
              }
              
              .premium-stat-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 15px 35px -10px rgba(91, 75, 223, 0.15);
              }
              
              .premium-stat-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; height: 4px;
                background: linear-gradient(90deg, #5b4bdf, #8a7df0);
                opacity: 0;
                transition: opacity 0.3s;
              }
              
              .premium-stat-card:hover::before {
                opacity: 1;
              }

              .premium-stat-label {
                font-size: 13px;
                color: #64748b;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
              }

              .premium-stat-value {
                font-size: 32px;
                font-weight: 800;
                color: #1e293b;
                font-family: 'Space Grotesk', sans-serif;
                margin-bottom: 4px;
              }
              
              .premium-stat-sub {
                font-size: 13px;
                color: #94a3b8;
              }

              .premium-main-panel {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                display: flex;
                flex-direction: column;
              }
              
              .premium-main-content {
                display: flex;
                gap: 32px;
                padding: 32px;
              }

              .premium-image-wrap {
                flex: 0 0 250px;
                height: 250px;
                background: #f8fafc;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                border: 1px solid #f1f5f9;
              }
              
              .premium-image-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
              }
              
              .premium-image-wrap:hover img {
                transform: scale(1.05);
              }
              
              .premium-image-placeholder {
                font-size: 64px;
                color: #cbd5e1;
                font-weight: 700;
              }

              .premium-details {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 24px;
                justify-content: flex-start;
              }
              
              .premium-desc {
                font-size: 16px;
                line-height: 1.7;
                color: #475569;
              }
              
              .premium-meta {
                background: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                display: flex;
                gap: 24px;
                border: 1px solid #e2e8f0;
              }
              
              .premium-meta-item {
                display: flex;
                flex-direction: column;
                gap: 4px;
              }
              
              .premium-meta-label {
                font-size: 11px;
                text-transform: uppercase;
                color: #94a3b8;
                font-weight: 600;
                letter-spacing: 0.5px;
              }
              
              .premium-meta-value {
                font-size: 13px;
                color: #334155;
                font-weight: 500;
              }

              .premium-actions {
                background: #f8fafc;
                padding: 20px 32px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 12px;
                align-items: center;
              }

              .btn-premium {
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
              }
              
              .btn-premium:disabled {
                opacity: 0.6;
                cursor: not-allowed;
              }

              .btn-primary {
                background: #5b4bdf;
                color: white;
                box-shadow: 0 4px 12px rgba(91, 75, 223, 0.25);
              }
              
              .btn-primary:hover:not(:disabled) {
                background: #4a3cce;
                box-shadow: 0 6px 16px rgba(91, 75, 223, 0.35);
                transform: translateY(-1px);
              }

              .btn-secondary {
                background: white;
                color: #334155;
                border: 1px solid #cbd5e1;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
              }
              
              .btn-secondary:hover {
                background: #f1f5f9;
                border-color: #94a3b8;
              }
              
              .btn-danger {
                background: white;
                color: #ef4444;
                border: 1px solid #fecaca;
              }
              
              .btn-danger:hover {
                background: #fef2f2;
                border-color: #fca5a5;
              }

              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}} />

            <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '0' }}>
              <StatCard
                label="PRICE"
                value={money(Number(item.price))}
                tone="violet"
                subtext={`SKU: ${item.sku}`}
              />
              <StatCard
                label="STOCK STATUS"
                value={item.stock.toString()}
                tone="amber"
                subtext={<span style={{ color: item.status === 'Active' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{item.status}</span>}
              />
              <StatCard
                label="CATEGORY"
                value={`#${item.category_id}`}
                tone="blue"
                subtext={item.description ? "Has description" : "No description provided"}
              />
            </div>

            <div className="premium-main-panel">
              <div className="premium-main-content">
                <div className="premium-image-wrap">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <div className="premium-image-placeholder">{item.name[0]}</div>
                  )}
                </div>
                <div className="premium-details">
                  <div className="premium-desc">
                    {item.description || "No product description available for this item. Add a detailed description to help customers learn more."}
                  </div>

                  <div className="premium-meta">
                    <div className="premium-meta-item">
                      <span className="premium-meta-label">Created Date</span>
                      <span className="premium-meta-value">{item.created_at?.slice(0, 10) || "N/A"}</span>
                    </div>
                    <div className="premium-meta-item">
                      <span className="premium-meta-label">Last Updated</span>
                      <span className="premium-meta-value">{item.updated_at?.slice(0, 10) || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-actions">
                <button
                  className="btn-premium btn-primary"
                  type="button"
                  onClick={sell}
                  disabled={item.stock < 1}
                >
                  Sell 1 Unit
                </button>
                <button
                  className="btn-premium btn-secondary"
                  type="button"
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Details
                </button>
                <button
                  className="btn-premium btn-secondary"
                  type="button"
                  onClick={toggleStatus}
                >
                  Mark {item.status === "Active" ? "Inactive" : "Active"}
                </button>
                <div style={{ flex: 1 }} />
                <button className="btn-premium btn-danger" type="button" onClick={remove}>
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        ) : (
          <StateMessage>{error || "Loading product details..."}</StateMessage>
        )}

        {/* Edit Modal on Detail Page */}
        {showEditModal && item && (
          <FormModal
            title={`Edit Product: ${item.name}`}
            subtitle="Update catalog, pricing, and inventory details."
            onClose={() => setShowEditModal(false)}
          >
            <ProductForm
              product={item}
              onCancel={() => setShowEditModal(false)}
              onSaved={() => {
                setShowEditModal(false);
                loadProduct();
              }}
            />
          </FormModal>
        )}
      </div>
    </DashboardLayout>
  );
}