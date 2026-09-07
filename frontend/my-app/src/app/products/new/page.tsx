"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewProductRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/products?action=new");
  }, [router]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
      Opening new product form...
    </div>
  );
}
