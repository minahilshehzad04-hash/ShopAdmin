"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductTable } from "@/components/ui/ResourceTable";
import { StateMessage } from "@/components/ui/StateMessage";
import { FormModal } from "@/components/ui/FormModal";
import { ProductForm } from "@/components/products/ProductForm";
import { useProducts } from "@/hooks/useProducts";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [stock, setStock] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => undefined);

    // Check query params for action=new or edit=ID
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      setShowForm(true);
    }
    const editId = params.get("edit");
    if (editId) {
      productService.get(editId).then(setEditingProduct).catch(() => undefined);
    }
  }, []);

  const { data, total, pages, loading, error } = useProducts({
    page,
    limit: 10,
    search,
    category_id: categoryId ? Number(categoryId) : undefined,
    status,
    stock,
    sort,
  });

  function resetPage(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  return (
    <DashboardLayout>
      <div className="content">
        <PageHeader
          eyebrow="Workspace / Products"
          title="Products"
          subtitle="Search, filter and manage your catalog."
          action={{
            label: "+ Add product",
            onClick: () => setShowForm(true),
          }}
        />

        <section className="panel product-filters">
          <input
            placeholder="Search name or SKU"
            value={search}
            onChange={(event) => resetPage(setSearch, event.target.value)}
          />
          <select
            value={categoryId}
            onChange={(event) => resetPage(setCategoryId, event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => resetPage(setStatus, event.target.value)}
          >
            <option value="">All statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select
            value={stock}
            onChange={(event) => resetPage(setStock, event.target.value)}
          >
            <option value="">All stock</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
          <select
            value={sort}
            onChange={(event) => resetPage(setSort, event.target.value)}
          >
            <option value="name">Sort: Name</option>
            <option value="price">Sort: Price</option>
            <option value="stock">Sort: Stock</option>
          </select>
        </section>

        {loading ? (
          <StateMessage>Loading products...</StateMessage>
        ) : error ? (
          <StateMessage>Could not load products. Start the FastAPI server.</StateMessage>
        ) : (
          <section className="panel management-panel">
            <div className="section-title">
              <h2>Product list</h2>
              <span>{total} records</span>
            </div>
            {data.length ? (
              <>
                <ProductTable
                  items={data}
                  onEdit={(item) => setEditingProduct(item)}
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
              <StateMessage>No products match these filters.</StateMessage>
            )}
          </section>
        )}

        {/* Add Product Modal */}
        {showForm && (
          <FormModal
            title="Add product"
            subtitle="Fill in the product details to add it to your catalog."
            onClose={() => setShowForm(false)}
          >
            <ProductForm
              onCancel={() => setShowForm(false)}
              onSaved={() => {
                setShowForm(false);
                window.location.reload();
              }}
            />
          </FormModal>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <FormModal
            title={`Edit Product: ${editingProduct.name}`}
            subtitle="Update pricing, SKU, stock quantity and catalog grouping."
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
