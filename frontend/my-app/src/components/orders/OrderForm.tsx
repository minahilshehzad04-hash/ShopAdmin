"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { customerService } from "@/services/customerService";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";

export function OrderForm({
  onSaved,
  onCancel,
}: {
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [totalAmount, setTotalAmount] = useState("");
  const [status, setStatus] = useState("Pending");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([customerService.list(), productService.list()])
      .then(([customerList, productResult]) => {
        setCustomers(customerList);
        setProducts(productResult.items);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load order options")
      );
  }, []);

  const selectedProduct = products.find(
    (product) => product.id === Number(productId)
  );
  const calculatedTotal = selectedProduct
    ? selectedProduct.price * Number(quantity || 0)
    : 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!customerId) return setError("Please select a customer.");
    if (!selectedProduct) return setError("Please select a product.");
    if (Number(quantity) <= 0) return setError("Quantity must be greater than 0.");

    setSubmitting(true);
    try {
      await orderService.create({
        customer_id: Number(customerId),
        total_amount: Number(totalAmount || calculatedTotal),
        status,
        items: [
          {
            product_id: selectedProduct.id,
            quantity: Number(quantity),
            price: selectedProduct.price,
          },
        ],
      });
      if (onSaved) {
        onSaved();
      } else {
        router.push("/orders");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel settings-list modal-form-layout" onSubmit={submit}>
      {error && <p className="danger-text">{error}</p>}
      <label className="setting-row">
        <b>Customer *</b>
        <select
          required
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
        >
          <option value="">Select customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} ({customer.email})
            </option>
          ))}
        </select>
      </label>
      <label className="setting-row">
        <b>Product *</b>
        <select
          required
          value={productId}
          onChange={(event) => {
            setProductId(event.target.value);
            setTotalAmount("");
          }}
        >
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} — ${Number(product.price).toFixed(2)} (Stock: {product.stock})
            </option>
          ))}
        </select>
      </label>
      <label className="setting-row">
        <b>Quantity *</b>
        <input
          required
          min="1"
          step="1"
          type="number"
          value={quantity}
          onChange={(event) => {
            setQuantity(event.target.value);
            setTotalAmount("");
          }}
        />
      </label>
      <label className="setting-row">
        <b>Total Amount ($)</b>
        <input
          min="0"
          step="0.01"
          type="number"
          placeholder={calculatedTotal > 0 ? calculatedTotal.toFixed(2) : "Auto-calculated"}
          value={totalAmount}
          onChange={(event) => setTotalAmount(event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>Initial Status</b>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </label>
      <div className="modal-form-actions">
        {onCancel && (
          <button type="button" className="date-filter modal-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create order"}
        </button>
      </div>
    </form>
  );
}