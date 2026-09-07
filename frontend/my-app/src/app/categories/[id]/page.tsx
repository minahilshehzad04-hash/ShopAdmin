"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StateMessage } from "@/components/ui/StateMessage";
import { FormModal } from "@/components/ui/FormModal";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Category>();
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const loadCategory = useCallback(() => {
    if (!id) return;
    categoryService
      .get(id)
      .then(setItem)
      .catch(() => setError("Could not load category details."));
  }, [id]);

  useEffect(() => {
    loadCategory();

    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "edit") {
      setShowEditModal(true);
    }
  }, [loadCategory]);

  async function remove() {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoryService.remove(id);
      router.push("/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete category");
    }
  }

  return (
    <DashboardLayout>
      <div className="content">
        <PageHeader
          eyebrow={`Categories / #${id}`}
          title={item?.name || "Category details"}
          subtitle="Review the category description and catalog grouping."
          action={{ href: "/categories", label: "Back to categories" }}
        />
        {error && <p className="danger-text">{error}</p>}
        {item ? (
          <>
            <section className="panel settings-list">
              <div className="setting-row">
                <b>Description</b>
                <span>{item.description || "No description"}</span>
              </div>
              <div className="setting-row">
                <b>Products in this category</b>
                <span>{item.product_count ?? 0}</span>
              </div>
              <div className="setting-row">
                <b>Category ID</b>
                <span>#{item.id}</span>
              </div>
            </section>
            <div className="detail-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => setShowEditModal(true)}
              >
                Edit category
              </button>
              <button className="date-filter" type="button" onClick={remove}>
                Delete category
              </button>
            </div>
          </>
        ) : (
          <StateMessage>Loading category details...</StateMessage>
        )}

        {/* Edit Category Modal on Detail Page */}
        {showEditModal && item && (
          <FormModal
            title={`Edit Category: ${item.name}`}
            subtitle="Update the category title and description."
            onClose={() => setShowEditModal(false)}
          >
            <CategoryForm
              category={item}
              onCancel={() => setShowEditModal(false)}
              onSaved={() => {
                setShowEditModal(false);
                loadCategory();
              }}
            />
          </FormModal>
        )}
      </div>
    </DashboardLayout>
  );
}