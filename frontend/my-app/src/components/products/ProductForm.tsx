"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

export function ProductForm({
  product,
  onSaved,
  onCancel,
}: {
  product?: Product;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product ? String(product.price) : "",
    stock: product ? String(product.stock) : "0",
    sku: product?.sku || "",
    image_url: product?.image_url || "",
    status: product?.status || "Active",
    category_id: product ? String(product.category_id) : "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    categoryService
      .list()
      .then(setCategories)
      .catch(() => setError("Could not load categories."));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const price = Number(form.price);
    const stock = Number(form.stock);
    const categoryId = Number(form.category_id);

    if (!form.name.trim() || !form.sku.trim()) {
      return setError("Product name and SKU are required.");
    }
    if (!Number.isFinite(price) || price <= 0) {
      return setError("Enter a price greater than 0.");
    }
    if (!Number.isInteger(stock) || stock < 0) {
      return setError("Stock must be a whole number of 0 or more.");
    }
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return setError("Select a category.");
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      price,
      stock,
      category_id: categoryId,
    };

    setSubmitting(true);
    try {
      if (product) {
        await productService.update(String(product.id), payload);
      } else {
        await productService.create(payload);
      }
      if (onSaved) {
        onSaved();
      } else {
        router.push(product ? `/products/${product.id}` : "/products");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel settings-list modal-form-layout" onSubmit={submit}>
      {error && <p className="danger-text">{error}</p>}
      <label className="setting-row">
        <b>Product Name *</b>
        <input
          required
          placeholder="e.g. Wireless Noise-Cancelling Headphones"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>Description</b>
        <textarea
          rows={3}
          placeholder="Provide details about the product..."
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>SKU Code *</b>
        <input
          required
          placeholder="e.g. PROD-HD-001"
          value={form.sku}
          onChange={(event) => update("sku", event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>Price ($) *</b>
        <input
          required
          min="0.01"
          step="0.01"
          type="number"
          placeholder="e.g. 49.99"
          value={form.price}
          onChange={(event) => update("price", event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>Stock Units *</b>
        <input
          required
          min="0"
          step="1"
          type="number"
          placeholder="e.g. 25"
          value={form.stock}
          onChange={(event) => update("stock", event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>Category *</b>
        <select
          required
          value={form.category_id}
          onChange={(event) => update("category_id", event.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="setting-row">
        <b>Product Image URL</b>
        <input
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={form.image_url}
          onChange={(event) => update("image_url", event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>Status</b>
        <select
          value={form.status}
          onChange={(event) => update("status", event.target.value)}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </label>
      <div className="modal-form-actions">
        {onCancel && (
          <button type="button" className="date-filter modal-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}