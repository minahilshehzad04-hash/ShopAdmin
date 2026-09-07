"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewCategoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/categories?action=new");
  }, [router]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
      Opening new category form...
    </div>
  );
}
