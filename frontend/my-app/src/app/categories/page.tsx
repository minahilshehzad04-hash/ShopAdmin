"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoryTable } from "@/components/ui/ResourceTable";
import { StateMessage } from "@/components/ui/StateMessage";
import { FormModal } from "@/components/ui/FormModal";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { categoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const loadCategories = useCallback(() => {
    setLoading(true);
    categoryService
      .list()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCategories();

    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "new") {
      setShowForm(true);
    }
    const editId = params.get("edit");
    if (editId) {
      categoryService.get(editId).then(setEditingCategory).catch(() => undefined);
    }
  }, [loadCategories]);

  return (
    <DashboardLayout>
      <div className="content">
        <PageHeader
          eyebrow="Workspace / Categories"
          title="Categories"
          subtitle="Organize products into clear groups."
          action={{
            label: "+ Add category",
            onClick: () => setShowForm(true),
          }}
        />

        {loading ? (
          <StateMessage>Loading categories...</StateMessage>
        ) : (
          <section className="panel management-panel">
            <div className="section-title">
              <h2>Category list</h2>
              <span>{data.length} records</span>
            </div>
            {data.length ? (
              <CategoryTable
                items={data}
                onEdit={(item) => setEditingCategory(item)}
              />
            ) : (
              <StateMessage>No categories yet.</StateMessage>
            )}
          </section>
        )}

        {/* Add Category Modal */}
        {showForm && (
          <FormModal
            title="Add category"
            subtitle="Create a new product grouping."
            onClose={() => setShowForm(false)}
          >
            <CategoryForm
              onCancel={() => setShowForm(false)}
              onSaved={() => {
                setShowForm(false);
                loadCategories();
              }}
            />
          </FormModal>
        )}

        {/* Edit Category Modal */}
        {editingCategory && (
          <FormModal
            title={`Edit Category: ${editingCategory.name}`}
            subtitle="Update the category title and description."
            onClose={() => setEditingCategory(null)}
          >
            <CategoryForm
              category={editingCategory}
              onCancel={() => setEditingCategory(null)}
              onSaved={() => {
                setEditingCategory(null);
                loadCategories();
              }}
            />
          </FormModal>
        )}
      </div>
    </DashboardLayout>
  );
}
