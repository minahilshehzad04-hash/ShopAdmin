"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Product } from "@/types/product";
import { productService } from "@/services/productService";

export function StockTable({
  products,
  onEdit,
}: {
  products: Product[];
  onEdit?: (product: Product) => void;
}) {
  const [items, setItems] = useState(products);
  const [saving, setSaving] = useState<number>();

  useEffect(() => {
    setItems(products);
  }, [products]);

  async function save(product: Product, value: string) {
    const stock = Number(value);
    if (!Number.isInteger(stock) || stock < 0) return;
    setSaving(product.id);
    try {
      const updated = await productService.updateStock(product.id, stock);
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } finally {
      setSaving(undefined);
    }
  }

  return (
    <div className="management-table stock-table">
      <div className="management-table-head">
        <span>Product</span>
        <span>SKU</span>
        <span>Current stock</span>
        <span>Quick update</span>
        <span>Actions</span>
      </div>
      {items.map((product) => (
        <div className="management-table-row" key={product.id}>
          <span className="row-name">
            <i className="product-thumb">
              {product.image_url ? (
                <img src={product.image_url} alt="" />
              ) : (
                product.name[0]
              )}
            </i>
            <b>{product.name}</b>
          </span>
          <span>{product.sku}</span>
          <span className={product.stock <= 5 ? "danger-text" : ""}>
            {product.stock} units
          </span>
          <input
            aria-label={`Stock for ${product.name}`}
            type="number"
            min="0"
            step="1"
            defaultValue={product.stock}
            onBlur={(event) => save(product, event.target.value)}
            disabled={saving === product.id}
          />
          <div className="row-actions">
            {onEdit && (
              <button
                type="button"
                className="row-action edit-action-btn"
                onClick={() => onEdit(product)}
                title="Edit product in popup"
              >
                Edit
              </button>
            )}
            <Link
              className="row-action view-action-btn"
              href={`/products/${product.id}`}
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}