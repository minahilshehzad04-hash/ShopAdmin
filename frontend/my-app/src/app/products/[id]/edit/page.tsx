"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProductRedirectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/products/${id}?action=edit`);
    } else {
      router.replace("/products");
    }
  }, [id, router]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
      Opening edit form...
    </div>
  );
}