"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

export function CategoryForm({
  category,
  onSaved,
  onCancel,
}: {
  category?: Category;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return setError("Category name is required.");
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };
      if (category) {
        await categoryService.update(String(category.id), payload);
      } else {
        await categoryService.create(payload);
      }
      if (onSaved) {
        onSaved();
      } else {
        router.push(category ? `/categories/${category.id}` : "/categories");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save category");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel settings-list modal-form-layout" onSubmit={submit}>
      {error && <p className="danger-text">{error}</p>}
      <label className="setting-row">
        <b>Category Name *</b>
        <input
          required
          placeholder="e.g. Electronics, Clothing, Home & Living"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="setting-row">
        <b>Description</b>
        <textarea
          rows={3}
          placeholder="Describe the category grouping..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <div className="modal-form-actions">
        {onCancel && (
          <button type="button" className="date-filter modal-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : category ? "Save changes" : "Create category"}
        </button>
      </div>
    </form>
  );
}