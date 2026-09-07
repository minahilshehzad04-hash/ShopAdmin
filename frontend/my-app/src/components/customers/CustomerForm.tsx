"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { customerService } from "@/services/customerService";
import type { Customer } from "@/types/customer";

export function CustomerForm({
  customer,
  onSaved,
  onCancel,
}: {
  customer?: Customer;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      };

      if (customer) {
        await customerService.update(String(customer.id), payload);
      } else {
        await customerService.create(payload);
      }

      if (onSaved) {
        onSaved();
      } else {
        router.push(customer ? `/customers/${customer.id}` : "/customers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${customer ? "update" : "create"} customer`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel settings-list modal-form-layout" onSubmit={submit}>
      {error && <p className="danger-text">{error}</p>}
      <label className="setting-row">
        <b>Full Name *</b>
        <input
          required
          placeholder="e.g. John Doe"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>Email Address *</b>
        <input
          required
          type="email"
          placeholder="e.g. john@example.com"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>Phone Number</b>
        <input
          type="tel"
          placeholder="e.g. +1 555-0192"
          value={form.phone}
          onChange={(event) => update("phone", event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>Address</b>
        <textarea
          rows={2}
          placeholder="e.g. 123 Main St, Suite 400, New York, NY"
          value={form.address}
          onChange={(event) => update("address", event.target.value)}
        />
      </label>
      <div className="modal-form-actions">
        {onCancel && (
          <button type="button" className="date-filter modal-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : customer ? "Save changes" : "Create customer"}
        </button>
      </div>
    </form>
  );
}